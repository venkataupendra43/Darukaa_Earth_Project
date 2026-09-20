def test_health_check(client):
    """Test health check endpoint returns 200 OK and connected status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert data["database"] == "connected"
