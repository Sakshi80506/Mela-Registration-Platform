from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import uuid

from backend.schemas.event import EventCreate, EventUpdate, EventResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/events", tags=["Events"])

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
        if status_filter:
            query = query.where("status", "==", status_filter)
        if city:
            query = query.where("city", "==", city)
            
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            
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
