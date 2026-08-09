from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class SkillGapResponse(BaseModel):
    id: int
    candidate_id: int
    skill_name: str
    required_level: float
    demonstrated_level: float
    gap_percentage: float
    status: str
    identified_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PreparationTaskSchema(BaseModel):
    id: int
    plan_id: int
    week_number: int
    topic: str
    resources: List[str] = []
    is_completed: bool
    model_config = ConfigDict(from_attributes=True)

class PreparationTaskUpdate(BaseModel):
    is_completed: bool

class PreparationPlanResponse(BaseModel):
    id: int
    candidate_id: int
    interview_id: Optional[int] = None
    title: str
    overall_progress: float
    created_at: datetime
    tasks: List[PreparationTaskSchema] = []
    model_config = ConfigDict(from_attributes=True)
