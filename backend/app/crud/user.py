from __future__ import annotations

import uuid

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.models import User
from app.schemas.user import UserRegister, UserUpdate


# ─── Read ─────────────────────────────────────────────────────────────────────
async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_username_or_email(
    db: AsyncSession, identifier: str
) -> User | None:
    """Look up a user by username *or* e-mail in a single query."""
    result = await db.execute(
        select(User).where(
            or_(User.username == identifier, User.email == identifier)
        )
    )
    return result.scalar_one_or_none()


# ─── Create ───────────────────────────────────────────────────────────────────
async def create_user(db: AsyncSession, data: UserRegister) -> User:
    """
    Persist a new user.

    The plain-text password is hashed with bcrypt before storage — the raw
    password is never written to the database.
    """
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.flush()   # populate user.id without committing
    await db.refresh(user)
    return user


# ─── Authentication ───────────────────────────────────────────────────────────
async def authenticate_user(
    db: AsyncSession, identifier: str, plain_password: str
) -> User | None:
    """
    Verify credentials.

    Returns the User on success, or None if the credentials are wrong.
    The timing is deliberately consistent to limit username-enumeration attacks.
    """
    user = await get_user_by_username_or_email(db, identifier)
    if user is None or not user.hashed_password:
        # Still run verify_password to keep constant-time behaviour.
        # The dummy is a valid bcrypt hash that will never match any real password.
        verify_password(plain_password, "$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        return None
    if not verify_password(plain_password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


# ─── Update ───────────────────────────────────────────────────────────────────
async def update_user(
    db: AsyncSession, user: User, data: UserUpdate
) -> tuple[User, str | None]:
    """
    Apply profile changes to *user*.

    Returns ``(updated_user, error_message_or_None)``.
    Password changes require the correct *current_password*; if it does not
    match, the update is rejected with an error string.
    """
    error: str | None = None

    if data.new_password is not None:
        if data.current_password is None:
            return user, "current_password is required to change the password"
        if not verify_password(data.current_password, user.hashed_password or ""):
            return user, "Current password is incorrect"
        user.hashed_password = hash_password(data.new_password)

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    await db.flush()
    await db.refresh(user)
    return user, error
