from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class InterviewCreate(BaseModel):
    job_description_id: Optional[int] = None
    type: str = "TECHNICAL"  # TECHNICAL, HR, BEHAVIORAL, PROJECT_DEFENSE, CODING, MIXED, JOB_SPECIFIC, RESUME_BASED
    difficulty: str = "MEDIUM"  # EASY, MEDIUM, HARD, EXPERT
    total_questions: int = 10
    instant_feedback_enabled: bool = True

class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str
    audio_url: Optional[str] = None
    time_taken_seconds: Optional[int] = 0

class AnswerEvaluationResponse(BaseModel):
    id: int
    answer_id: int
    technical_score: float
    relevance_score: float
    completeness_score: float
    communication_score: float
    overall_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    missing_concepts: List[str] = []
    recommended_follow_up: Optional[str] = None
    evaluated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InterviewQuestionResponse(BaseModel):
    id: int
    interview_id: int
    sequence_number: int
    question_text: str
    question_type: str
    difficulty: str
    context_reason: Optional[str] = None
    expected_topics: List[str] = []
    follow_up_depth: int = 0
    code_starter: Optional[str] = None
    code_language: Optional[str] = "python"
    resume_source: Optional[str] = "RESUME"
    skill: Optional[str] = None
    project: Optional[str] = None
    reasons: List[str] = []
    answer: Optional[AnswerSubmit] = None
    evaluation: Optional[AnswerEvaluationResponse] = None
    model_config = ConfigDict(from_attributes=True)


class InterviewScoreResponse(BaseModel):
    id: int
    interview_id: int
    overall_score: float
    technical_score: float
    problem_solving_score: float
    communication_score: float
    project_knowledge_score: float
    job_relevance_score: float
    career_readiness_score: float
    readiness_category: str
    calculated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InterviewResponse(BaseModel):
    id: int
    candidate_id: int
    job_description_id: Optional[int] = None
    type: str
    difficulty: str
    total_questions: int
    status: str
    instant_feedback_enabled: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    questions: List[InterviewQuestionResponse] = []
    score: Optional[InterviewScoreResponse] = None
    model_config = ConfigDict(from_attributes=True)

class CodingRunRequest(BaseModel):
    code: str
    language: str = "python"
    test_cases: Optional[List[dict]] = []

class CodingRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float
    passed_test_cases: int
    total_test_cases: int
    error: Optional[str] = None
