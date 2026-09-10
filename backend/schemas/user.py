from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

class UserBase(BaseModel):
    uid: str
    email: EmailStr
    name: str
    role: Literal["admin", "kaarigar", "visitor"]
    phone: Optional[str] = None
    photoUrl: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    role: Literal["kaarigar", "visitor"]
    phone: Optional[str] = None

class UserResponse(BaseModel):
    uid: str
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    photoUrl: Optional[str] = None
    createdAt: Optional[str] = None
