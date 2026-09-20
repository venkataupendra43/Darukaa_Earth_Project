from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class GeoJSONPolygon(BaseModel):
    type: str = Field("Polygon", pattern="^Polygon$")
    coordinates: list[list[list[float]]]  # [[[lng, lat], [lng, lat], ...]]


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    geometry: dict[str, Any]  # GeoJSON Polygon
    land_use_type: str | None = None


class SiteUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = None
    geometry: dict[str, Any] | None = None
    land_use_type: str | None = None


class SiteOut(BaseModel):
    id: int
    project_id: int
    name: str
    description: str | None = None
    geometry: dict[str, Any]
    area: float  # In hectares
    land_use_type: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
