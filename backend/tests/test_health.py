def test_health_endpoint_returns_200(client):
    """Test that GET /api/health responds with status code 200."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_endpoint_payload_structure(client):
    """Test that GET /api/health returns the expected JSON structure."""
    response = client.get("/api/health")
    data = response.get_json()

    assert data is not None
    assert data["status"] == "healthy"
    assert data["service"] == "cloudresumeai-backend"
    assert "timestamp" in data
    assert "version" in data
    assert "environment" in data
    assert "database" in data
    assert "status" in data["database"]


def test_health_endpoint_method_not_allowed(client):
    """Test that POST /api/health returns 405 Method Not Allowed."""
    response = client.post("/api/health")
    assert response.status_code == 405


def test_health_endpoint_cors_headers(client):
    """Test that GET /api/health returns expected CORS headers."""
    headers = {"Origin": "http://localhost:5173"}
    response = client.get("/api/health", headers=headers)
    assert response.status_code == 200
    allow_origin = response.headers.get("Access-Control-Allow-Origin")
    assert allow_origin == "http://localhost:5173"
