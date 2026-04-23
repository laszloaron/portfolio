from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_superuser
from app.crud import user as user_crud
from app.models.models import User
from app.schemas.user import UserProfile, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


# ─── Own profile ──────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserProfile,
    summary="Alias for GET /auth/me",
)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user),
) -> User:
    return current_user


@router.patch(
    "/me",
    response_model=UserProfile,
    summary="Update own profile (name, avatar, password)",
)
async def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Updatable fields:

    * **full_name** — display name
    * **avatar_url** — absolute URL to a profile picture
    * **current_password** + **new_password** — change password

    Supply BOTH ``current_password`` and ``new_password`` to change the password.
    """
    updated_user, error = await user_crud.update_user(db, current_user, data)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return updated_user


# ─── Admin: look up any user by username ──────────────────────────────────────
@router.get(
    "/{username}",
    response_model=UserProfile,
    summary="[Superuser] Fetch any user by username",
)
async def get_user_by_username(
    username: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser),   # enforces superuser
) -> User:
    user = await user_crud.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
