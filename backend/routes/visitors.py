from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from backend.schemas.visitor import VisitorRegistrationCreate, VisitorRegistrationResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/visitors", tags=["Visitors"])

@router.get("/registrations", response_model=List[VisitorRegistrationResponse])
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
            
            # Enrich with event info if possible
            try:
                ev_id = data.get("eventId")
                if ev_id:
                    ev_doc = db.collection("events").document(ev_id).get()
                    if ev_doc.exists:
                        ev_data = ev_doc.to_dict()
                        data["eventName"] = ev_data.get("name")
                        data["eventDate"] = ev_data.get("date") or ev_data.get("startDate")
                        data["eventLocation"] = ev_data.get("location")
            except Exception:
                pass
                
            results.append(VisitorRegistrationResponse(**data))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registrations/{reg_id}", response_model=VisitorRegistrationResponse)
def get_visitor_registration(reg_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc = db.collection("visitorRegistrations").document(reg_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    data = doc.to_dict()
    data["id"] = doc.id
    return VisitorRegistrationResponse(**data)

@router.post("/register", response_model=VisitorRegistrationResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=VisitorRegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_visitor(reg: VisitorRegistrationCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    # Check duplicate
    if reg.visitorId:
        dup = list(db.collection("visitorRegistrations")
                   .where("eventId", "==", reg.eventId)
                   .where("visitorId", "==", reg.visitorId)
                   .limit(1).stream())
        if dup:
            raise HTTPException(status_code=400, detail="You are already registered for this event.")
    else:
        dup = list(db.collection("visitorRegistrations")
                   .where("eventId", "==", reg.eventId)
                   .where("email", "==", reg.email)
                   .limit(1).stream())
        if dup:
            raise HTTPException(status_code=400, detail="Email already registered for this event.")
            
    reg_data = reg.model_dump()
    reg_data["createdAt"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection("visitorRegistrations").document()
    doc_ref.set(reg_data)
    reg_data["id"] = doc_ref.id
    return VisitorRegistrationResponse(**reg_data)

@router.delete("/registrations/{reg_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/{reg_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_visitor_registration(reg_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc_ref = db.collection("visitorRegistrations").document(reg_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    doc_ref.delete()
    return None
