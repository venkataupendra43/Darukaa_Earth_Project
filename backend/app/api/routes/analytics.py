from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.metric import SiteMetric
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.metric import AnalyticsOut, MetricOut, MetricSummary

router = APIRouter(prefix="/sites", tags=["Analytics"])


@router.get("/{site_id}/analytics", response_model=AnalyticsOut)
def get_site_analytics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve structured environmental analytics and statistical summaries
    for Chart.js visualization.
    """
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
        .order_by(SiteMetric.recorded_at.asc())
        .all()
    )

    # Group metrics by metric name
    grouped = defaultdict(list)
    for m in metrics:
        grouped[m.metric_name].append(m)

    summaries: list[MetricSummary] = []
    for m_name, m_list in grouped.items():
        if not m_list:
            continue
        values = [m.metric_value for m in m_list]
        latest_item = max(m_list, key=lambda x: x.recorded_at)

        summaries.append(
            MetricSummary(
                metric_name=m_name,
                unit=latest_item.unit,
                min_value=round(min(values), 2),
                max_value=round(max(values), 2),
                mean_value=round(sum(values) / len(values), 2),
                latest_value=round(latest_item.metric_value, 2),
                latest_date=latest_item.recorded_at,
                data_points=len(values),
            )
        )

    time_series_out = [MetricOut.model_validate(m) for m in metrics]

    return AnalyticsOut(
        site_id=site.id,
        site_name=site.name,
        summaries=summaries,
        time_series=time_series_out,
    )
