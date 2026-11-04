"""Base database model mixin and primary key utilities."""
import uuid
from datetime import datetime, timezone
from app.extensions import db


def generate_uuid() -> str:
    """Generate a random UUID v4 string for primary keys."""
    return str(uuid.uuid4())


class TimestampMixin:
    """Mixin adding UUID primary key and standard created/updated timestamps.
    """

    id = db.Column(
        db.String(36),
        primary_key=True,
        default=generate_uuid,
        nullable=False
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
