def test_create_site_valid_polygon(client, auth_headers):
    """Test creating a geographical site with valid GeoJSON polygon geometry."""
    # Create project first
    proj_resp = client.post(
        "/api/projects",
        json={"name": "Wetland Protection", "project_type": "Biodiversity project"},
        headers=auth_headers,
    )
    proj_id = proj_resp.json()["id"]

    site_payload = {
        "name": "Site Alpha",
        "description": "North plot",
        "land_use_type": "Wetland",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [-100.0, 20.0],
                    [-99.9, 20.0],
                    [-99.9, 19.9],
                    [-100.0, 19.9],
                    [-100.0, 20.0],
                ]
            ],
        },
    }

    response = client.post(
        f"/api/projects/{proj_id}/sites", json=site_payload, headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Site Alpha"
    assert data["area"] > 0.0  # Geodesic area computed
    assert data["geometry"]["type"] == "Polygon"


def test_create_site_invalid_geometry(client, auth_headers):
    """Test site creation fails when polygon coordinates are invalid."""
    proj_resp = client.post(
        "/api/projects",
        json={"name": "Wetland Protection", "project_type": "Biodiversity project"},
        headers=auth_headers,
    )
    proj_id = proj_resp.json()["id"]

    # Invalid exterior ring (less than 4 coordinates)
    invalid_payload = {
        "name": "Bad Site",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[-100.0, 20.0], [-99.9, 20.0]]],
        },
    }

    response = client.post(
        f"/api/projects/{proj_id}/sites",
        json=invalid_payload,
        headers=auth_headers,
    )
    assert response.status_code == 422
