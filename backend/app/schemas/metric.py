from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MetricCreate(BaseModel):
    metric_name: str = Field(..., min_length=2, max_length=100)
    metric_value: float
    unit: str = Field(..., min_length=1, max_length=50)
    recorded_at: datetime | None = None
    source: str | None = "Field Sensor / Observation"


class MetricOut(BaseModel):
    id: int
    site_id: int
    metric_name: str
    metric_value: float
    unit: str
    recorded_at: datetime
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricSummary(BaseModel):
    metric_name: str
    unit: str
    min_value: float
    max_value: float
    mean_value: float
    latest_value: float
    latest_date: datetime
    data_points: int


class AnalyticsOut(BaseModel):
    site_id: int
    site_name: str
    summaries: list[MetricSummary]
    time_series: list[MetricOut]
