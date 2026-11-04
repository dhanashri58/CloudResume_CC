"""Direct unit tests for TokenVerifier methods and edge cases."""
import pytest
import jwt
from app.services.token_verifier import (
    TokenVerifier,
    TokenVerificationError,
)
from tests.conftest import TEST_PRIVATE_PEM


def test_token_verifier_empty_token():
    """Verify error raised on empty or non-string token."""
    with pytest.raises(TokenVerificationError, match="missing or empty"):
        TokenVerifier.verify_token("")


def test_token_verifier_malformed_token():
    """Verify error raised on header decode failure."""
    with pytest.raises(TokenVerificationError, match="Malformed token header"):
        TokenVerifier.verify_token("invalid.token")


def test_token_verifier_unsupported_algorithm():
    """Verify rejection when algorithm is not RS256."""
    payload = {"sub": "123", "exp": 9999999999}
    hs_token = jwt.encode(payload, "a" * 32, algorithm="HS256")
    msg = "Unsupported token algorithm"
    with pytest.raises(TokenVerificationError, match=msg):
        TokenVerifier.verify_token(hs_token)


def test_token_verifier_jwks_resolution():
    """Verify resolution of JWKS URI and issuer from tenant ID."""
    cfg = {"AZURE_ENTRA_TENANT_ID": "my-tenant-123"}
    jwks = TokenVerifier.resolve_jwks_uri(cfg)
    assert "my-tenant-123/discovery/v2.0/keys" in jwks

    iss = TokenVerifier.resolve_expected_issuer(cfg)
    assert iss == "https://login.microsoftonline.com/my-tenant-123/v2.0"


def test_token_verifier_explicit_jwks_override():
    """Verify explicit JWKS URI overrides tenant calculation."""
    cfg = {
        "AZURE_ENTRA_JWKS_URI": "https://custom.auth/keys",
        "AZURE_ENTRA_ISSUER": "https://custom.auth/v2.0",
    }
    assert TokenVerifier.resolve_jwks_uri(cfg) == "https://custom.auth/keys"
    exp_iss = TokenVerifier.resolve_expected_issuer(cfg)
    assert exp_iss == "https://custom.auth/v2.0"


def test_token_verifier_missing_keys_configuration():
    """Verify error when neither public key nor JWKS is configured."""
    valid_token = jwt.encode(
        {"sub": "123", "exp": 9999999999},
        TEST_PRIVATE_PEM,
        algorithm="RS256"
    )
    with pytest.raises(TokenVerificationError, match="not configured"):
        TokenVerifier.verify_token(valid_token, config={})


def test_ciam_jwks_derived_from_ciam_issuer():
    """Verify CIAM issuer derives *.ciamlogin.com keys endpoint."""
    cfg = {
        "AZURE_ENTRA_ISSUER": (
            "https://cloudresume.ciamlogin.com/"
            "00000000-0000-0000-0000-000000000000/v2.0"
        ),
        "AZURE_ENTRA_TENANT_ID": "00000000-0000-0000-0000-000000000000",
    }
    jwks = TokenVerifier.resolve_jwks_uri(cfg)
    assert jwks == (
        "https://cloudresume.ciamlogin.com/"
        "00000000-0000-0000-0000-000000000000/discovery/v2.0/keys"
    )
    # Ensure it never silently fell back to login.microsoftonline.com
    assert "login.microsoftonline.com" not in jwks


def test_ciam_jwks_derived_without_v2_suffix():
    """Verify CIAM issuer without trailing /v2.0 derives correct keys URL."""
    cfg = {
        "AZURE_ENTRA_ISSUER": "https://mytenant.ciamlogin.com/tenant-uuid",
    }
    jwks = TokenVerifier.resolve_jwks_uri(cfg)
    expected = (
        "https://mytenant.ciamlogin.com/tenant-uuid/discovery/v2.0/keys"
    )
    assert jwks == expected


def test_ciam_explicit_jwks_takes_precedence():
    """Verify explicit JWKS URI overrides derived CIAM endpoint."""
    cfg = {
        "AZURE_ENTRA_ISSUER": "https://tenant.ciamlogin.com/uuid/v2.0",
        "AZURE_ENTRA_JWKS_URI": "https://custom-cdn.ciamlogin.com/keys",
    }
    expected = "https://custom-cdn.ciamlogin.com/keys"
    assert TokenVerifier.resolve_jwks_uri(cfg) == expected


def test_unrecognized_issuer_does_not_fallback():
    """Verify non-Microsoft issuer returns None rather than silent fallback."""
    cfg = {
        "AZURE_ENTRA_ISSUER": "https://untrusted-auth.org/v2.0",
        "AZURE_ENTRA_TENANT_ID": "some-id",
    }
    assert TokenVerifier.resolve_jwks_uri(cfg) is None
