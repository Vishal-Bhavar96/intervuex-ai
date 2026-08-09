from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class JobDescriptionCreate(BaseModel):
    title: str
    raw_text: str
    domain: Optional[str] = None
    experience_required: Optional[str] = None

class JobDescriptionResponse(BaseModel):
    id: int
    candidate_id: int
    title: str
    raw_text: str
    domain: Optional[str] = None
    experience_required: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    responsibilities: List[str] = []
    keywords: List[str] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_description_id: int
    match_percentage: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    partial_skills: List[str] = []
    explanation: str
    calculated_at: datetime
    model_config = ConfigDict(from_attributes=True)
