from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from backend.schemas.kaarigar import KaarigarCreate, KaarigarUpdate, KaarigarResponse
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/kaarigars", tags=["Kaarigars"])

@router.get("", response_model=List[KaarigarResponse])
def get_kaarigars(
    craft_type: Optional[str] = Query(None, alias="craftType"),
    city: Optional[str] = None
):
    db = get_db()
    if not db:
        return []
    
    try:
        ref = db.collection("kaarigars")
        query = ref
        if craft_type:
            query = query.where("craftType", "==", craft_type)
        if city:
            query = query.where("city", "==", city)
            
        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(KaarigarResponse(**data))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-user/{user_id}", response_model=KaarigarResponse)
def get_kaarigar_by_user_id(user_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    docs = list(db.collection("kaarigars").where("userId", "==", user_id).limit(1).stream())
    if not docs:
        raise HTTPException(status_code=404, detail="Kaarigar profile not found")
    
    data = docs[0].to_dict()
    data["id"] = docs[0].id
    return KaarigarResponse(**data)

@router.get("/{kaarigar_id}", response_model=KaarigarResponse)
def get_kaarigar(kaarigar_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc = db.collection("kaarigars").document(kaarigar_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Kaarigar profile not found")
    
    data = doc.to_dict()
    data["id"] = doc.id
    return KaarigarResponse(**data)

@router.post("", response_model=KaarigarResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(profile: KaarigarCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    # Check if profile already exists for this userId
    existing = list(db.collection("kaarigars").where("userId", "==", profile.userId).limit(1).stream())
    profile_data = profile.model_dump()
    
    if existing:
        doc_id = existing[0].id
        profile_data["updatedAt"] = datetime.utcnow().isoformat()
        db.collection("kaarigars").document(doc_id).update(profile_data)
        profile_data["id"] = doc_id
        return KaarigarResponse(**profile_data)
    else:
        profile_data["createdAt"] = datetime.utcnow().isoformat()
        profile_data["updatedAt"] = profile_data["createdAt"]
        doc_ref = db.collection("kaarigars").document()
        doc_ref.set(profile_data)
        profile_data["id"] = doc_ref.id
        return KaarigarResponse(**profile_data)
