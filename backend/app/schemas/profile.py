"""Pydantic validation schemas for user profile."""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ProfileUpdateSchema(BaseModel):
    """Schema for updating user profile."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    first_name: Optional[str] = Field(None, max_length=100, alias="firstName")
    last_name: Optional[str] = Field(None, max_length=100, alias="lastName")
    headline: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=150)
    website: Optional[str] = Field(None, max_length=255)
    linkedin: Optional[str] = Field(None, max_length=255)
    github: Optional[str] = Field(None, max_length=255)


class ProfileResponseSchema(BaseModel):
    """Schema for profile response serialization."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    created_at: datetime
    updated_at: datetime
