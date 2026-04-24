from pydantic import BaseModel, EmailStr, Field

class ContactMessage(BaseModel):
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)
