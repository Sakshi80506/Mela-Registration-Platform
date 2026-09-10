from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.firebase_admin_setup import get_db

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/admin-dashboard", response_model=Dict[str, Any])
def get_admin_dashboard_stats():
    db = get_db()
    if not db:
        return {
            "totalMelas": 0,
            "upcomingMelas": 0,
            "totalKaarigars": 0,
            "pendingApplications": 0,
            "approvedKaarigars": 0,
            "totalVisitors": 0,
            "totalRsvps": 0
        }
    
    try:
        events = list(db.collection("events").stream())
        total_melas = len(events)
        upcoming_melas = sum(1 for e in events if e.to_dict().get("status") == "upcoming")
        
        kaarigars = list(db.collection("kaarigars").stream())
        total_kaarigars = len(kaarigars)
        
        apps = list(db.collection("kaarigarApplications").stream())
        pending_apps = sum(1 for a in apps if a.to_dict().get("status") == "pending")
        approved_apps = sum(1 for a in apps if a.to_dict().get("status") == "approved")
        
        rsvps = list(db.collection("visitorRegistrations").stream())
        total_rsvps = len(rsvps)
        
        visitors_count = len(list(db.collection("users").where("role", "==", "visitor").stream()))
        
        return {
            "totalMelas": total_melas,
            "upcomingMelas": upcoming_melas,
            "totalKaarigars": total_kaarigars,
            "pendingApplications": pending_apps,
            "approvedKaarigars": approved_apps,
            "totalVisitors": visitors_count,
            "totalRsvps": total_rsvps
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
