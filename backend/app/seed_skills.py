import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.models import Skill
from app.core.config import settings

async def seed_skills():
    engine = create_async_engine(str(settings.DATABASE_URL))
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        # Check if skills already exist
        result = await db.execute(select(Skill))
        if result.scalars().first():
            print("Skills already seeded.")
            return

        skills = [
            # Languages
            Skill(name="Python", category="language", proficiency=5),
            Skill(name="TypeScript", category="language", proficiency=4),
            Skill(name="JavaScript", category="language", proficiency=5),
            Skill(name="SQL", category="language", proficiency=4),
            Skill(name="HTML/CSS", category="language", proficiency=5),
            
            # Frameworks
            Skill(name="FastAPI", category="framework", proficiency=5),
            Skill(name="React", category="framework", proficiency=5),
            Skill(name="Next.js", category="framework", proficiency=4),
            Skill(name="Express", category="framework", proficiency=4),
            
            # Tools/Others
            Skill(name="Docker", category="tool", proficiency=4),
            Skill(name="PostgreSQL", category="tool", proficiency=5),
            Skill(name="Git", category="tool", proficiency=5),
            Skill(name="OpenAI API", category="tool", proficiency=4),
        ]

        db.add_all(skills)
        await db.commit()
        print("Skills seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_skills())
