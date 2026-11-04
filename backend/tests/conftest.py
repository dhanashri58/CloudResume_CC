"""Pytest test configuration and fixtures."""
import time
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import jwt
from app import create_app
from app.config import TestConfig
from app.extensions import db


# Generate static test RSA key pairs for test suite runs
_test_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
TEST_PRIVATE_PEM = _test_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode("utf-8")

TEST_PUBLIC_PEM = _test_key.public_key().public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
).decode("utf-8")

# Second key pair for testing invalid signature
_wrong_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
WRONG_PRIVATE_PEM = _wrong_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode("utf-8")

TEST_ISSUER = "https://login.microsoftonline.com/test-tenant-id/v2.0"
TEST_AUDIENCE = "api://cloudresumeai-test"


class SecurityTestConfig(TestConfig):
    """Test configuration with RSA public key verification enabled."""

    AZURE_ENTRA_PUBLIC_KEY = TEST_PUBLIC_PEM
    AZURE_ENTRA_ISSUER = TEST_ISSUER
    AZURE_ENTRA_AUDIENCE = TEST_AUDIENCE
    DEV_AUTH_ENABLED = True


@pytest.fixture
def app():
    """Create and configure an isolated in-memory test application."""
    application = create_app(SecurityTestConfig)

    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for Click commands."""
    return app.test_cli_runner()


@pytest.fixture
def make_jwt():
    """Factory fixture for generating test RS256 JWT tokens."""
    def _create(
        sub="user-123",
        oid="oid-user-123",
        email="test.user@cloudresume.ai",
        name="Test User",
        iss=TEST_ISSUER,
        aud=TEST_AUDIENCE,
        exp_offset=3600,
        private_key=TEST_PRIVATE_PEM,
        extra_claims=None,
        headers=None,
    ):
        now = int(time.time())
        payload = {
            "sub": sub,
            "oid": oid,
            "email": email,
            "name": name,
            "iss": iss,
            "aud": aud,
            "iat": now,
            "nbf": now - 10,
            "exp": now + exp_offset,
        }
        if extra_claims:
            payload.update(extra_claims)

        token_headers = {"alg": "RS256", "typ": "JWT"}
        if headers:
            token_headers.update(headers)

        return jwt.encode(
            payload,
            private_key,
            algorithm="RS256",
            headers=token_headers
        )

    return _create


@pytest.fixture
def user_a_headers():
    """Request headers simulating User A in development."""
    return {
        "X-Dev-User-Email": "user.a@example.com",
        "Content-Type": "application/json",
    }


@pytest.fixture
def user_b_headers():
    """Request headers simulating User B in development."""
    return {
        "X-Dev-User-Email": "user.b@example.com",
        "Content-Type": "application/json",
    }
