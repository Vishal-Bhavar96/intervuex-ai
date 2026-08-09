import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.models.job import JobDescription, JobMatchScore
from app.services.job_analyzer import JobAnalyzerService
from app.services.match_engine import JobMatchEngineService
from app.schemas.job import JobDescriptionCreate, JobDescriptionResponse, JobMatchResponse

router = APIRouter(prefix="/job", tags=["Job Description & Matching"])

@router.post("/analyze", response_model=JobDescriptionResponse)
async def analyze_job_description(
    job_in: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()

    job_desc = await JobAnalyzerService.create_and_analyze_job_description(
        db, profile, job_in.title, job_in.raw_text, job_in.domain, job_in.experience_required
    )

    return JobDescriptionResponse(
        id=job_desc.id,
        candidate_id=job_desc.candidate_id,
        title=job_desc.title,
        raw_text=job_desc.raw_text,
        domain=job_desc.domain,
        experience_required=job_desc.experience_required,
        required_skills=json.loads(job_desc.required_skills_json or "[]"),
        preferred_skills=json.loads(job_desc.preferred_skills_json or "[]"),
        responsibilities=json.loads(job_desc.responsibilities_json or "[]"),
        keywords=json.loads(job_desc.keywords_json or "[]"),
        created_at=job_desc.created_at
    )

@router.post("/{job_id}/match", response_model=JobMatchResponse)
def match_job_with_resume(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    resume = db.query(Resume).filter(Resume.candidate_id == profile.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first to run job match analysis")

    match_score = JobMatchEngineService.calculate_match(db, resume, job)

    return JobMatchResponse(
        id=match_score.id,
        resume_id=match_score.resume_id,
        job_description_id=match_score.job_description_id,
        match_percentage=match_score.match_percentage,
        matched_skills=json.loads(match_score.matched_skills_json or "[]"),
        missing_skills=json.loads(match_score.missing_skills_json or "[]"),
        partial_skills=json.loads(match_score.partial_skills_json or "[]"),
        explanation=match_score.explanation,
        calculated_at=match_score.calculated_at
    )
