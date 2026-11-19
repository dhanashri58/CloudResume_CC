"""Authentication and identity abstraction service."""
from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt
from flask import request, current_app, jsonify, g
from app.repositories.user_repository import UserRepository
from app.services.token_verifier import TokenVerifier, TokenVerificationError


class AuthService:
    """Manages identity resolution, JWT verification, and auth boundaries."""

    @staticmethod
    def generate_token(user, expires_in_seconds: int = 86400 * 7) -> str:
        """Generate a signed HS256 JWT access token for an authenticated user."""
        secret = current_app.config.get("SECRET_KEY", "dev-insecure-key-change-in-prod")
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "name": getattr(user, "full_name", "") or "",
            "type": "access_token",
            "iat": now,
            "exp": now + timedelta(seconds=expires_in_seconds),
        }
        return jwt.encode(payload, secret, algorithm="HS256")

    @staticmethod
    def get_current_user():
        """Resolve current authenticated User or development identity.

        Returns User instance if authenticated, or None.
        Sets g.auth_error on failure.
        """
        g.auth_error = None
        auth_header = request.headers.get("Authorization", "")

        # 1. Bearer Token Verification
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
            if not token:
                g.auth_error = "Bearer token string is empty."
                return None

            # 1a. Try local application JWT (HS256) first
            try:
                secret = current_app.config.get(
                    "SECRET_KEY", "dev-insecure-key-change-in-prod"
                )
                payload = jwt.decode(token, secret, algorithms=["HS256"])
                user_id = payload.get("sub")
                if user_id:
                    user = UserRepository.get_by_id(user_id)
                    if user and user.is_active:
                        g.current_user = user
                        return user
                    g.auth_error = "User associated with token no longer exists or is inactive."
                    return None
            except jwt.ExpiredSignatureError:
                g.auth_error = "Authorization token has expired. Please log in again."
                return None
            except (jwt.InvalidTokenError, Exception):
                # Fall through to external OIDC verification (Entra / Google)
                pass

            # 1b. External OIDC Verification (RS256)
            try:
                claims = TokenVerifier.verify_token(token)
                user = UserRepository.get_or_create_from_entra_claims(claims)
                g.current_user = user
                return user
            except TokenVerificationError as err:
                g.auth_error = err.message
                return None
            except Exception as err:
                g.auth_error = f"Token verification failed: {str(err)}"
                return None

        # 2. Reject if non-Bearer Authorization header is supplied
        if auth_header:
            g.auth_error = "Authorization header must use Bearer scheme."
            return None

        # 3. Development identity fallback (strictly guarded)
        is_prod = current_app.config.get("ENV") == "production"
        dev_auth_enabled = current_app.config.get("DEV_AUTH_ENABLED", False)

        if dev_auth_enabled and not is_prod:
            dev_email = request.headers.get("X-Dev-User-Email", "").strip()
            if dev_email:
                user = UserRepository.get_or_create_dev_user(email=dev_email)
                g.current_user = user
                return user
            g.auth_error = (
                "Missing authentication credentials. In development mode, "
                "provide X-Dev-User-Email or Authorization Bearer header."
            )
            return None

        g.auth_error = "Missing Authorization header."
        return None


def require_auth(f):
    """Decorator requiring valid user identity on protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = AuthService.get_current_user()
        client_ip = request.remote_addr or "unknown"
        from app.services.security_monitor import SecurityMonitor

        if not user:
            message = getattr(
                g,
                "auth_error",
                "Authentication required to access this resource."
            )
            SecurityMonitor.record_auth_failure(
                reason=message,
                client_ip=client_ip,
                endpoint=request.path,
            )
            return jsonify({
                "error": "Unauthorized",
                "message": message
            }), 401

        SecurityMonitor.record_auth_success(client_ip)
        return f(*args, **kwargs)
    return decorated_function
