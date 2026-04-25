from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_superuser
from app.crud import about as about_crud
from app.models.models import User
from app.schemas.about import AboutProfileOut, AboutProfileUpdate

router = APIRouter(prefix="/about", tags=["about"])

UPLOAD_DIR = Path("/app/uploads/about")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ─── Public ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=AboutProfileOut, summary="Get public about profile")
async def get_about(db: AsyncSession = Depends(get_db)):
    """Returns the portfolio owner's public about profile."""
    return await about_crud.get_profile(db)


# ─── Admin only ───────────────────────────────────────────────────────────────

@router.put(
    "/",
    response_model=AboutProfileOut,
    summary="[Superuser] Update name and bio",
)
async def update_about(
    data: AboutProfileUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser),
):
    """Update the about section text. Superuser only."""
    profile = await about_crud.get_profile(db)
    return await about_crud.update_profile(db, profile, data)


@router.post(
    "/photo",
    response_model=AboutProfileOut,
    summary="[Superuser] Upload profile photo",
)
async def upload_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser),
):
    """Upload / replace the profile photo. Superuser only. Max 5 MB."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: jpeg, png, webp, gif.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large (max 5 MB).",
        )

    ext = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename

    with open(dest, "wb") as f:
        f.write(contents)

    photo_url = f"/api/v1/about/photo/{filename}"
    profile = await about_crud.get_profile(db)
    return await about_crud.update_photo(db, profile, photo_url)


@router.get("/photo/{filename}", summary="Serve uploaded profile photo", include_in_schema=False)
async def serve_photo(filename: str):
    """Serve a previously uploaded profile photo."""
    safe_name = Path(filename).name
    path = UPLOAD_DIR / safe_name
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    return FileResponse(str(path))
