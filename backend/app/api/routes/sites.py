import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db, settings
from app.models.metric import SiteMetric
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.metric import MetricCreate, MetricOut
from app.schemas.site import SiteCreate, SiteOut, SiteUpdate
from app.utils.geo_utils import validate_geojson_polygon

router = APIRouter(tags=["Sites & Metrics"])


def format_site_out(site: Site) -> SiteOut:
    """Helper to convert Site model into SiteOut Pydantic schema with GeoJSON dict."""
    geom_dict = site.get_geojson_geometry()
    if geom_dict is None:
        geom_dict = {"type": "Polygon", "coordinates": []}

    return SiteOut(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        description=site.description,
        geometry=geom_dict,
        area=site.area,
        land_use_type=site.land_use_type,
        created_at=site.created_at,
        updated_at=site.updated_at,
    )


@router.get("/projects/{project_id}/sites", response_model=list[SiteOut])
def list_project_sites(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all geographical sites associated with a specific project."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.created_by == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    sites = (
        db.query(Site).filter(Site.project_id == project_id).order_by(Site.created_at.desc()).all()
    )
    return [format_site_out(s) for s in sites]


@router.post(
    "/projects/{project_id}/sites",
    response_model=SiteOut,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    project_id: int,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new geographical site with GeoJSON polygon validation & geodesic area calculation."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.created_by == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )

    # Validate GeoJSON polygon and compute geodesic surface area (in hectares)
    poly_shape, calculated_area = validate_geojson_polygon(site_in.geometry)

    # Save format depending on database driver
    if settings.DATABASE_URL.startswith("postgresql"):
        from geoalchemy2.shape import from_shape

        geom_db_val = from_shape(poly_shape, srid=4326)
    else:
        # Save exact GeoJSON dictionary string for SQLite fallback
        geom_db_val = json.dumps(site_in.geometry)

    site = Site(
        project_id=project_id,
        name=site_in.name.strip(),
        description=site_in.description.strip() if site_in.description else None,
        geometry=geom_db_val,
        area=calculated_area,
        land_use_type=site_in.land_use_type.strip() if site_in.land_use_type else None,
    )

    db.add(site)
    db.commit()
    db.refresh(site)
    return format_site_out(site)


@router.get("/sites/{site_id}", response_model=SiteOut)
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed geographical site information including GeoJSON geometry."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.created_by == current_user.id)
        .first()
    )
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )
    return format_site_out(site)


@router.put("/sites/{site_id}", response_model=SiteOut)
def update_site(
    site_id: int,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update site metadata or geometry."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.created_by == current_user.id)
        .first()
    )
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    if site_in.name is not None:
        site.name = site_in.name.strip()
    if site_in.description is not None:
        site.description = site_in.description.strip()
    if site_in.land_use_type is not None:
        site.land_use_type = site_in.land_use_type.strip()

    if site_in.geometry is not None:
        poly_shape, calculated_area = validate_geojson_polygon(site_in.geometry)
        site.area = calculated_area

        if settings.DATABASE_URL.startswith("postgresql"):
            from geoalchemy2.shape import from_shape

            site.geometry = from_shape(poly_shape, srid=4326)
        else:
            site.geometry = json.dumps(site_in.geometry)

    db.commit()
    db.refresh(site)
    return format_site_out(site)


@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete site and associated environmental metrics."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.created_by == current_user.id)
        .first()
    )
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    db.delete(site)
    db.commit()


# --- Site Metrics Endpoints ---


@router.post(
    "/sites/{site_id}/metrics",
    response_model=MetricOut,
    status_code=status.HTTP_201_CREATED,
)
def add_site_metric(
    site_id: int,
    metric_in: MetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a new environmental metric observation for a site."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.created_by == current_user.id)
        .first()
    )
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    metric = SiteMetric(
        site_id=site_id,
        metric_name=metric_in.metric_name.strip(),
        metric_value=metric_in.metric_value,
        unit=metric_in.unit.strip(),
        recorded_at=metric_in.recorded_at,
        source=metric_in.source.strip() if metric_in.source else "Field Observation",
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("/sites/{site_id}/metrics", response_model=list[MetricOut])
def get_site_metrics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List historical environmental metrics for a site."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.created_by == current_user.id)
        .first()
    )
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found.",
        )

    metrics = (
        db.query(SiteMetric)
        .filter(SiteMetric.site_id == site_id)
        .order_by(SiteMetric.recorded_at.desc())
        .all()
    )
    return metrics
