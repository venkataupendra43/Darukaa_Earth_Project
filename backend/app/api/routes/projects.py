
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


def format_project_out(project: Project, db: Session) -> ProjectOut:
    """Computes aggregate site metrics (count & total area) for a project."""
    site_stats = (
        db.query(
            func.count(Site.id).label("site_count"),
            func.coalesce(func.sum(Site.area), 0.0).label("total_area"),
        )
        .filter(Site.project_id == project.id)
        .first()
    )

    site_count = site_stats.site_count if site_stats else 0
    total_area_ha = round(site_stats.total_area, 2) if site_stats else 0.0

    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        location_name=project.location_name,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        site_count=site_count,
        total_area_ha=total_area_ha,
    )


@router.get("", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all environmental projects created by current user."""
    projects = (
        db.query(Project)
        .filter(Project.created_by == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return [format_project_out(p, db) for p in projects]


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new environmental project."""
    project = Project(
        name=project_in.name.strip(),
        description=project_in.description.strip()
        if project_in.description
        else None,
        project_type=project_in.project_type.strip(),
        location_name=project_in.location_name.strip()
        if project_in.location_name
        else None,
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return format_project_out(project, db)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get project details by ID."""
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
    return format_project_out(project, db)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing environmental project."""
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

    if project_in.name is not None:
        project.name = project_in.name.strip()
    if project_in.description is not None:
        project.description = project_in.description.strip()
    if project_in.project_type is not None:
        project.project_type = project_in.project_type.strip()
    if project_in.location_name is not None:
        project.location_name = project_in.location_name.strip()

    db.commit()
    db.refresh(project)
    return format_project_out(project, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete project and associated sites and metrics."""
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

    db.delete(project)
    db.commit()
