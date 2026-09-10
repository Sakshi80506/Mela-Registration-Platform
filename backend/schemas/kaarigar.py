from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class KaarigarBase(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    craftType: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    profilePhoto: Optional[str] = None
    craftPhoto: Optional[str] = None

class KaarigarCreate(KaarigarBase):
    userId: str

class KaarigarUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    craftType: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    profilePhoto: Optional[str] = None
    craftPhoto: Optional[str] = None

class KaarigarResponse(KaarigarBase):
    id: str
    userId: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
