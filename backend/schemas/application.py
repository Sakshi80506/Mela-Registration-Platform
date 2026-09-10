from pydantic import BaseModel, Field
from typing import Optional, Literal

class ApplicationBase(BaseModel):
    eventId: str
    craftType: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    craftImage: Optional[str] = None
    message: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    kaarigarId: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: Literal["approved", "rejected", "pending"]
    reviewNotes: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: str
    kaarigarId: str
    status: Literal["pending", "approved", "rejected"] = "pending"
    appliedAt: Optional[str] = None
    reviewedAt: Optional[str] = None
    reviewedBy: Optional[str] = None
    eventName: Optional[str] = None
    eventDate: Optional[str] = None
    eventLocation: Optional[str] = None
    kaarigarName: Optional[str] = None
    kaarigarEmail: Optional[str] = None
    kaarigarPhone: Optional[str] = None
    kaarigarCity: Optional[str] = None
    kaarigarProfilePhoto: Optional[str] = None
