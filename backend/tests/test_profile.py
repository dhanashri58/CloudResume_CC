"""Integration tests for User Profile REST API endpoints."""


def test_get_and_update_profile(client, user_a_headers):
    """Test retrieving and updating user profile."""
    # Initial get creates or loads profile
    get_resp = client.get("/api/profile", headers=user_a_headers)
    assert get_resp.status_code == 200
    profile = get_resp.get_json()
    assert profile["email"] == "user.a@example.com"

    # Update profile
    update_payload = {
        "first_name": "Alexander",
        "last_name": "Hamilton",
        "headline": "Secretary of the Treasury",
        "location": "New York, NY",
        "website": "treasury.gov",
        "phone": "+1-555-1789"
    }
    put_resp = client.put(
        "/api/profile", json=update_payload, headers=user_a_headers
    )
    assert put_resp.status_code == 200
    updated = put_resp.get_json()
    assert updated["firstName"] == "Alexander"
    assert updated["lastName"] == "Hamilton"
    assert updated["fullName"] == "Alexander Hamilton"
    assert updated["headline"] == "Secretary of the Treasury"
    assert updated["phone"] == "+1-555-1789"


def test_profile_validation_error(client, user_a_headers):
    """Test validation errors on profile update."""
    invalid_payload = {
        "first_name": "x" * 200  # max_length is 100
    }
    resp = client.put(
        "/api/profile", json=invalid_payload, headers=user_a_headers
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["error"] == "Validation Error"
