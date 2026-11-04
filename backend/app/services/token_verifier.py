"""Token verifier service for Microsoft Entra External ID OIDC / JWT."""
from typing import Dict, Any, Optional
import jwt
from jwt.exceptions import (
    ExpiredSignatureError as PyJWTExpiredError,
    InvalidIssuerError as PyJWTInvalidIssuerError,
    InvalidAudienceError as PyJWTInvalidAudienceError,
    InvalidSignatureError as PyJWTInvalidSignatureError,
    DecodeError as PyJWTDecodeError,
    PyJWTError,
)
from flask import current_app


class TokenVerificationError(Exception):
    """Base exception for token verification failures."""

    def __init__(self, message: str = "Invalid token"):
        self.message = message
        super().__init__(self.message)


class ExpiredTokenError(TokenVerificationError):
    """Token has expired."""


class InvalidIssuerError(TokenVerificationError):
    """Token issuer does not match trusted authority."""


class InvalidAudienceError(TokenVerificationError):
    """Token audience does not match expected client ID or API identifier."""


class InvalidSignatureError(TokenVerificationError):
    """Token signature verification failed."""


class TokenVerifier:
    """Validates JWT access tokens against Microsoft Entra External ID."""

    ALLOWED_ALGORITHMS = ["RS256"]
    _jwk_clients: Dict[str, jwt.PyJWKClient] = {}

    @classmethod
    def _get_jwk_client(cls, jwks_uri: str) -> jwt.PyJWKClient:
        """Get or initialize cached PyJWKClient for a JWKS URI."""
        if jwks_uri not in cls._jwk_clients:
            cls._jwk_clients[jwks_uri] = jwt.PyJWKClient(
                uri=jwks_uri,
                cache_keys=True,
                max_cached_keys=16,
                cache_jwk_set=True,
                lifespan=3600
            )
        return cls._jwk_clients[jwks_uri]

    @classmethod
    def resolve_jwks_uri(cls, config: Any) -> Optional[str]:
        """Derive standard JWKS keys endpoint from config.

        Ensures consistency with the configured issuer and never silently
        falls back to login.microsoftonline.com for a CIAM issuer.
        """
        explicit_uri = config.get("AZURE_ENTRA_JWKS_URI")
        if explicit_uri:
            return explicit_uri

        issuer = (config.get("AZURE_ENTRA_ISSUER") or "").strip()
        tenant_id = (config.get("AZURE_ENTRA_TENANT_ID") or "").strip()

        # Derive JWKS endpoint directly from CIAM issuer
        if "ciamlogin.com" in issuer:
            clean = issuer.rstrip("/")
            base = clean[:-5] if clean.endswith("/v2.0") else clean
            return f"{base}/discovery/v2.0/keys"

        # Standard workforce Azure AD tenant configuration
        if tenant_id and (
            not issuer or "login.microsoftonline.com" in issuer
        ):
            return (
                f"https://login.microsoftonline.com/{tenant_id}/"
                f"discovery/v2.0/keys"
            )

        return None

    @classmethod
    def resolve_expected_issuer(cls, config: Any) -> Optional[str]:
        """Derive trusted issuer from config."""
        explicit_issuer = config.get("AZURE_ENTRA_ISSUER")
        if explicit_issuer:
            return explicit_issuer.strip()

        tenant_id = (config.get("AZURE_ENTRA_TENANT_ID") or "").strip()
        if tenant_id:
            return f"https://login.microsoftonline.com/{tenant_id}/v2.0"
        return None

    @classmethod
    def verify_token(
        cls,
        token: str,
        config: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Verify JWT signature, algorithm, issuer, audience, and expiry.

        Returns decoded claims dictionary on success.
        Raises TokenVerificationError subclass on failure.
        """
        if not token or not isinstance(token, str):
            raise TokenVerificationError("Token is missing or empty.")

        if config is not None:
            cfg = config
        else:
            try:
                cfg = current_app.config
            except RuntimeError:
                cfg = {}

        # 1. Inspect unverified header for algorithm & key id
        try:
            unverified_header = jwt.get_unverified_header(token)
        except Exception as err:
            raise TokenVerificationError(
                f"Malformed token header: {str(err)}"
            )

        alg = unverified_header.get("alg")
        if alg not in cls.ALLOWED_ALGORITHMS:
            raise TokenVerificationError(
                f"Unsupported token algorithm '{alg}'. RS256 required."
            )

        # 2. Obtain verification key
        public_key_pem = cfg.get("AZURE_ENTRA_PUBLIC_KEY")
        signing_key = None

        if public_key_pem:
            # Direct PEM public key provided (e.g. testing or local authority)
            signing_key = public_key_pem
        else:
            jwks_uri = cls.resolve_jwks_uri(cfg)
            if not jwks_uri:
                raise TokenVerificationError(
                    "Entra identity provider JWKS endpoint is not configured."
                )
            try:
                client = cls._get_jwk_client(jwks_uri)
                signing_key = client.get_signing_key_from_jwt(token).key
            except Exception as err:
                raise InvalidSignatureError(
                    f"Unable to retrieve signing key for token: {str(err)}"
                )

        # 3. Resolve validation criteria
        expected_issuer = cls.resolve_expected_issuer(cfg)
        expected_audience = (
            cfg.get("AZURE_ENTRA_AUDIENCE") or cfg.get("AZURE_ENTRA_CLIENT_ID")
        )

        decode_options = {
            "require": ["exp"],
            "verify_signature": True,
            "verify_exp": True,
            "verify_iss": bool(expected_issuer),
            "verify_aud": bool(expected_audience),
        }

        # 4. Decode and validate claims
        try:
            claims = jwt.decode(
                token,
                key=signing_key,
                algorithms=cls.ALLOWED_ALGORITHMS,
                audience=expected_audience if expected_audience else None,
                issuer=expected_issuer if expected_issuer else None,
                leeway=10,
                options=decode_options,
            )
            return claims
        except PyJWTExpiredError as err:
            raise ExpiredTokenError(f"Token has expired: {str(err)}")
        except PyJWTInvalidIssuerError as err:
            raise InvalidIssuerError(f"Invalid token issuer: {str(err)}")
        except PyJWTInvalidAudienceError as err:
            raise InvalidAudienceError(f"Invalid token audience: {str(err)}")
        except PyJWTInvalidSignatureError as err:
            raise InvalidSignatureError(f"Invalid token signature: {str(err)}")
        except PyJWTDecodeError as err:
            raise TokenVerificationError(f"Failed to decode token: {str(err)}")
        except PyJWTError as err:
            raise TokenVerificationError(f"Token validation error: {str(err)}")
