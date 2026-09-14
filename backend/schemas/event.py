from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class EventBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=150)
    date: str = Field(..., description="YYYY-MM-DD format")
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    startTime: str = Field(..., description="HH:MM format")
    endTime: str = Field(..., description="HH:MM format")
    location: str = Field(..., min_length=3)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    mapUrl: Optional[str] = None
    description: str = Field(..., min_length=10)
    image: Optional[str] = None
    maxArtisans: int = Field(default=50, ge=1)
    maxVisitors: Optional[int] = Field(default=1000, ge=1)
    status: Literal["upcoming", "ongoing", "closed", "completed", "cancelled"] = "upcoming"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    mapUrl: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    maxArtisans: Optional[int] = None
    maxVisitors: Optional[int] = None
    status: Optional[Literal["upcoming", "ongoing", "closed", "completed", "cancelled"]] = None

class EventResponse(EventBase):
    id: str
    createdBy: Optional[str] = None
    createdAt: Optional[str] = None
    approvedArtisansCount: Optional[int] = 0
    registeredVisitorsCount: Optional[int] = 0
