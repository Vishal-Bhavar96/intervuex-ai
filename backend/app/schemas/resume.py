from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.candidate import CandidateProfileResponse

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float
    tech_skills_score: float
    project_score: float
    experience_score: float
    education_score: float
    relevance_score: float
    completeness_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    missing_info: List[str] = []
    analyzed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    extracted_text_preview: str
    extracted_profile: CandidateProfileResponse
    analysis: Optional[ResumeAnalysisResponse] = None
    model_config = ConfigDict(from_attributes=True)
