import json
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.models.job import JobDescription
from app.models.candidate import CandidateProfile
from app.ai.service import get_ai_service

logger = logging.getLogger(__name__)

class JobAnalyzerService:

    @staticmethod
    async def create_and_analyze_job_description(
        db: Session, candidate: CandidateProfile, title: str, raw_text: str, domain: str = None, experience_required: str = None
    ) -> JobDescription:
        ai_service = get_ai_service()
        analysis = await ai_service.analyze_job_description(raw_text)

        job_desc = JobDescription(
            candidate_id=candidate.id,
            title=title or analysis.get("title", "Target Job"),
            raw_text=raw_text,
            domain=domain or analysis.get("domain", "Software Engineering"),
            experience_required=experience_required or analysis.get("experience_required", "0-2 Years"),
            required_skills_json=json.dumps(analysis.get("required_skills", [])),
            preferred_skills_json=json.dumps(analysis.get("preferred_skills", [])),
            responsibilities_json=json.dumps(analysis.get("responsibilities", [])),
            keywords_json=json.dumps(analysis.get("keywords", []))
        )

        db.add(job_desc)
        db.commit()
        db.refresh(job_desc)
        return job_desc
