from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.interview import InterviewResponse, InterviewScoreResponse
from app.schemas.roadmap import SkillGapResponse, PreparationPlanResponse

class CandidateDashboardMetrics(BaseModel):
    resume_score: float
    job_match_score: float
    career_readiness_score: float
    readiness_category: str
    aptitude_score: Optional[float] = 76.0
    last_aptitude_date: Optional[str] = None
    best_aptitude_score: Optional[float] = 76.0
    total_aptitude_tests_completed: Optional[int] = 0
    total_interviews_completed: int
    recent_interviews: List[InterviewResponse] = []
    top_skill_gaps: List[SkillGapResponse] = []
    active_preparation_plan: Optional[PreparationPlanResponse] = None
    performance_trends: Dict[str, List[Dict[str, Any]]] = {}

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_interviews: int
    average_score: float
    active_users_count: int
    most_practiced_roles: List[Dict[str, Any]] = []
    popular_skills: List[Dict[str, Any]] = []
    average_readiness: float
    completion_rate: float
    recent_activity: List[Dict[str, Any]] = []
