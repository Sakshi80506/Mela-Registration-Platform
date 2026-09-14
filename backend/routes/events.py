from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import uuid

from backend.schemas.event import EventCreate, EventUpdate, EventResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/events", tags=["Events"])

def compute_event_status(data: dict) -> str:
    start_date = data.get("startDate") or data.get("date")
    end_date = data.get("endDate") or data.get("date") or start_date
    if not start_date:
        return data.get("status", "upcoming")
    
    start_time = data.get("startTime", "00:00")
    end_time = data.get("endTime", "23:59")
    
    try:
        start_str = f"{start_date.split('T')[0]} {start_time}"
        end_str = f"{end_date.split('T')[0]} {end_time}"
        
        start_dt = datetime.strptime(start_str, "%Y-%m-%d %H:%M")
        end_dt = datetime.strptime(end_str, "%Y-%m-%d %H:%M")
        now = datetime.now()
        
        if now < start_dt:
            return "upcoming"
        elif start_dt <= now <= end_dt:
            return "ongoing"
        else:
            return "closed"
    except Exception:
        today_str = datetime.now().strftime("%Y-%m-%d")
        if today_str < start_date:
            return "upcoming"
        elif today_str > end_date:
            return "closed"
        return "ongoing"

@router.get("", response_model=List[EventResponse])
def get_events(
    status_filter: Optional[str] = Query(None, alias="status"),
    city: Optional[str] = None
):
    db = get_db()
    if not db:
        # Fallback empty list if db not connected
        return []
    
    try:
        events_ref = db.collection("events")
        query = events_ref
        if city:
            query = query.where("city", "==", city)
            
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            data["status"] = compute_event_status(data)
            
            if status_filter and data["status"] != status_filter:
                continue
            
            # Count approved artisans
            app_count = db.collection("kaarigarApplications")\
                .where("eventId", "==", doc.id)\
                .where("status", "==", "approved")\
                .stream()
            data["approvedArtisansCount"] = len(list(app_count))
            
            # Count visitors
            vis_count = db.collection("visitorRegistrations")\
                .where("eventId", "==", doc.id)\
                .stream()
            data["registeredVisitorsCount"] = len(list(vis_count))
            
            results.append(EventResponse(**data))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc = db.collection("events").document(event_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    
    data = doc.to_dict()
    data["id"] = doc.id
    data["status"] = compute_event_status(data)
    
    app_count = db.collection("kaarigarApplications")\
        .where("eventId", "==", event_id)\
        .where("status", "==", "approved")\
        .stream()
    data["approvedArtisansCount"] = len(list(app_count))
    
    vis_count = db.collection("visitorRegistrations")\
        .where("eventId", "==", event_id)\
        .stream()
    data["registeredVisitorsCount"] = len(list(vis_count))
    
    return EventResponse(**data)

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    event_dict = event.model_dump()
    event_dict["createdAt"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection("events").document()
    doc_ref.set(event_dict)
    
    event_dict["id"] = doc_ref.id
    event_dict["approvedArtisansCount"] = 0
    event_dict["registeredVisitorsCount"] = 0
    return EventResponse(**event_dict)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event_update: EventUpdate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc_ref = db.collection("events").document(event_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {k: v for k, v in event_update.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow().isoformat()
    
    doc_ref.update(update_data)
    
    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = event_id
    return EventResponse(**updated_doc)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc_ref = db.collection("events").document(event_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Event not found")
    
    doc_ref.delete()
    return None
