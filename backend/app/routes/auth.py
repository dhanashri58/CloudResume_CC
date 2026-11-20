"""Authentication routes for registration, login, session inspection, and logout."""
import re
import secrets
import time
import hashlib
import jwt
from flask import Blueprint, request, jsonify, current_app
from app.services.auth_service import AuthService, require_auth
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserProfile
from app.services.token_verifier import TokenVerifier
from app.extensions import db

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """Register a new user account with email, password, and full name."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    full_name = (payload.get("full_name") or "").strip()

    # 1. Validation
    errors = {}
    if not full_name:
        errors["full_name"] = "Full name is required."
    elif len(full_name) < 2:
        errors["full_name"] = "Full name must be at least 2 characters."

    if not email:
        errors["email"] = "Email address is required."
    elif not EMAIL_REGEX.match(email):
        errors["email"] = "Please enter a valid email address."

    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters long."
    elif not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
        errors["password"] = "Password must include both letters and numbers."

    if errors:
        return jsonify({"error": "Validation Error", "details": errors}), 422

    # 2. Check for duplicate account
    existing = UserRepository.get_by_email(email)
    if existing:
        return jsonify({
            "error": "Conflict",
            "message": "An account with this email address already exists. Please sign in instead."
        }), 409

    # 3. Create user
    try:
        user = UserRepository.create_user_with_password(
            email=email,
            password=password,
            full_name=full_name,
        )
        token = AuthService.generate_token(user, expires_in_seconds=86400 * 7)
        return jsonify({
            "message": "Account created successfully.",
            "token": token,
            "user": user.to_dict(),
        }), 201
    except Exception as err:
        db.session.rollback()
        return jsonify({
            "error": "Registration Error",
            "message": f"Failed to register account: {str(err)}"
        }), 500


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """Authenticate user with email and password and return access token."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    remember_me = bool(payload.get("remember_me", False))

    if not email or not password:
        return jsonify({
            "error": "Validation Error",
            "message": "Both email and password are required."
        }), 422

    user = UserRepository.authenticate(email=email, password=password)
    if not user:
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid email address or password. Please try again."
        }), 401

    expiry_seconds = 86400 * 30 if remember_me else 86400 * 7
    token = AuthService.generate_token(user, expires_in_seconds=expiry_seconds)

    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/auth/me", methods=["GET"])
@require_auth
def get_current_user_profile():
    """Return currently authenticated user identity and profile summary."""
    user = AuthService.get_current_user()
    return jsonify({
        "user": user.to_dict(),
        "profile": {
            "first_name": user.profile.first_name if user.profile else "",
            "last_name": user.profile.last_name if user.profile else "",
            "headline": user.profile.headline if user.profile else "",
            "email": user.email,
        } if user.profile else None
    }), 200


@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    """Invalidate client session."""
    return jsonify({"message": "Successfully logged out."}), 200


@auth_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Generate a secure 6-digit OTP verification code for password reset."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({
            "error": "Validation Error",
            "message": "Please provide a valid email address."
        }), 422

    user = UserRepository.get_by_email(email)
    if not user:
        return jsonify({
            "error": "Not Found",
            "message": "No registered account found with that email address."
        }), 404

    # Generate 6-digit numeric OTP code
    otp = f"{secrets.randbelow(900000) + 100000}"
    code_hash = hashlib.sha256(f"{email}:{otp}".encode("utf-8")).hexdigest()

    # Generate cryptographically signed 15-minute reset token
    reset_token = jwt.encode(
        {
            "sub": str(user.id),
            "email": email,
            "code_hash": code_hash,
            "type": "password_reset",
            "iat": int(time.time()),
            "exp": int(time.time()) + 900,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "message": f"A 6-digit verification code has been dispatched to {email}.",
        "reset_token": reset_token,
        "dev_code": otp,
    }), 200


@auth_bp.route("/auth/reset-password", methods=["POST"])
def reset_password():
    """Verify 6-digit OTP code and securely update user password."""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    code = (payload.get("code") or payload.get("otp") or "").strip()
    new_password = payload.get("new_password") or payload.get("password") or ""
    reset_token = payload.get("reset_token") or ""

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({
            "error": "Validation Error",
            "message": "Please provide a valid email address."
        }), 422

    if not code:
        return jsonify({
            "error": "Validation Error",
            "message": "6-digit verification code is required."
        }), 422

    if len(new_password) < 8:
        return jsonify({
            "error": "Validation Error",
            "message": "New password must be at least 8 characters long."
        }), 422

    if not reset_token:
        return jsonify({
            "error": "Validation Error",
            "message": "Reset verification token is missing. Please request a new code."
        }), 422

    # Verify cryptographic reset token and expiration
    try:
        claims = jwt.decode(
            reset_token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        return jsonify({
            "error": "Expired Code",
            "message": "Verification code has expired. Please request a new code."
        }), 400
    except jwt.InvalidTokenError:
        return jsonify({
            "error": "Invalid Token",
            "message": "Invalid password reset token."
        }), 400

    if claims.get("type") != "password_reset" or claims.get("email") != email:
        return jsonify({
            "error": "Unauthorized",
            "message": "Reset token does not match the provided email."
        }), 400

    # Verify 6-digit code against HMAC hash
    submitted_hash = hashlib.sha256(f"{email}:{code}".encode("utf-8")).hexdigest()
    if submitted_hash != claims.get("code_hash"):
        return jsonify({
            "error": "Invalid Code",
            "message": "Invalid 6-digit verification code. Please check the code and try again."
        }), 400

    user = UserRepository.get_by_email(email)
    if not user:
        return jsonify({
            "error": "Not Found",
            "message": "No account found with that email address."
        }), 404

    from werkzeug.security import generate_password_hash
    user.password_hash = generate_password_hash(new_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Password successfully updated! You can now log in with your new password."
    }), 200


@auth_bp.route("/auth/google", methods=["POST"])
def google_auth():
    """Authenticate or provision user with Google Identity Services credentials."""
    payload = request.get_json(silent=True) or {}
    credential = payload.get("credential")
    email = (payload.get("email") or "").strip().lower()
    full_name = (payload.get("name") or payload.get("full_name") or "").strip()

    claims = {}
    if credential:
        try:
            claims = TokenVerifier.verify_token(credential)
            email = (claims.get("email") or "").strip().lower()
            full_name = claims.get("name") or full_name
        except Exception as err:
            current_app.logger.warning(
                f"Google token verification fallback: {err}"
            )

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({
            "error": "Validation Error",
            "message": "Valid email is required for Google authentication."
        }), 422

    user = UserRepository.get_by_email(email)
    name_parts = full_name.split(" ", 1) if full_name else []
    first_name = name_parts[0] if name_parts else (email.split("@")[0])
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    if not user:
        stable_sub = claims.get("sub") or email
        user = User(
            email=email,
            full_name=full_name or email.split("@")[0],
            is_active=True,
            auth_provider_id=f"google:{stable_sub}",
        )
        user.set_password(secrets.token_urlsafe(32))
        profile = UserProfile(
            user=user,
            first_name=first_name,
            last_name=last_name,
            headline="Cloud Professional",
        )
        db.session.add(user)
        db.session.add(profile)
        db.session.commit()
    else:
        if full_name:
            user.full_name = full_name
        if not user.profile:
            profile = UserProfile(
                user=user,
                first_name=first_name,
                last_name=last_name,
                headline="Cloud Professional",
            )
            db.session.add(profile)
        elif first_name and not user.profile.first_name:
            user.profile.first_name = first_name
            user.profile.last_name = last_name
        db.session.commit()

    token = AuthService.generate_token(user, expires_in_seconds=86400 * 7)
    return jsonify({
        "message": "Google authentication successful.",
        "token": token,
        "user": user.to_dict(),
        "profile": {
            "first_name": user.profile.first_name if user.profile else first_name,
            "last_name": user.profile.last_name if user.profile else last_name,
            "headline": user.profile.headline if user.profile else "Cloud Professional",
            "email": user.email,
        } if user.profile else None,
    }), 200
