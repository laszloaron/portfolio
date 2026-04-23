from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ─── Password hashing ─────────────────────────────────────────────────────────
# bcrypt with cost factor 12 — deliberate slowness to resist brute-force attacks
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of *plain_password*."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if *plain_password* matches *hashed_password*."""
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT tokens ───────────────────────────────────────────────────────────────
def create_access_token(
    subject: Any,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a signed JWT access token.

    :param subject: The value to encode as the ``sub`` claim (typically user ID).
    :param expires_delta: Custom TTL; falls back to ``ACCESS_TOKEN_EXPIRE_MINUTES``.
    """
    expire = datetime.now(tz=timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(tz=timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Any) -> str:
    """
    Create a long-lived refresh token (7 days).

    Stored as ``type: refresh`` to prevent access tokens being used as refresh
    tokens and vice-versa.
    """
    expire = datetime.now(tz=timezone.utc) + timedelta(days=7)
    payload = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(tz=timezone.utc),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.

    :raises JWTError: if the token is expired, tampered, or of the wrong type.
    """
    payload: dict[str, Any] = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT refresh token."""
    payload: dict[str, Any] = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    if payload.get("type") != "refresh":
        raise JWTError("Invalid token type")
    return payload
