import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str
    github_link: str | None = None
    documentation: str | None = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    github_link: str | None = None
    documentation: str | None = None

class ProjectInDBBase(ProjectBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class Project(ProjectInDBBase):
    pass
