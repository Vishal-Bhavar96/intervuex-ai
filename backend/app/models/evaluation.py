from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnswerEvaluation(Base):
    __tablename__ = "answer_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("interview_answers.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    technical_score = Column(Float, nullable=False)
    relevance_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    
    strengths_json = Column(Text, nullable=True)
    weaknesses_json = Column(Text, nullable=True)
    missing_concepts_json = Column(Text, nullable=True)
    recommended_follow_up = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    answer = relationship("InterviewAnswer", back_populates="evaluation")


class InterviewScore(Base):
    __tablename__ = "interview_scores"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    overall_score = Column(Float, nullable=False)
    technical_score = Column(Float, nullable=False)
    problem_solving_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    project_knowledge_score = Column(Float, nullable=False)
    job_relevance_score = Column(Float, nullable=False)
    
    career_readiness_score = Column(Float, nullable=False)
    readiness_category = Column(String(100), nullable=False)  # Excellent, Interview Ready, Needs Minor Improvement, Needs Improvement, Needs Significant Preparation
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    interview = relationship("Interview", back_populates="score")
