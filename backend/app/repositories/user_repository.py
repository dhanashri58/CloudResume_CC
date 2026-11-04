"""User and UserProfile database repository."""
from typing import Optional
from app.extensions import db
from app.models.user import User, UserProfile


class UserRepository:
    """Repository handling User and Profile persistence operations."""

    @staticmethod
    def get_by_id(user_id: str) -> Optional[User]:
        return db.session.get(User, user_id)

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        return db.session.execute(
            db.select(User).where(User.email == email.lower().strip())
        ).scalar_one_or_none()

    @staticmethod
    def get_by_auth_provider_id(auth_provider_id: str) -> Optional[User]:
        """Fetch user by stable authentication provider identifier."""
        if not auth_provider_id:
            return None
        return db.session.execute(
            db.select(User).where(User.auth_provider_id == auth_provider_id)
        ).scalar_one_or_none()

    @staticmethod
    def get_or_create_from_entra_claims(claims: dict) -> User:
        """Resolve or provision User from verified JWT claims.

        Uses stable oid or sub claim as the primary identity key.
        """
        oid = claims.get("oid")
        sub = claims.get("sub")
        stable_id = oid or sub
        if not stable_id:
            raise ValueError("JWT claims must contain 'oid' or 'sub'.")

        provider_id = f"entra:{stable_id}"

        # 1. Lookup by stable provider identifier
        user = UserRepository.get_by_auth_provider_id(provider_id)
        if user:
            return user

        # 2. Extract email from standard claims
        raw_email = (
            claims.get("email")
            or claims.get("preferred_username")
            or claims.get("upn")
            or f"{stable_id}@entra.user"
        )
        clean_email = raw_email.lower().strip()

        # 3. Check if user already exists by email
        existing_email_user = UserRepository.get_by_email(clean_email)
        if existing_email_user:
            # Never overwrite an existing different auth_provider_id
            if (
                existing_email_user.auth_provider_id
                and existing_email_user.auth_provider_id != provider_id
            ):
                raise ValueError(
                    "Account already linked to a different identity provider."
                )

            # Only permit auto-linking if email_verified is explicitly True
            if claims.get("email_verified") is not True:
                raise ValueError(
                    "Automatic account linking requires a verified email."
                )

            existing_email_user.auth_provider_id = provider_id
            db.session.commit()
            return existing_email_user

        # 4. First-time user creation
        given_name = claims.get("given_name")
        family_name = claims.get("family_name")
        if not given_name and not family_name:
            full_name = claims.get("name") or ""
            parts = full_name.strip().split(" ", 1)
            given_name = parts[0] if parts else ""
            family_name = parts[1] if len(parts) > 1 else ""

        user = User(
            email=clean_email,
            auth_provider_id=provider_id,
            is_active=True
        )
        profile = UserProfile(
            user=user,
            first_name=given_name or "",
            last_name=family_name or "",
            headline="Cloud Professional"
        )
        db.session.add(user)
        db.session.add(profile)
        db.session.commit()
        return user

    @staticmethod
    def get_or_create_dev_user(
        email: str = "alex.mercer@example.com",
        first_name: str = "Alex",
        last_name: str = "Mercer"
    ) -> User:
        """Fetch or initialize default development user with profile."""
        clean_email = email.lower().strip()
        user = UserRepository.get_by_email(clean_email)
        if not user:
            user = User(email=clean_email)
            profile = UserProfile(
                user=user,
                first_name=first_name,
                last_name=last_name,
                headline="Senior Product Manager",
                location="San Francisco, CA",
                website="alexmercer.dev",
                linkedin="linkedin.com/in/alexmercer",
                github="github.com/alexmercer"
            )
            db.session.add(user)
            db.session.add(profile)
            db.session.commit()
        elif not user.profile:
            profile = UserProfile(
                user=user,
                first_name=first_name,
                last_name=last_name
            )
            db.session.add(profile)
            db.session.commit()
        return user

    @staticmethod
    def update_profile(user: User, data: dict) -> UserProfile:
        """Update or create user profile with validated dictionary data."""
        profile = user.profile
        if not profile:
            profile = UserProfile(user=user)
            db.session.add(profile)

        for key, value in data.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)

        db.session.commit()
        return profile
