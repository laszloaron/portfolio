from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_superuser
from app.crud import project as project_crud
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.models.models import User

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[Project], summary="Get all projects")
async def read_projects(db: AsyncSession = Depends(get_db)):
    """Fetch all projects. Public route."""
    return await project_crud.get_projects(db)

@router.get("/{project_id}", response_model=Project, summary="Get project by ID")
async def read_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Fetch a single project by ID. Public route."""
    project = await project_crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED, summary="[Superuser] Create project")
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser)
):
    """Create a new project. Superuser only."""
    return await project_crud.create_project(db, data)

@router.patch("/{project_id}", response_model=Project, summary="[Superuser] Update project")
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser)
):
    """Update a project. Superuser only."""
    project = await project_crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return await project_crud.update_project(db, project, data)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="[Superuser] Delete project")
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser)
):
    """Delete a project. Superuser only."""
    project = await project_crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await project_crud.delete_project(db, project)
    return None
