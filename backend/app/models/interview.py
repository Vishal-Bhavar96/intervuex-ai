from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True)
    
    # Types: TECHNICAL, HR, BEHAVIORAL, PROJECT_DEFENSE, CODING, MIXED, JOB_SPECIFIC, RESUME_BASED
    type = Column(String(50), default="TECHNICAL", nullable=False)
    
    # Difficulty: EASY, MEDIUM, HARD, EXPERT
    difficulty = Column(String(50), default="MEDIUM", nullable=False)
    total_questions = Column(Integer, default=10, nullable=False)
    
    # Status: CREATED, READY, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED
    status = Column(String(50), default="CREATED", nullable=False)
    instant_feedback_enabled = Column(Boolean, default=True, nullable=False)
    
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="interviews")
    job_description = relationship("JobDescription", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewQuestion.sequence_number")
    score = relationship("InterviewScore", back_populates="interview", uselist=False, cascade="all, delete-orphan")
    preparation_plans = relationship("PreparationPlan", back_populates="interview")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="technical")  # technical, behavioral, project, coding
    difficulty = Column(String(50), default="MEDIUM")
    context_reason = Column(Text, nullable=True)
    expected_topics_json = Column(Text, nullable=True)
    follow_up_depth = Column(Integer, default=0)
    
    # Optional fields for coding questions
    code_starter = Column(Text, nullable=True)
    code_language = Column(String(50), default="python")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    answer_text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    time_taken_seconds = Column(Integer, default=0)

    question = relationship("InterviewQuestion", back_populates="answer")
    evaluation = relationship("AnswerEvaluation", back_populates="answer", uselist=False, cascade="all, delete-orphan")
