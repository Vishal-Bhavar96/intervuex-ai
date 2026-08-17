from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.interview import InterviewResponse, InterviewScoreResponse
from app.schemas.roadmap import SkillGapResponse, PreparationPlanResponse

class CandidateDashboardMetrics(BaseModel):
    resume_completed: bool = False
    resume_score: float = 0.0
    job_match_completed: bool = False
    job_match_score: float = 0.0
    interview_completed: bool = False
    interview_score: Optional[float] = 0.0
    aptitude_completed: bool = False
    aptitude_score: Optional[float] = 0.0
    career_readiness_score: float = 0.0
    readiness_category: str = "Pending Evaluation"
    last_aptitude_date: Optional[str] = None
    best_aptitude_score: Optional[float] = 0.0
    total_aptitude_tests_completed: Optional[int] = 0
    total_interviews_completed: int = 0
    completed_parameters_count: Optional[int] = 0
    recent_interviews: List[InterviewResponse] = []
    top_skill_gaps: List[SkillGapResponse] = []
    active_preparation_plan: Optional[PreparationPlanResponse] = None
    performance_trends: Dict[str, Any] = {}

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
