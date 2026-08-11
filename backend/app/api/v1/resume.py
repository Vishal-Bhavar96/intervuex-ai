import os
import shutil
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.config import settings
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.models.resume import Resume, ResumeAnalysis
from app.services.resume_parser import ResumeParserService
from app.schemas.resume import ResumeUploadResponse, ResumeAnalysisResponse
from app.schemas.candidate import CandidateProfileResponse

router = APIRouter(prefix="/resume", tags=["Resume Management & Analysis"])

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "resume.pdf"
    ext = filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only PDF and DOCX files are allowed."
        )

    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Save file locally in upload dir
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}")
    os.makedirs(user_upload_dir, exist_ok=True)
    saved_path = os.path.join(user_upload_dir, filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse and save resume analysis
    resume, analysis = await ResumeParserService.process_and_save_resume(db, profile, saved_path, filename)
    db.refresh(profile)

    analysis_res = ResumeAnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        overall_score=analysis.overall_score,
        tech_skills_score=analysis.tech_skills_score,
        project_score=analysis.project_score,
        experience_score=analysis.experience_score,
        education_score=analysis.education_score,
        relevance_score=analysis.relevance_score,
        completeness_score=analysis.completeness_score,
        ats_score=getattr(analysis, 'ats_score', 85.0),
        ats_formatting_score=getattr(analysis, 'ats_formatting_score', 90.0),
        ats_keyword_score=getattr(analysis, 'ats_keyword_score', 82.0),
        ats_readability_score=getattr(analysis, 'ats_readability_score', 88.0),
        ats_breakdown=json.loads(getattr(analysis, 'ats_breakdown_json', None) or "{}"),
        strengths=json.loads(analysis.strengths_json or "[]"),
        weaknesses=json.loads(analysis.weaknesses_json or "[]"),
        missing_info=json.loads(analysis.missing_info_json or "[]"),
        analyzed_at=analysis.analyzed_at
    )

    return ResumeUploadResponse(
        id=resume.id,
        filename=resume.filename,
        uploaded_at=resume.uploaded_at,
        extracted_text_preview=resume.raw_text[:300] if resume.raw_text else "",
        extracted_profile=CandidateProfileResponse.model_validate(profile),
        analysis=analysis_res
    )

@router.get("/latest", response_model=ResumeAnalysisResponse)
def get_latest_resume_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    resume = db.query(Resume).filter(Resume.candidate_id == profile.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="No resume analysis found. Please upload a resume first.")

    analysis = resume.analysis
    return ResumeAnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        overall_score=analysis.overall_score,
        tech_skills_score=analysis.tech_skills_score,
        project_score=analysis.project_score,
        experience_score=analysis.experience_score,
        education_score=analysis.education_score,
        relevance_score=analysis.relevance_score,
        completeness_score=analysis.completeness_score,
        ats_score=getattr(analysis, 'ats_score', 85.0),
        ats_formatting_score=getattr(analysis, 'ats_formatting_score', 90.0),
        ats_keyword_score=getattr(analysis, 'ats_keyword_score', 82.0),
        ats_readability_score=getattr(analysis, 'ats_readability_score', 88.0),
        ats_breakdown=json.loads(getattr(analysis, 'ats_breakdown_json', None) or "{}"),
        strengths=json.loads(analysis.strengths_json or "[]"),
        weaknesses=json.loads(analysis.weaknesses_json or "[]"),
        missing_info=json.loads(analysis.missing_info_json or "[]"),
        analyzed_at=analysis.analyzed_at
    )

