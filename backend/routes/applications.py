from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from backend.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    event_id: Optional[str] = Query(None, alias="eventId"),
    kaarigar_id: Optional[str] = Query(None, alias="kaarigarId"),
    status_filter: Optional[str] = Query(None, alias="status")
):
    db = get_db()
    if not db:
        return []
    
    try:
        ref = db.collection("kaarigarApplications")
        query = ref
        if event_id:
            query = query.where("eventId", "==", event_id)
        if kaarigar_id:
            query = query.where("kaarigarId", "==", kaarigar_id)
        if status_filter:
            query = query.where("status", "==", status_filter)
            
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            
            # Enrich with event & kaarigar details if available
            try:
                ev_doc = db.collection("events").document(data.get("eventId", "")).get()
                if ev_doc.exists:
                    ev_data = ev_doc.to_dict()
                    data["eventName"] = ev_data.get("name")
                    data["eventDate"] = ev_data.get("date")
                    data["eventLocation"] = ev_data.get("location")
            except Exception:
                pass
                
            try:
                k_doc = db.collection("kaarigars").document(data.get("kaarigarId", "")).get()
                if k_doc.exists:
                    k_data = k_doc.to_dict()
                    data["kaarigarName"] = k_data.get("name")
                    data["kaarigarEmail"] = k_data.get("email")
                    data["kaarigarPhone"] = k_data.get("phone")
                    data["kaarigarCity"] = k_data.get("city")
                    data["kaarigarProfilePhoto"] = k_data.get("profilePhoto")
            except Exception:
                pass
                
            results.append(ApplicationResponse(**data))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc = db.collection("kaarigarApplications").document(app_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")
    
    data = doc.to_dict()
    data["id"] = doc.id
    return ApplicationResponse(**data)

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(app: ApplicationCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    # Verify event exists
    event_doc = db.collection("events").document(app.eventId).get()
    if not event_doc.exists:
        raise HTTPException(status_code=404, detail="Mela event not found")
    
    # Check if already applied
    if app.kaarigarId:
        existing = list(db.collection("kaarigarApplications")
                        .where("eventId", "==", app.eventId)
                        .where("kaarigarId", "==", app.kaarigarId)
                        .limit(1).stream())
        if existing:
            raise HTTPException(status_code=400, detail="You have already submitted an application for this mela.")

    app_data = app.model_dump()
    app_data["status"] = "pending"
    app_data["appliedAt"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection("kaarigarApplications").document()
    doc_ref.set(app_data)
    app_data["id"] = doc_ref.id
    return ApplicationResponse(**app_data)

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(app_id: str, status_payload: ApplicationStatusUpdate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc_ref = db.collection("kaarigarApplications").document(app_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_dict = {
        "status": status_payload.status,
        "reviewedAt": datetime.utcnow().isoformat(),
    }
    if status_payload.reviewNotes:
        update_dict["reviewNotes"] = status_payload.reviewNotes
        
    doc_ref.update(update_dict)
    
    data = doc_ref.get().to_dict()
    data["id"] = app_id
    return ApplicationResponse(**data)
