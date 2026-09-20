def test_site_analytics(client, auth_headers):
    """Test retrieving analytics and aggregated metrics for a site."""
    proj_resp = client.post(
        "/api/projects",
        json={"name": "Analytics Proj", "project_type": "Carbon project"},
        headers=auth_headers,
    )
    proj_id = proj_resp.json()["id"]

    site_resp = client.post(
        f"/api/projects/{proj_id}/sites",
        json={
            "name": "Plot 101",
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
        },
        headers=auth_headers,
    )
    site_id = site_resp.json()["id"]

    # Add sample metrics
    client.post(
        f"/api/sites/{site_id}/metrics",
        json={"metric_name": "Soil Organic Carbon", "metric_value": 2.5, "unit": "%"},
        headers=auth_headers,
    )
    client.post(
        f"/api/sites/{site_id}/metrics",
        json={"metric_name": "Soil Organic Carbon", "metric_value": 3.1, "unit": "%"},
        headers=auth_headers,
    )

    response = client.get(f"/api/sites/{site_id}/analytics", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["site_name"] == "Plot 101"
    assert len(data["summaries"]) == 1
    soc_summary = data["summaries"][0]
    assert soc_summary["metric_name"] == "Soil Organic Carbon"
    assert soc_summary["min_value"] == 2.5
    assert soc_summary["max_value"] == 3.1
    assert soc_summary["mean_value"] == 2.8
    assert len(data["time_series"]) == 2
