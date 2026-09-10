from fastapi import APIRouter, HTTPException, status
from backend.schemas.user import UserCreate, UserResponse
from backend.firebase_admin_setup import get_db, auth_client
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/sync-user", response_model=UserResponse)
def sync_user(user: UserResponse):
    """
    Sync user details from Firebase Auth to Firestore users collection
    """
    db = get_db()
    if not db:
        return user
        
    try:
        user_ref = db.collection("users").document(user.uid)
        doc = user_ref.get()
        if not doc.exists:
            user_data = user.model_dump()
            user_data["createdAt"] = datetime.utcnow().isoformat()
            user_ref.set(user_data)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
