from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    project_type: str = Field(..., min_length=2, max_length=100)
    location_name: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = None
    project_type: str | None = None
    location_name: str | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    project_type: str
    location_name: str | None = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    site_count: int | None = 0
    total_area_ha: float | None = 0.0

    model_config = ConfigDict(from_attributes=True)
