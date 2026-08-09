import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_admin_user
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import CandidateDashboardMetrics, AdminAnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])

@router.get("/dashboard", response_model=CandidateDashboardMetrics)
def get_candidate_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    metrics = AnalyticsService.get_candidate_dashboard(db, profile)
    return metrics

@router.get("/admin", response_model=AdminAnalyticsResponse)
def get_admin_analytics_data(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_admin_analytics(db)
