from __future__ import annotations

import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AboutProfileOut(BaseModel):
    id: int
    name: str
    bio: str
    photo_url: Optional[str] = None
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class AboutProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    bio: str = Field(..., min_length=1)
