"""User profile management API endpoints."""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from app.services.auth_service import AuthService, require_auth
from app.services.profile_service import ProfileService
from app.schemas.profile import ProfileUpdateSchema

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    """Retrieve current authenticated user's profile."""
    user = AuthService.get_current_user()
    profile = ProfileService.get_profile_dict(user)
    return jsonify(profile), 200


@profile_bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    """Update profile fields for the current user."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ProfileUpdateSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    user = AuthService.get_current_user()
    updated = ProfileService.update_profile(
        user,
        validated.model_dump(exclude_unset=True)
    )
    return jsonify(updated), 200
