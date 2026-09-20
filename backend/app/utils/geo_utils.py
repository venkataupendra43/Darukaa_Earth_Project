from typing import Any

from fastapi import HTTPException, status
from pyproj import Geod
from shapely.geometry import Polygon, shape

# WGS84 Geoid for calculating accurate geodesic surface area
geod = Geod(ellps="WGS84")


def validate_geojson_polygon(geometry_data: dict[str, Any]) -> tuple[Polygon, float]:
    """
    Validates a GeoJSON Polygon geometry object.
    Checks structure, ring closure, coordinate bounds, self-intersections,
    and returns the Shapely polygon object along with its geodesic area in hectares.
    """
    if not isinstance(geometry_data, dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid geometry format. Expected a GeoJSON object dictionary.",
        )

    geo_type = geometry_data.get("type")
    if geo_type != "Polygon":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported geometry type '{geo_type}'. Geometry must be a 'Polygon'.",
        )

    coordinates = geometry_data.get("coordinates")
    if not coordinates or not isinstance(coordinates, list) or len(coordinates) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid polygon coordinates structure.",
        )

    exterior_ring = coordinates[0]
    if not isinstance(exterior_ring, list) or len(exterior_ring) < 4:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A polygon exterior ring must contain at least 4 coordinate pairs.",
        )

    # Verify linear ring closure (first point equals last point)
    first_pt = exterior_ring[0]
    last_pt = exterior_ring[-1]
    if first_pt[0] != last_pt[0] or first_pt[1] != last_pt[1]:
        # Auto-close ring if missing
        exterior_ring.append(first_pt)

    # Validate coordinate ranges (Longitude -180..180, Latitude -90..90)
    for pt in exterior_ring:
        if len(pt) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Coordinate pair must contain longitude and latitude.",
            )
        lng, lat = pt[0], pt[1]
        if not (-180.0 <= lng <= 180.0 and -90.0 <= lat <= 90.0):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Coordinate [{lng}, {lat}] out of valid WGS84 range (Longitude -180..180, Latitude -90..90).",
            )

    try:
        polygon_shape = shape(geometry_data)
    except (ValueError, TypeError, AttributeError) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse polygon geometry: {e!s}",
        ) from e

    if not polygon_shape.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid polygon geometry (e.g. self-intersecting boundary).",
        )

    # Calculate geodesic area using WGS84 ellipsoid (returns square meters)
    poly_area_m2, _ = geod.geometry_area_perimeter(polygon_shape)
    poly_area_m2 = abs(poly_area_m2)

    # Convert m² to hectares (1 ha = 10,000 m²)
    area_hectares = round(poly_area_m2 / 10000.0, 4)

    return polygon_shape, area_hectares
