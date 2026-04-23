from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import AsyncSessionLocal

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Check API and database connectivity."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        db_status = f"error: {exc}"

    return {"api": "ok", "database": db_status}
