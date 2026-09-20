def test_create_project(client, auth_headers):
    """Test creating an environmental project."""
    payload = {
        "name": "Amazon Carbon Canopy",
        "description": "Rainforest protection project",
        "project_type": "Carbon project",
        "location_name": "Manaus Region",
    }
    response = client.post("/api/projects", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Amazon Carbon Canopy"
    assert data["project_type"] == "Carbon project"
    assert data["site_count"] == 0
    assert data["total_area_ha"] == 0.0


def test_list_projects(client, auth_headers):
    """Test retrieving user project list."""
    client.post(
        "/api/projects",
        json={"name": "Project A", "project_type": "Forest restoration"},
        headers=auth_headers,
    )
    client.post(
        "/api/projects",
        json={"name": "Project B", "project_type": "Biodiversity project"},
        headers=auth_headers,
    )

    response = client.get("/api/projects", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_unauthorized_project_access(client):
    """Test project API rejects unauthenticated requests."""
    response = client.get("/api/projects")
    assert response.status_code == 401
