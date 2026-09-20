import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.metric import SiteMetric
from app.utils.geo_utils import validate_geojson_polygon


def seed_database(db: Session):
    """Populates development database with sample projects, sites, and synthetic metrics."""
    Base.metadata.create_all(bind=engine)

    admin_user = (
        db.query(User).filter(User.email == "admin@darukaa.earth").first()
    )
    if not admin_user:
        admin_user = User(
            full_name="Darukaa Admin User",
            email="admin@darukaa.earth",
            password_hash=get_password_hash("Darukaa2026!"),
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("[Seed] Created sample admin user: admin@darukaa.earth / Darukaa2026!")

    if db.query(Project).count() > 0:
        print("[Seed] Projects already exist in database. Skipping seed.")
        return

    sample_projects = [
        {
            "name": "Green Horizon Restoration",
            "description": "Large-scale forest ecosystem restoration and soil carbon sequestration initiative in Central Highlands.",
            "project_type": "Forest restoration",
            "location_name": "Central Highlands Reserve",
            "sites": [
                {
                    "name": "Restoration Sector A (North Ridge)",
                    "description": "Primary pine and oak canopy re-establishment zone.",
                    "land_use_type": "Degraded Forestland",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [-103.5200, 20.6500],
                                [-103.5100, 20.6500],
                                [-103.5100, 20.6400],
                                [-103.5200, 20.6400],
                                [-103.5200, 20.6500],
                            ]
                        ],
                    },
                    "metrics": [
                        ("Soil Organic Carbon", 2.1, "%", 180),
                        ("Soil Organic Carbon", 2.4, "%", 120),
                        ("Soil Organic Carbon", 2.8, "%", 60),
                        ("Soil Organic Carbon", 3.2, "%", 0),
                        ("Biodiversity Index", 45.0, "Score (0-100)", 180),
                        ("Biodiversity Index", 58.0, "Score (0-100)", 120),
                        ("Biodiversity Index", 66.0, "Score (0-100)", 60),
                        ("Biodiversity Index", 74.0, "Score (0-100)", 0),
                        ("Soil pH", 6.2, "pH scale", 180),
                        ("Soil pH", 6.4, "pH scale", 90),
                        ("Soil pH", 6.5, "pH scale", 0),
                        ("Vegetation Coverage", 35.0, "%", 180),
                        ("Vegetation Coverage", 52.0, "%", 120),
                        ("Vegetation Coverage", 68.0, "%", 60),
                        ("Vegetation Coverage", 82.0, "%", 0),
                    ],
                },
                {
                    "name": "Riparian Buffer Zone B",
                    "description": "Stream corridor revegetation to prevent soil erosion and improve aquatic biodiversity.",
                    "land_use_type": "Riparian Wetland",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [-103.5050, 20.6450],
                                [-103.4950, 20.6450],
                                [-103.4980, 20.6380],
                                [-103.5080, 20.6380],
                                [-103.5050, 20.6450],
                            ]
                        ],
                    },
                    "metrics": [
                        ("Soil Moisture", 28.5, "%", 120),
                        ("Soil Moisture", 32.0, "%", 60),
                        ("Soil Moisture", 35.4, "%", 0),
                        ("Biodiversity Index", 60.0, "Score (0-100)", 120),
                        ("Biodiversity Index", 72.0, "Score (0-100)", 60),
                        ("Biodiversity Index", 84.0, "Score (0-100)", 0),
                    ],
                },
            ],
        },
        {
            "name": "Native Habitat Recovery",
            "description": "Coastal wetland and mangrove conservation project safeguarding critical migratory bird habitats.",
            "project_type": "Biodiversity project",
            "location_name": "Pacific Coastal Wetland",
            "sites": [
                {
                    "name": "Mangrove Sanctuary Site C",
                    "description": "Red and black mangrove nursery zone monitored for biomass recovery.",
                    "land_use_type": "Coastal Wetland",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [-105.2200, 20.7100],
                                [-105.2100, 20.7100],
                                [-105.2100, 20.7000],
                                [-105.2200, 20.7000],
                                [-105.2200, 20.7100],
                            ]
                        ],
                    },
                    "metrics": [
                        ("Species Richness", 22.0, "Species count", 150),
                        ("Species Richness", 31.0, "Species count", 90),
                        ("Species Richness", 44.0, "Species count", 0),
                        ("Soil Organic Carbon", 4.1, "%", 150),
                        ("Soil Organic Carbon", 4.8, "%", 90),
                        ("Soil Organic Carbon", 5.5, "%", 0),
                    ],
                }
            ],
        },
        {
            "name": "Sustainable Land Management",
            "description": "Regenerative agriculture pilot project implementing cover cropping and biochar soil enrichment.",
            "project_type": "Land rehabilitation",
            "location_name": "Valley Farmlands",
            "sites": [
                {
                    "name": "Agroforestry Plot 1",
                    "description": "Silvopasture plot integrating native hardwood trees with rotational cattle grazing.",
                    "land_use_type": "Regenerative Agricultural Plot",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [-101.9000, 21.1500],
                                [-101.8900, 21.1500],
                                [-101.8900, 21.1400],
                                [-101.9000, 21.1400],
                                [-101.9000, 21.1500],
                            ]
                        ],
                    },
                    "metrics": [
                        ("Soil Organic Carbon", 1.8, "%", 180),
                        ("Soil Organic Carbon", 2.2, "%", 90),
                        ("Soil Organic Carbon", 2.7, "%", 0),
                        ("Soil pH", 5.8, "pH scale", 180),
                        ("Soil pH", 6.1, "pH scale", 90),
                        ("Soil pH", 6.5, "pH scale", 0),
                    ],
                }
            ],
        },
    ]

    for p_data in sample_projects:
        proj = Project(
            name=p_data["name"],
            description=p_data["description"],
            project_type=p_data["project_type"],
            location_name=p_data["location_name"],
            created_by=admin_user.id,
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)

        for s_data in p_data["sites"]:
            geom_json = s_data["geometry"]
            _, calculated_area = validate_geojson_polygon(geom_json)

            if db.bind.name == "postgresql":
                from geoalchemy2.shape import from_shape
                from shapely.geometry import shape

                geom_val = from_shape(shape(geom_json), srid=4326)
            else:
                geom_val = json.dumps(geom_json)

            site = Site(
                project_id=proj.id,
                name=s_data["name"],
                description=s_data["description"],
                land_use_type=s_data["land_use_type"],
                geometry=geom_val,
                area=calculated_area,
            )
            db.add(site)
            db.commit()
            db.refresh(site)

            now = datetime.now(timezone.utc)
            for m_name, m_val, m_unit, days_ago in s_data["metrics"]:
                rec_date = now - timedelta(days=days_ago)
                metric = SiteMetric(
                    site_id=site.id,
                    metric_name=m_name,
                    metric_value=m_val,
                    unit=m_unit,
                    recorded_at=rec_date,
                    source="Sample Data (Synthetic Measurement)",
                )
                db.add(metric)
            db.commit()

        print(f"[Seed] Created sample project '{proj.name}' with {len(p_data['sites'])} site(s).")


if __name__ == "__main__":
    db_session = SessionLocal()
    try:
        seed_database(db_session)
    finally:
        db_session.close()
