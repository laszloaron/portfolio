import os
import shutil
from pathlib import Path
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import User
from app.routers.auth import get_current_superuser
from app.schemas.about import AboutProfileOut, AboutProfileUpdate
from app.crud import about as about_crud

router = APIRouter()

# Directory for profile photos
UPLOAD_DIR = Path("/app/uploads/about")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=AboutProfileOut, summary="Get about profile information")
async def get_about(db: AsyncSession = Depends(get_db)):
    """Fetch the site owner's profile info. Public access."""
    return await about_crud.get_profile(db)

@router.put("/", response_model=AboutProfileOut, summary="[Superuser] Update profile text")
async def update_about(
    obj_in: AboutProfileUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser),
):
    """Update name and bio. Superuser only."""
    profile = await about_crud.get_profile(db)
    return await about_crud.update_profile(db, profile, obj_in)

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
    """Upload or replace profile photo. Superuser only."""
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Use JPEG, PNG, WEBP or GIF."
        )

    # Validate size (max 5MB)
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB."
        )

    # Generate filename and save
    ext = os.path.splitext(file.filename)[1]
    filename = f"profile_photo{ext}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update DB
    photo_url = f"/api/v1/about/photo/{filename}"
    profile = await about_crud.get_profile(db)
    return await about_crud.update_photo(db, profile, photo_url)


@router.delete(
    "/photo",
    response_model=AboutProfileOut,
    summary="[Superuser] Delete profile photo",
)
async def delete_photo(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_superuser),
):
    """Delete the profile photo. Superuser only."""
    profile = await about_crud.get_profile(db)
    # Optional: could delete the file from UPLOAD_DIR too, 
    # but setting URL to None is sufficient for the MVP.
    return await about_crud.update_photo(db, profile, None)


@router.get("/photo/{filename}", summary="Serve uploaded profile photo", include_in_schema=False)
async def serve_photo(filename: str):
    """Serve a previously uploaded profile photo."""
    # Sanitise – only bare filename, no path traversal
    safe_name = os.path.basename(filename)
    file_path = UPLOAD_DIR / safe_name
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
        
    return FileResponse(file_path)
