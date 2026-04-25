from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.about import AboutProfile
from app.schemas.about import AboutProfileUpdate


async def get_profile(db: AsyncSession) -> AboutProfile:
    result = await db.execute(select(AboutProfile).filter(AboutProfile.id == 1))
    profile = result.scalars().first()
    
    if not profile:
        # Create default profile if not exists (singleton)
        profile = AboutProfile(
            id=1,
            name="Your Name",
            bio="Write something about yourself..."
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    
    return profile


async def update_profile(
    db: AsyncSession, profile: AboutProfile, obj_in: AboutProfileUpdate
) -> AboutProfile:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def update_photo(
    db: AsyncSession, profile: AboutProfile, photo_url: str | None
) -> AboutProfile:
    profile.photo_url = photo_url
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile
