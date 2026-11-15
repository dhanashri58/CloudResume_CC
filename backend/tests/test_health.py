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


def test_baseline_security_headers_present(client):
    """Test that responses include baseline security headers."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert (
        response.headers.get("Referrer-Policy")
        == "strict-origin-when-cross-origin"
    )
    assert "geolocation=()" in response.headers.get("Permissions-Policy", "")


def test_hsts_header_in_production_https(client, monkeypatch):
    """Test that HSTS is added only when requests arrive over HTTPS in production."""
    # Test 1: In testing/dev over HTTP, HSTS should NOT be set
    resp_dev = client.get("/api/health")
    assert "Strict-Transport-Security" not in resp_dev.headers

    # Test 2: In production environment over HTTPS (via X-Forwarded-Proto)
    from flask import current_app
    monkeypatch.setitem(current_app.config, "ENV", "production")

    resp_prod_https = client.get(
        "/api/health", headers={"X-Forwarded-Proto": "https"}
    )
    assert resp_prod_https.status_code == 200
    hsts = resp_prod_https.headers.get("Strict-Transport-Security")
    assert hsts == "max-age=31536000; includeSubDomains"
