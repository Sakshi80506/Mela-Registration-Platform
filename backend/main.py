import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.firebase_admin_setup import initialize_firebase
from backend.routes import events, kaarigars, applications, visitors, stats, auth

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kaarigar-expo")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Kaarigar Expo – Mela Registration Platform REST API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin on startup
@app.on_event("startup")
async def startup_event():
    initialize_firebase()
    logger.info("Application startup completed.")

# Include routers
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(kaarigars.router, prefix=settings.API_PREFIX)
app.include_router(applications.router, prefix=settings.API_PREFIX)
app.include_router(visitors.router, prefix=settings.API_PREFIX)
app.include_router(stats.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": "Kaarigar Expo API",
        "status": "online",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
