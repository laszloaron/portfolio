from pydantic import BaseModel, EmailStr, Field

class ContactMessage(BaseModel):
    reply_to: EmailStr | None = None
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)
