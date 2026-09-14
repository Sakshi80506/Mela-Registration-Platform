import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from backend.config import settings

logger = logging.getLogger("uvicorn")

db = None
auth_client = None
storage_bucket = None

def initialize_firebase():
    global db, auth_client, storage_bucket
    if not firebase_admin._apps:
        try:
            # Check default serviceAccountKey in backend directory first
            default_key_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
            cred_path = settings.FIREBASE_CREDENTIALS_PATH

            if cred_path and os.path.isabs(cred_path) and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase Admin initialized from {cred_path}")
            elif cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(os.path.abspath(cred_path))
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase Admin initialized from {cred_path}")
            elif os.path.exists(default_key_path):
                cred = credentials.Certificate(default_key_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized from backend/serviceAccountKey.json.")
            elif settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PRIVATE_KEY and settings.FIREBASE_CLIENT_EMAIL:
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized from environment variables.")
            else:
                logger.warning("Firebase credentials not fully configured. Running in standalone mode.")
                return None
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
            return None

    try:
        db = firestore.client()
        auth_client = auth
        logger.info("Firestore client established.")
        return db
    except Exception as e:
        logger.error(f"Error establishing Firestore client: {e}")
        return None

def get_db():
    global db
    if db is None:
        initialize_firebase()
    return db
