import json
from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, settings


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Use PostGIS Geometry if connecting to PostgreSQL, else Text for SQLite GeoJSON
    if settings.DATABASE_URL.startswith("postgresql"):
        geometry = Column(Geometry("POLYGON", srid=4326), nullable=False)
    else:
        geometry = Column(Text, nullable=False)

    area = Column(Float, nullable=False, default=0.0)  # In Hectares (ha)
    land_use_type = Column(String(100), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("Project", back_populates="sites")
    metrics = relationship("SiteMetric", back_populates="site", cascade="all, delete-orphan")

    def get_geojson_geometry(self):
        """Helper to get geometry dict regardless of DB engine."""
        if isinstance(self.geometry, str):
            try:
                return json.loads(self.geometry)
            except (json.JSONDecodeError, TypeError, ValueError):
                return None
        elif self.geometry is not None:
            # GeoAlchemy2 WKB / WKT element or GeoJSON dict conversion
            try:
                import shapely.geometry
                from geoalchemy2.shape import to_shape

                shape = to_shape(self.geometry)
                return shapely.geometry.mapping(shape)
            except (ImportError, TypeError, ValueError, AttributeError):
                return None
        return None
