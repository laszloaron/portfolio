from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.security import create_access_token, create_refresh_token, decode_refresh_token
from app.crud import user as user_crud
from app.models.models import User
from app.schemas.user import (
    AccessToken,
    RefreshRequest,
    Token,
    UserProfile,
    UserRegister,
    UserLogin,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ─── Register ─────────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=UserProfile,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new account",
)
async def register(
    data: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Create a new user account.

    * **email** — must be unique across the platform
    * **username** — 3–30 alphanumeric / underscore characters, unique
    * **password** — minimum 8 characters, must contain a letter *and* a digit
    """
    if await user_crud.get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this e-mail already exists",
        )
    if await user_crud.get_user_by_username(db, data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )
    return await user_crud.create_user(db, data)


# ─── Login (Swagger / OAuth2 form) ────────────────────────────────────────────
@router.post(
    "/token",
    response_model=Token,
    summary="OAuth2 password flow — returns access + refresh tokens",
)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Standard OAuth2 password-grant endpoint consumed by Swagger UI.

    Use ``username`` field for either the username **or** e-mail address.
    """
    user = await user_crud.authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username / e-mail or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ─── Login (JSON body) ────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=Token,
    summary="JSON login — returns access + refresh tokens",
)
async def login_json(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    JSON alternative to the OAuth2 form endpoint — easier to call from SPAs.
    Accepts username or e-mail in the ``username_or_email`` field.
    """
    user = await user_crud.authenticate_user(db, data.username_or_email, data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username / e-mail or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ─── Token refresh ────────────────────────────────────────────────────────────
@router.post(
    "/refresh",
    response_model=AccessToken,
    summary="Exchange a refresh token for a new access token",
)
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> AccessToken:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        import uuid
        payload = decode_refresh_token(body.refresh_token)
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise credentials_exc

    user = await user_crud.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exc

    return AccessToken(access_token=create_access_token(user.id))


# ─── Current user ─────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserProfile,
    summary="Return the authenticated user's profile",
)
async def me(current_user: User = Depends(get_current_active_user)) -> User:
    """Requires a valid Bearer token in the ``Authorization`` header."""
    return current_user
