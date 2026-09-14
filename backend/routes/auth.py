from fastapi import APIRouter, HTTPException, status
from typing import Optional
from datetime import datetime

from backend.schemas.user import UserCreate, UserResponse, UserBase
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/auth", tags=["Authentication & Users"])

@router.get("/user/{uid}", response_model=UserResponse)
def get_user_profile(uid: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = doc.to_dict()
    data["uid"] = doc.id
    return UserResponse(**data)

@router.post("/user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_or_sync_user(user: UserBase):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    user_data = user.model_dump()
    user_data["updatedAt"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection("users").document(user.uid)
    doc = doc_ref.get()
    if not doc.exists:
        user_data["createdAt"] = datetime.utcnow().isoformat()
        doc_ref.set(user_data)
    else:
        doc_ref.update(user_data)
        
    res_data = doc_ref.get().to_dict()
    res_data["uid"] = user.uid
    return UserResponse(**res_data)

@router.delete("/user/{uid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_data(uid: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database service not available")
    
    # Remove user document
    db.collection("users").document(uid).delete()
    
    # Remove any kaarigar profile
    kaarigars = db.collection("kaarigars").where("userId", "==", uid).stream()
    for k in kaarigars:
        k.reference.delete()
        
    # Remove visitor registrations
    regs = db.collection("visitorRegistrations").where("visitorId", "==", uid).stream()
    for r in regs:
        r.reference.delete()
        
    return None
