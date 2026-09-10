import datetime
from backend.firebase_admin_setup import get_db, initialize_firebase

def seed_database():
    print("Initializing Firebase Admin...")
    db = get_db()
    if not db:
        print("Firebase Admin could not be initialized. Please check your .env or credentials.")
        return

    print("Seeding initial events...")
    sample_events = [
        {
            "name": "Dastkar Winter Craft Heritage Mela",
            "date": "2026-10-15",
            "startTime": "10:00",
            "endTime": "20:00",
            "location": "Nature Bazaar, Andheria Modh, Chattarpur",
            "city": "New Delhi",
            "state": "Delhi",
            "description": "A celebrated 10-day cultural celebration bringing together master weavers, terracotta artisans, brass craftsmen, and folk artists across India.",
            "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
            "maxArtisans": 80,
            "maxVisitors": 5000,
            "status": "upcoming",
            "createdAt": datetime.datetime.utcnow().isoformat()
        },
        {
            "name": "Shilpgram Craft & Folk Carnival",
            "date": "2026-11-05",
            "startTime": "11:00",
            "endTime": "21:00",
            "location": "Shilpgram Complex, Rani Road",
            "city": "Udaipur",
            "state": "Rajasthan",
            "description": "Experience the regal crafts of Rajasthan and western India. Features live block printing demonstrations, blue pottery workshops, and camel leather craft.",
            "image": "https://images.unsplash.com/photo-1599818817290-7f2bf8f23f6d?auto=format&fit=crop&w=1200&q=80",
            "maxArtisans": 60,
            "maxVisitors": 4000,
            "status": "upcoming",
            "createdAt": datetime.datetime.utcnow().isoformat()
        },
        {
            "name": "Bengal Handloom & Terracotta Grand Expo",
            "date": "2026-11-20",
            "startTime": "10:30",
            "endTime": "19:30",
            "location": "Milan Mela Prangan, EM Bypass",
            "city": "Kolkata",
            "state": "West Bengal",
            "description": "Showcasing Bankura terracotta sculptures, authentic Jamdani and Baluchari silk sarees, Dhokra metal casting, and wooden mask artisans.",
            "image": "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80",
            "maxArtisans": 100,
            "maxVisitors": 8000,
            "status": "upcoming",
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
    ]

    for ev in sample_events:
        ref = db.collection("events").document()
        ref.set(ev)
        print(f"Created event: {ev['name']} (ID: {ref.id})")

    print("Seed completed successfully!")

if __name__ == "__main__":
    seed_database()
