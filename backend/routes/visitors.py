from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from backend.schemas.visitor import VisitorRegistrationCreate, VisitorRegistrationResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/visitors", tags=["Visitors"])

@router.get("", response_model=List[VisitorRegistrationResponse])
def get_visitor_registrations(
    event_id: Optional[str] = Query(None, alias="eventId"),
    visitor_id: Optional[str] = Query(None, alias="visitorId")
):
    db = get_db()
    if not db:
        return []
    
    try:
        ref = db.collection("visitorRegistrations")
        query = ref
        if event_id:
            query = query.where("eventId", "==", event_id)
        if visitor_id:
            query = query.where("visitorId", "==", visitor_id)
            
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            
            # Attach event details
            try:
                ev_doc = db.collection("events").document(data.get("eventId", "")).get()
                if ev_doc.exists:
                    ev_data = ev_doc.to_dict()
                    data["eventName"] = ev_data.get("name")
                    data["eventDate"] = ev_data.get("date")
                    data["eventLocation"] = ev_data.get("location")
            except Exception:
                pass
                
            results.append(VisitorRegistrationResponse(**data))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register", response_model=VisitorRegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_visitor_for_event(reg: VisitorRegistrationCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    # Check event exists
    event_doc = db.collection("events").document(reg.eventId).get()
    if not event_doc.exists:
        raise HTTPException(status_code=404, detail="Mela event not found")
    
    # Prevent duplicate registration
    query = db.collection("visitorRegistrations").where("eventId", "==", reg.eventId)
    if reg.visitorId:
        dup = list(query.where("visitorId", "==", reg.visitorId).limit(1).stream())
    else:
        dup = list(query.where("email", "==", reg.email).limit(1).stream())
        
    if dup:
        raise HTTPException(status_code=400, detail="You have already registered for this Mela.")

    data = reg.model_dump()
    data["createdAt"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection("visitorRegistrations").document()
    doc_ref.set(data)
    data["id"] = doc_ref.id
    
    ev_data = event_doc.to_dict()
    data["eventName"] = ev_data.get("name")
    data["eventDate"] = ev_data.get("date")
    data["eventLocation"] = ev_data.get("location")
    
    return VisitorRegistrationResponse(**data)
