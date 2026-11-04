"""User and UserProfile database models."""
from app.extensions import db
from app.models.base import TimestampMixin


class User(TimestampMixin, db.Model):
    """User account entity representing an authenticated identity."""

    __tablename__ = "users"

    email = db.Column(db.String(255), unique=True, index=True, nullable=False)
    auth_provider_id = db.Column(
        db.String(255), unique=True, index=True, nullable=True
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    profile = db.relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    resumes = db.relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Resume.updated_at)"
    )

    def __repr__(self):
        return f"<User {self.email}>"


class UserProfile(TimestampMixin, db.Model):
    """User profile containing personal metadata and contact preferences."""

    __tablename__ = "user_profiles"

    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    headline = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)

    # Relationship
    user = db.relationship("User", back_populates="profile")

    @property
    def full_name(self):
        parts = [self.first_name, self.last_name]
        return " ".join([p for p in parts if p]) if any(parts) else ""

    def __repr__(self):
        return f"<UserProfile user_id={self.user_id}>"
