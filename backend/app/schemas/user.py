from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─── Registration ─────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    """Payload accepted by POST /auth/register."""

    email: EmailStr
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="3–30 alphanumeric characters or underscores",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Minimum 8 characters",
    )
    full_name: str = Field(..., max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Require at least one digit and one letter."""
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain at least one letter and one digit")
        return v


# ─── Login ────────────────────────────────────────────────────────────────────
class UserLogin(BaseModel):
    """Payload accepted by POST /auth/login (JSON body variant)."""

    username_or_email: str = Field(..., description="Username OR e-mail address")
    password: str


# ─── Token responses ──────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessToken(BaseModel):
    """Returned when a refresh token is exchanged for a new access token."""

    access_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── User responses ───────────────────────────────────────────────────────────
class UserPublic(BaseModel):
    """Safe subset of User returned to any authenticated caller."""

    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str | None
    avatar_url: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(UserPublic):
    """Extended profile view (returned to the owner / admin)."""

    is_superuser: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Profile update ───────────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    """Fields the user is allowed to change about themselves."""

    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=512)

    # Optional password change — both old + new must be supplied together
    current_password: str | None = Field(default=None, min_length=8)
    new_password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def new_password_strength(cls, v: str | None) -> str | None:
        if v is None:
            return v
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain at least one letter and one digit")
        return v
