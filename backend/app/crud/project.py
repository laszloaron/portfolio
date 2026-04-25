from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
import uuid

async def get_projects(db: AsyncSession) -> list[Project]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return list(result.scalars().all())

async def get_project(db: AsyncSession, project_id: uuid.UUID) -> Project | None:
    return await db.get(Project, project_id)

async def create_project(db: AsyncSession, obj_in: ProjectCreate) -> Project:
    db_obj = Project(**obj_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_project(db: AsyncSession, db_obj: Project, obj_in: ProjectUpdate) -> Project:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_project(db: AsyncSession, db_obj: Project) -> None:
    await db.delete(db_obj)
    await db.commit()
