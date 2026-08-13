import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_admin_user
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.services.aptitude_service import AptitudeService
from app.schemas.aptitude import (
    StartAptitudeTestRequest,
    AptitudeAttemptStateResponse,
    SaveAnswerRequest,
    SaveAnswerResponse,
    SubmitAttemptRequest,
    AptitudeResultResponse,
    AptitudeHistoryItem,
    RecordMonitoringEventRequest,
    AdminQuestionCreateUpdate,
    AdminQuestionResponse
)

router = APIRouter(prefix="/aptitude", tags=["Aptitude Assessment & Proctoring"])

def _get_or_create_candidate_profile(db: Session, user: User) -> CandidateProfile:
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/tests/start", response_model=AptitudeAttemptStateResponse)
def start_aptitude_test(
    req: StartAptitudeTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_candidate_profile(db, current_user)
    attempt = AptitudeService.start_test(db, profile, req)
    state = AptitudeService.get_attempt_state(db, attempt.id)
    return state


@router.get("/attempts/{attempt_id}", response_model=AptitudeAttemptStateResponse)
def get_aptitude_attempt_state(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return AptitudeService.get_attempt_state(db, attempt_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/attempts/{attempt_id}/answer", response_model=SaveAnswerResponse)
def save_candidate_answer(
    attempt_id: int,
    req: SaveAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        ans = AptitudeService.save_answer(db, attempt_id, req)
        return {
            "status": "success",
            "saved_at": ans.saved_at.isoformat(),
            "question_id": ans.question_id,
            "selected_option": ans.selected_option
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/attempts/{attempt_id}/submit", response_model=AptitudeResultResponse)
def submit_aptitude_attempt(
    attempt_id: int,
    req: Optional[SubmitAttemptRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        answers_payload = req.answers if req else None
        AptitudeService.submit_attempt(db, attempt_id, answers_payload)
        return AptitudeService.get_result(db, attempt_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/results/{attempt_id}", response_model=AptitudeResultResponse)
def get_aptitude_result(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return AptitudeService.get_result(db, attempt_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history", response_model=List[AptitudeHistoryItem])
def get_aptitude_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_candidate_profile(db, current_user)
    return AptitudeService.get_candidate_history(db, profile.id)


@router.get("/recommendations")
def get_aptitude_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_candidate_profile(db, current_user)
    history = AptitudeService.get_candidate_history(db, profile.id)
    if not history:
        return {
            "recommended_topics": [
                "Quantitative Percentages & Ratios",
                "Logical Number & Letter Series",
                "Verbal Reading Comprehension",
                "Data Interpretation Charts"
            ],
            "action": "Take your initial proctored MNC practice assessment."
        }
    
    latest_id = history[0]["id"]
    result = AptitudeService.get_result(db, latest_id)
    return {
        "weaknesses": result["weaknesses"],
        "recommendations": result["recommendations"],
        "action": "Target practice based on your latest assessment gaps."
    }


@router.post("/monitoring-event")
def record_proctoring_event(
    req: RecordMonitoringEventRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        evt = AptitudeService.record_monitoring_event(db, req.attempt_id, req.event_type, req.metadata)
        return {"status": "recorded", "event_id": evt.id, "timestamp": evt.timestamp.isoformat()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ----------------------------------------------------
# ADMIN ROUTER ENDPOINTS
# ----------------------------------------------------

@router.get("/admin/questions", response_model=List[AdminQuestionResponse])
def admin_get_all_questions(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    qs = AptitudeService.admin_get_questions(db)
    res = []
    for q in qs:
        res.append({
            "id": q.id,
            "question_code": q.question_code,
            "section": q.section,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "question_text": q.question_text,
            "options": json.loads(q.options_json) if q.options_json else [],
            "correct_option": q.correct_option,
            "explanation": q.explanation or "",
            "time_estimate_seconds": q.time_estimate_seconds,
            "tags": json.loads(q.tags_json) if q.tags_json else [],
            "company_patterns": json.loads(q.company_patterns_json) if q.company_patterns_json else [],
            "created_at": q.created_at.isoformat()
        })
    return res


@router.post("/admin/questions", response_model=AdminQuestionResponse)
def admin_create_question(
    req: AdminQuestionCreateUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    q = AptitudeService.admin_create_question(db, req)
    return {
        "id": q.id,
        "question_code": q.question_code,
        "section": q.section,
        "topic": q.topic,
        "difficulty": q.difficulty,
        "question_text": q.question_text,
        "options": json.loads(q.options_json),
        "correct_option": q.correct_option,
        "explanation": q.explanation or "",
        "time_estimate_seconds": q.time_estimate_seconds,
        "tags": json.loads(q.tags_json) if q.tags_json else [],
        "company_patterns": json.loads(q.company_patterns_json) if q.company_patterns_json else [],
        "created_at": q.created_at.isoformat()
    }


@router.delete("/admin/questions/{question_id}")
def admin_delete_question(
    question_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    success = AptitudeService.admin_delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"status": "deleted", "id": question_id}
