from __future__ import annotations

import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AboutProfile(Base):
    """Singleton table – always has exactly one row (id=1)."""

    __tablename__ = "about_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
