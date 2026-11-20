"""Unit and integration tests for production authentication endpoints."""
import pytest
from app import create_app, db
from app.config import TestConfig


@pytest.fixture
def app():
    """Create isolated test application instance."""
    application = create_app(TestConfig)
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()


def test_register_success(client):
    """Registering a new user returns 201, JWT token, and safe user data."""
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "testuser@example.com",
            "password": "SecurePassword123!",
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert "token" in data
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["full_name"] == "Test User"
    assert "password_hash" not in data["user"]
    assert "password" not in data["user"]


def test_register_duplicate_email(client):
    """Attempting to register with existing email returns 409 Conflict."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "User One",
            "email": "duplicate@example.com",
            "password": "Password123!",
        },
    )
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "User Two",
            "email": "duplicate@example.com",
            "password": "Password456!",
        },
    )
    assert res.status_code == 409
    data = res.get_json()
    assert "already exists" in data["message"].lower()


def test_register_validation_errors(client):
    """Invalid email or weak password triggers 422 Unprocessable Entity."""
    # Empty fields
    res = client.post("/api/auth/register", json={})
    assert res.status_code == 422

    # Weak password (< 8 chars)
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Short Pass",
            "email": "valid@example.com",
            "password": "short",
        },
    )
    assert res.status_code == 422
    assert "8 characters" in str(res.get_json())

    # Invalid email
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Bad Email",
            "email": "not-an-email",
            "password": "Password123!",
        },
    )
    assert res.status_code == 422


def test_login_success_and_token_authentication(client):
    """User can log in with valid credentials and authenticate requests via Bearer token."""
    # Register
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "password": "AliceSecretPassword1!",
        },
    )

    # Login
    res = client.post(
        "/api/auth/login",
        json={
            "email": "alice@example.com",
            "password": "AliceSecretPassword1!",
            "remember_me": True,
        },
    )
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    token = data["token"]

    # Verify protected route with issued Bearer token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.get_json()
    assert me_data["user"]["email"] == "alice@example.com"
    assert me_data["user"]["full_name"] == "Alice Smith"


def test_login_invalid_credentials(client):
    """Wrong password or non-existent email returns 401."""
    # Wrong password
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Bob Jones",
            "email": "bob@example.com",
            "password": "CorrectPassword123!",
        },
    )
    res = client.post(
        "/api/auth/login",
        json={
            "email": "bob@example.com",
            "password": "WrongPassword999!",
        },
    )
    assert res.status_code == 401
    assert "invalid email" in res.get_json()["message"].lower()

    # Non-existent email
    res2 = client.post(
        "/api/auth/login",
        json={
            "email": "nobody@example.com",
            "password": "AnyPassword123!",
        },
    )
    assert res2.status_code == 401


def test_protected_routes_without_auth(client):
    """Accessing protected endpoint without credentials returns 401."""
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_user_data_isolation(client):
    """Resumes created by User A are invisible to User B."""
    # Register User A
    res_a = client.post(
        "/api/auth/register",
        json={
            "full_name": "User Alpha",
            "email": "alpha@example.com",
            "password": "PasswordAlpha123!",
        },
    )
    token_a = res_a.get_json()["token"]

    # Register User B
    res_b = client.post(
        "/api/auth/register",
        json={
            "full_name": "User Beta",
            "email": "beta@example.com",
            "password": "PasswordBeta123!",
        },
    )
    token_b = res_b.get_json()["token"]

    # User A creates a resume
    create_res = client.post(
        "/api/resumes",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "title": "Alpha Cloud Resume",
            "template_id": "executive",
            "target_role": "Cloud Architect",
        },
    )
    assert create_res.status_code == 201
    resume_id = create_res.get_json()["id"]

    # User A can list their resume
    list_a = client.get(
        "/api/resumes",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert list_a.status_code == 200
    assert list_a.get_json()["count"] == 1
    assert list_a.get_json()["resumes"][0]["title"] == "Alpha Cloud Resume"

    # User B lists resumes -> must see 0 resumes
    list_b = client.get(
        "/api/resumes",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert list_b.status_code == 200
    assert list_b.get_json()["count"] == 0

    # User B tries to fetch User A's resume directly by ID -> returns 404 Not Found
    get_b = client.get(
        f"/api/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_b.status_code == 404

    # User B tries to delete User A's resume -> returns 404 Not Found
    delete_b = client.delete(
        f"/api/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert delete_b.status_code == 404


def test_forgot_password_and_logout(client):
    """Forgot password generates OTP for registered user, and logout succeeds."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "FP User",
            "email": "fp.user@example.com",
            "password": "Password123!",
        },
    )
    fp_res = client.post(
        "/api/auth/forgot-password",
        json={"email": "fp.user@example.com"},
    )
    assert fp_res.status_code == 200
    assert "verification code" in fp_res.get_json()["message"]
    assert "reset_token" in fp_res.get_json()

    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200


def test_reset_password_success(client):
    """User requests 6-digit OTP, verifies it, and resets password successfully."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Reset User",
            "email": "reset.user@example.com",
            "password": "OldPassword123!",
        },
    )

    # 1. Request OTP code
    fp_res = client.post(
        "/api/auth/forgot-password",
        json={"email": "reset.user@example.com"},
    )
    assert fp_res.status_code == 200
    fp_data = fp_res.get_json()
    code = fp_data["dev_code"]
    reset_token = fp_data["reset_token"]

    # 2. Reset with valid code
    res = client.post(
        "/api/auth/reset-password",
        json={
            "email": "reset.user@example.com",
            "code": code,
            "reset_token": reset_token,
            "new_password": "BrandNewPassword456!",
        },
    )
    assert res.status_code == 200
    assert "successfully updated" in res.get_json()["message"]

    # 3. Old password fails
    old_res = client.post(
        "/api/auth/login",
        json={
            "email": "reset.user@example.com",
            "password": "OldPassword123!",
        },
    )
    assert old_res.status_code == 401

    # 4. New password succeeds
    new_res = client.post(
        "/api/auth/login",
        json={
            "email": "reset.user@example.com",
            "password": "BrandNewPassword456!",
        },
    )
    assert new_res.status_code == 200
    assert "token" in new_res.get_json()


def test_google_auth_provision_and_login(client):
    """Google authentication route provisions new user and returns valid token."""
    res = client.post(
        "/api/auth/google",
        json={
            "email": "google.user@example.com",
            "name": "Google Test User",
        },
    )
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["email"] == "google.user@example.com"
    assert data["user"]["full_name"] == "Google Test User"

    # Verify token allows access to protected routes
    token = data["token"]
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["email"] == "google.user@example.com"
