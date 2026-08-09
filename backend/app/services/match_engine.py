import json
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.models.job import JobDescription, JobMatchScore
from app.models.candidate import Skill

logger = logging.getLogger(__name__)

class JobMatchEngineService:

    @staticmethod
    def calculate_match(db: Session, resume: Resume, job: JobDescription) -> JobMatchScore:
        """Compare Resume skills against Job Description required and preferred skills."""
        # Get candidate skills
        candidate_skills = db.query(Skill).filter(Skill.candidate_id == resume.candidate_id).all()
        candidate_skill_names = {s.name.lower(): s.proficiency for s in candidate_skills}

        # Also extract skills mentioned in resume raw_text
        raw_text_lower = (resume.raw_text or "").lower()

        required_skills = json.loads(job.required_skills_json or "[]")
        preferred_skills = json.loads(job.preferred_skills_json or "[]")

        matched = []
        partial = []
        missing = []

        for req in required_skills:
            req_lower = req.lower()
            if req_lower in candidate_skill_names:
                matched.append(req)
            elif req_lower in raw_text_lower:
                partial.append(req)
            else:
                missing.append(req)

        # Calculate percentage
        total_req = len(required_skills) if required_skills else 1
        matched_weight = len(matched) * 1.0
        partial_weight = len(partial) * 0.5
        
        match_percentage = round(min(100.0, ((matched_weight + partial_weight) / total_req) * 100.0), 1)

        # Build clear explanation
        explanation = (
            f"Candidate matches {len(matched)} of {len(required_skills)} core required skills. "
            f"{len(partial)} skill(s) were partially matched via resume context, "
            f"and {len(missing)} critical skill(s) are missing from the resume."
        )

        match_score = JobMatchScore(
            resume_id=resume.id,
            job_description_id=job.id,
            match_percentage=match_percentage,
            matched_skills_json=json.dumps(matched),
            missing_skills_json=json.dumps(missing),
            partial_skills_json=json.dumps(partial),
            explanation=explanation
        )

        db.add(match_score)
        db.commit()
        db.refresh(match_score)

        return match_score
