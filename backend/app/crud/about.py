from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.about import AboutProfile
from app.schemas.about import AboutProfileUpdate

_SINGLETON_ID = 1


async def get_profile(db: AsyncSession) -> AboutProfile:
    """Return the single AboutProfile row, creating it if it doesn't exist."""
    result = await db.execute(select(AboutProfile).where(AboutProfile.id == _SINGLETON_ID))
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = AboutProfile(id=_SINGLETON_ID, name="László Áron", bio="")
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def update_profile(
    db: AsyncSession, profile: AboutProfile, data: AboutProfileUpdate
) -> AboutProfile:
    profile.name = data.name
    profile.bio = data.bio
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def update_photo(
    db: AsyncSession, profile: AboutProfile, photo_url: str
) -> AboutProfile:
    profile.photo_url = photo_url
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile
