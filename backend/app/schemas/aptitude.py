from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Request to Start Aptitude Assessment
class StartAptitudeTestRequest(BaseModel):
    company_pattern: Optional[str] = "General MNC"
    difficulty_mode: Optional[str] = "Mixed" # Easy, Medium, Hard, Mixed
    total_questions: Optional[int] = 40
    duration_minutes: Optional[int] = 45

# Question schema for Candidate during active test (Hides correct_option & explanation)
class CandidateAptitudeQuestionSchema(BaseModel):
    id: int
    question_code: str
    section: str
    topic: str
    difficulty: str
    question_text: str
    options: List[str]
    time_estimate_seconds: int
    is_marked_for_review: Optional[bool] = False
    selected_option: Optional[int] = None

# Active Attempt State Response
class AptitudeAttemptStateResponse(BaseModel):
    attempt_id: int
    company_pattern: str
    difficulty_mode: str
    started_at: str
    expires_at: str
    remaining_seconds: int
    status: str
    total_questions: int
    duration_minutes: int
    questions: List[CandidateAptitudeQuestionSchema]

# Save Candidate Answer Request
class SaveAnswerRequest(BaseModel):
    question_id: int
    selected_option: Optional[int] = None # 0, 1, 2, 3 or None
    is_marked_for_review: Optional[bool] = False
    time_spent_seconds: Optional[int] = 0

class SaveAnswerResponse(BaseModel):
    status: str
    saved_at: str
    question_id: int
    selected_option: Optional[int]

# Submit Assessment Request
class SubmitAttemptRequest(BaseModel):
    answers: Optional[List[SaveAnswerRequest]] = []

# Section Breakdown Response
class SectionPerformanceSchema(BaseModel):
    section: str
    total_questions: int
    correct: int
    incorrect: int
    unanswered: int
    score: float
    percentage: float
    accuracy: float
    avg_time_per_question: float

# Question Review Item (Shows candidate answer vs correct answer & explanation)
class QuestionReviewSchema(BaseModel):
    question_id: int
    question_code: str
    section: str
    topic: str
    difficulty: str
    question_text: str
    options: List[str]
    candidate_answer: Optional[int]
    correct_answer: int
    is_correct: Optional[bool]
    explanation: Optional[str]

# Detailed Attempt Result Response
class AptitudeResultResponse(BaseModel):
    attempt_id: int
    candidate_name: str
    company_pattern: str
    difficulty_mode: str
    started_at: str
    submitted_at: str
    status: str
    total_questions: int
    total_score: float
    max_possible_score: float
    percentage: float
    accuracy: float
    time_taken_seconds: int
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    performance_level: str
    section_performances: List[SectionPerformanceSchema]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    question_reviews: List[QuestionReviewSchema]

# History Item Schema
class AptitudeHistoryItem(BaseModel):
    id: int
    date: str
    company_pattern: str
    difficulty_mode: str
    percentage: float
    accuracy: float
    duration_minutes: int
    performance_level: str
    status: str

# Monitoring Event Request
class RecordMonitoringEventRequest(BaseModel):
    attempt_id: int
    event_type: str # TAB_SWITCH, CAMERA_DISCONNECTED, CAMERA_PERMISSION_REVOKED, FULLSCREEN_EXIT
    metadata: Optional[Dict[str, Any]] = None

# Admin Question Schema
class AdminQuestionCreateUpdate(BaseModel):
    question_code: str
    section: str
    topic: str
    difficulty: str = "Medium"
    question_text: str
    options: List[str]
    correct_option: int
    explanation: Optional[str] = ""
    time_estimate_seconds: Optional[int] = 60
    tags: Optional[List[str]] = []
    company_patterns: Optional[List[str]] = ["General MNC"]

class AdminQuestionResponse(BaseModel):
    id: int
    question_code: str
    section: str
    topic: str
    difficulty: str
    question_text: str
    options: List[str]
    correct_option: int
    explanation: Optional[str]
    time_estimate_seconds: int
    tags: List[str]
    company_patterns: List[str]
    created_at: str
