from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.candidate import CandidateProfile, Education, Skill, Project, Certification
from app.schemas.candidate import (
    CandidateProfileCreate, CandidateProfileUpdate, CandidateProfileResponse,
    EducationSchema, SkillSchema, ProjectSchema, CertificationSchema
)

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])

@router.get("", response_model=CandidateProfileResponse)
def get_candidate_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id, target_role="Software Engineer")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=CandidateProfileResponse)
def update_candidate_profile(
    profile_in: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    if profile_in.phone is not None: profile.phone = profile_in.phone
    if profile_in.location is not None: profile.location = profile_in.location
    if profile_in.target_role is not None: profile.target_role = profile_in.target_role
    if profile_in.experience_level is not None: profile.experience_level = profile_in.experience_level
    if profile_in.preferred_industry is not None: profile.preferred_industry = profile_in.preferred_industry

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/education", response_model=EducationSchema)
def add_education(
    edu_in: EducationSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    edu = Education(
        candidate_id=profile.id,
        degree=edu_in.degree,
        branch=edu_in.branch,
        college=edu_in.college,
        graduation_year=edu_in.graduation_year,
        cgpa=edu_in.cgpa
    )
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.post("/skill", response_model=SkillSchema)
def add_skill(
    skill_in: SkillSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    sk = Skill(
        candidate_id=profile.id,
        category=skill_in.category,
        name=skill_in.name,
        proficiency=skill_in.proficiency or "Intermediate"
    )
    db.add(sk)
    db.commit()
    db.refresh(sk)
    return sk

@router.post("/project", response_model=ProjectSchema)
def add_project(
    proj_in: ProjectSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    p = Project(
        candidate_id=profile.id,
        title=proj_in.title,
        description=proj_in.description,
        technologies=proj_in.technologies,
        responsibilities=proj_in.responsibilities,
        features=proj_in.features
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.delete("/skill/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    sk = db.query(Skill).filter(Skill.id == skill_id, Skill.candidate_id == profile.id).first()
    if not sk:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(sk)
    db.commit()
    return {"message": "Skill deleted successfully"}

@router.delete("/project/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    p = db.query(Project).filter(Project.id == project_id, Project.candidate_id == profile.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"message": "Project deleted successfully"}
