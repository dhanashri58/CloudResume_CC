"""Profile service handling profile retrieval and updates."""
from app.models.user import User
from app.repositories.user_repository import UserRepository


class ProfileService:
    """Business service for user profile data."""

    @staticmethod
    def get_profile_dict(user: User) -> dict:
        """Format user profile as clean dictionary for client consumption."""
        profile = user.profile
        if not profile:
            profile = UserRepository.update_profile(user, {})

        return {
            "id": profile.id,
            "userId": user.id,
            "email": user.email,
            "firstName": profile.first_name or "",
            "lastName": profile.last_name or "",
            "fullName": profile.full_name or "",
            "headline": profile.headline or "",
            "phone": profile.phone or "",
            "location": profile.location or "",
            "website": profile.website or "",
            "linkedin": profile.linkedin or "",
            "github": profile.github or "",
            "createdAt": profile.created_at.isoformat(),
            "updatedAt": profile.updated_at.isoformat(),
        }

    @staticmethod
    def update_profile(user: User, validated_data: dict) -> dict:
        """Update profile attributes and return refreshed dictionary."""
        field_map = {
            "first_name": "first_name",
            "last_name": "last_name",
            "headline": "headline",
            "phone": "phone",
            "location": "location",
            "website": "website",
            "linkedin": "linkedin",
            "github": "github",
        }
        db_payload = {}
        for k, v in validated_data.items():
            if k in field_map:
                db_payload[field_map[k]] = v

        UserRepository.update_profile(user, db_payload)
        return ProfileService.get_profile_dict(user)
