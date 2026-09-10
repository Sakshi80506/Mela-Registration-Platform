from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class VisitorRegistrationCreate(BaseModel):
    eventId: str
    visitorId: Optional[str] = None
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    numberOfVisitors: int = Field(default=1, ge=1, le=10)

class VisitorRegistrationResponse(BaseModel):
    id: str
    visitorId: Optional[str] = None
    eventId: str
    name: str
    email: EmailStr
    phone: str
    numberOfVisitors: int = 1
    createdAt: Optional[str] = None
    eventName: Optional[str] = None
    eventDate: Optional[str] = None
    eventLocation: Optional[str] = None
