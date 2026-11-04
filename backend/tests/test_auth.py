"""Comprehensive security tests for Microsoft Entra authentication."""
from app import create_app
from app.config import Config
from app.extensions import db
from app.models.user import User
from tests.conftest import WRONG_PRIVATE_PEM, TEST_PUBLIC_PEM, TEST_AUDIENCE


def test_missing_authorization_header():
    """Verify that protected endpoints reject requests without auth."""
    class NoDevConfig(Config):
        TESTING = True
        DEV_AUTH_ENABLED = False
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    no_dev_app = create_app(NoDevConfig)
    client = no_dev_app.test_client()

    resp = client.get("/api/resumes")
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "Missing Authorization header" in data["message"]


def test_invalid_jwt_format(client):
    """Verify rejection of malformed or gibberish JWT string."""
    headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"


def test_expired_jwt(client, make_jwt):
    """Verify rejection of expired access token."""
    expired_token = make_jwt(exp_offset=-300)  # Expired 5 minutes ago
    headers = {"Authorization": f"Bearer {expired_token}"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "expired" in data["message"].lower()


def test_wrong_issuer(client, make_jwt):
    """Verify rejection of token issued by untrusted authority."""
    bad_iss_token = make_jwt(iss="https://evil-untrusted-issuer.com/v2.0")
    headers = {"Authorization": f"Bearer {bad_iss_token}"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "issuer" in data["message"].lower()


def test_wrong_audience(client, make_jwt):
    """Verify rejection of token intended for a different application."""
    bad_aud_token = make_jwt(aud="api://different-client-app")
    headers = {"Authorization": f"Bearer {bad_aud_token}"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "audience" in data["message"].lower()


def test_invalid_signature(client, make_jwt):
    """Verify rejection of token signed with an untrusted private key."""
    tampered_token = make_jwt(private_key=WRONG_PRIVATE_PEM)
    headers = {"Authorization": f"Bearer {tampered_token}"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "signature" in data["message"].lower()


def test_valid_token_authenticates(client, make_jwt):
    """Verify that a valid RS256 token successfully accesses API."""
    token = make_jwt(oid="oid-valid-1", email="valid.user@cloudresume.ai")
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/resumes", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "resumes" in data
    assert data["resumes"] == []


def test_first_time_user_provisioning(client, make_jwt, app):
    """Verify automatic User and UserProfile creation for new Entra user."""
    token = make_jwt(
        oid="oid-new-user-999",
        email="newbie@cloudresume.ai",
        name="Jordan Lee"
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["email"] == "newbie@cloudresume.ai"
    assert data["firstName"] == "Jordan"
    assert data["lastName"] == "Lee"

    # Verify persisted in database
    with app.app_context():
        user = db.session.execute(
            db.select(User).where(
                User.auth_provider_id == "entra:oid-new-user-999"
            )
        ).scalar_one_or_none()
        assert user is not None
        assert user.email == "newbie@cloudresume.ai"
        assert user.profile is not None


def test_returning_user_no_duplicate(client, make_jwt, app):
    """Verify returning user resolves existing DB record without dups."""
    token = make_jwt(
        oid="oid-returning-456",
        email="returning@cloudresume.ai",
        name="Sam Taylor"
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Request 1 (first-time)
    r1 = client.get("/api/profile", headers=headers)
    assert r1.status_code == 200

    # Request 2 (returning)
    r2 = client.get("/api/profile", headers=headers)
    assert r2.status_code == 200
    assert r1.get_json()["id"] == r2.get_json()["id"]

    # Verify exactly 1 user in DB with this provider id
    with app.app_context():
        users = db.session.execute(
            db.select(User).where(
                User.auth_provider_id == "entra:oid-returning-456"
            )
        ).scalars().all()
        assert len(users) == 1


def test_cross_user_resume_access(client, make_jwt):
    """Verify User B cannot read, update, or delete User A's resume."""
    token_a = make_jwt(oid="user-a-oid", email="user.a@cloudresume.ai")
    token_b = make_jwt(oid="user-b-oid", email="user.b@cloudresume.ai")

    headers_a = {
        "Authorization": f"Bearer {token_a}",
        "Content-Type": "application/json"
    }
    headers_b = {
        "Authorization": f"Bearer {token_b}",
        "Content-Type": "application/json"
    }

    # User A creates a resume
    create_payload = {
        "title": "Confidential Executive Resume",
        "templateId": "horizon"
    }
    create_resp = client.post(
        "/api/resumes",
        json=create_payload,
        headers=headers_a
    )
    assert create_resp.status_code == 201
    resume_id = create_resp.get_json()["id"]

    # User B attempts to read User A's resume -> 404
    get_resp = client.get(f"/api/resumes/{resume_id}", headers=headers_b)
    assert get_resp.status_code == 404

    # User B attempts to update User A's resume -> 404
    put_resp = client.put(
        f"/api/resumes/{resume_id}",
        json={"title": "Hacked Title"},
        headers=headers_b
    )
    assert put_resp.status_code == 404

    # User B attempts to delete User A's resume -> 404
    del_resp = client.delete(f"/api/resumes/{resume_id}", headers=headers_b)
    assert del_resp.status_code == 404

    # User A can still retrieve the resume unharmed
    verify_resp = client.get(f"/api/resumes/{resume_id}", headers=headers_a)
    assert verify_resp.status_code == 200
    assert verify_resp.get_json()["title"] == "Confidential Executive Resume"


def test_cross_user_profile_access(client, make_jwt):
    """Verify profile isolation between different authenticated users."""
    token_a = make_jwt(
        oid="user-a-prof", email="a@cloudresume.ai", name="Alice A"
    )
    token_b = make_jwt(
        oid="user-b-prof", email="b@cloudresume.ai", name="Bob B"
    )

    headers_a = {
        "Authorization": f"Bearer {token_a}",
        "Content-Type": "application/json"
    }
    headers_b = {
        "Authorization": f"Bearer {token_b}",
        "Content-Type": "application/json"
    }

    client.put(
        "/api/profile",
        json={"headline": "Alice Headline"},
        headers=headers_a
    )
    client.put(
        "/api/profile",
        json={"headline": "Bob Headline"},
        headers=headers_b
    )

    prof_a = client.get("/api/profile", headers=headers_a).get_json()
    prof_b = client.get("/api/profile", headers=headers_b).get_json()

    assert prof_a["headline"] == "Alice Headline"
    assert prof_b["headline"] == "Bob Headline"
    assert prof_a["id"] != prof_b["id"]


def test_dev_auth_disabled():
    """Verify that when DEV_AUTH_ENABLED is False, requests fail."""
    class DisabledDevConfig(Config):
        TESTING = True
        DEV_AUTH_ENABLED = False
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    app_instance = create_app(DisabledDevConfig)
    c = app_instance.test_client()

    resp = c.get("/api/resumes")
    assert resp.status_code == 401
    assert "Missing Authorization header" in resp.get_json()["message"]


def test_dev_auth_rejected_in_production():
    """Verify production mode strictly refuses development authentication."""
    class ProdConfig(Config):
        TESTING = True
        ENV = "production"
        DEV_AUTH_ENABLED = True  # Attempt to force dev auth
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
        AZURE_ENTRA_PUBLIC_KEY = TEST_PUBLIC_PEM
        AZURE_ENTRA_AUDIENCE = TEST_AUDIENCE

    prod_app = create_app(ProdConfig)
    c = prod_app.test_client()

    # Even with X-Dev-User-Email, production must reject with 401
    dev_hdr = {"X-Dev-User-Email": "attacker@example.com"}
    resp = c.get("/api/resumes", headers=dev_hdr)
    assert resp.status_code == 401
    assert resp.get_json()["error"] == "Unauthorized"


def test_verified_email_account_linking(client, make_jwt, app):
    """Verify linking of unlinked account when email_verified is True."""
    with app.app_context():
        legacy_user = User(
            email="preexisting@cloudresume.ai",
            auth_provider_id=None
        )
        db.session.add(legacy_user)
        db.session.commit()

    token = make_jwt(
        oid="oid-link-123",
        email="preexisting@cloudresume.ai",
        extra_claims={"email_verified": True}
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 200

    with app.app_context():
        u = db.session.execute(
            db.select(User).where(User.email == "preexisting@cloudresume.ai")
        ).scalar_one()
        assert u.auth_provider_id == "entra:oid-link-123"


def test_account_linking_rejected_missing_email_verified(
    client, make_jwt, app
):
    """Verify rejection of auto-linking when email_verified is missing."""
    with app.app_context():
        legacy_user = User(
            email="unverified1@cloudresume.ai",
            auth_provider_id=None
        )
        db.session.add(legacy_user)
        db.session.commit()

    # Token without email_verified claim
    token = make_jwt(
        oid="oid-attacker-1",
        email="unverified1@cloudresume.ai"
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "verified email" in data["message"].lower()

    # Ensure provider ID was NOT linked
    with app.app_context():
        u = db.session.execute(
            db.select(User).where(User.email == "unverified1@cloudresume.ai")
        ).scalar_one()
        assert u.auth_provider_id is None


def test_account_linking_rejected_email_verified_false(
    client, make_jwt, app
):
    """Verify rejection of auto-linking when email_verified is false."""
    with app.app_context():
        legacy_user = User(
            email="unverified2@cloudresume.ai",
            auth_provider_id=None
        )
        db.session.add(legacy_user)
        db.session.commit()

    token = make_jwt(
        oid="oid-attacker-2",
        email="unverified2@cloudresume.ai",
        extra_claims={"email_verified": False}
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 401

    with app.app_context():
        u = db.session.execute(
            db.select(User).where(User.email == "unverified2@cloudresume.ai")
        ).scalar_one()
        assert u.auth_provider_id is None


def test_account_linking_rejected_different_auth_provider_id(
    client, make_jwt, app
):
    """Verify that an existing auth_provider_id is NEVER overwritten."""
    with app.app_context():
        legit_user = User(
            email="immutable@cloudresume.ai",
            auth_provider_id="entra:legit-owner-oid"
        )
        db.session.add(legit_user)
        db.session.commit()

    # Attacker token with same email but different oid, even if email_verified
    attacker_token = make_jwt(
        oid="oid-attacker-3",
        email="immutable@cloudresume.ai",
        extra_claims={"email_verified": True}
    )
    headers = {"Authorization": f"Bearer {attacker_token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["error"] == "Unauthorized"
    assert "already linked" in data["message"].lower()

    # Confirm original auth_provider_id was preserved
    with app.app_context():
        u = db.session.execute(
            db.select(User).where(User.email == "immutable@cloudresume.ai")
        ).scalar_one()
        assert u.auth_provider_id == "entra:legit-owner-oid"
