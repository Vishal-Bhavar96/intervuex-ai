import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.database import init_db, SessionLocal
from app.core.seed import seed_demo_data
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.resume import router as resume_router
from app.api.v1.job_description import router as job_router
from app.api.v1.interview import router as interview_router
from app.api.v1.coding import router as coding_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router
from app.api.v1.aptitude import router as aptitude_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intervuex")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing IntervueX Database Schema...")
    init_db()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    logger.info("IntervueX Backend ready.")
    yield
    logger.info("IntervueX Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Adaptive AI Interview & Career Readiness Platform API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev flex
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(profile_router, prefix=api_v1_prefix)
app.include_router(resume_router, prefix=api_v1_prefix)
app.include_router(job_router, prefix=api_v1_prefix)
app.include_router(interview_router, prefix=api_v1_prefix)
app.include_router(coding_router, prefix=api_v1_prefix)
app.include_router(analytics_router, prefix=api_v1_prefix)
app.include_router(admin_router, prefix=api_v1_prefix)
app.include_router(aptitude_router, prefix=api_v1_prefix)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
