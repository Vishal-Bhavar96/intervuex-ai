from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. QA001, LR005
    section = Column(String(100), nullable=False, index=True) # Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation, Analytical Reasoning
    topic = Column(String(100), nullable=False, index=True) # Percentages, Series, Grammar, etc.
    difficulty = Column(String(50), default="Medium", index=True) # Easy, Medium, Hard
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False) # JSON array of 4 option strings
    correct_option = Column(Integer, nullable=False) # 0-indexed integer (0, 1, 2, 3)
    explanation = Column(Text, nullable=True)
    time_estimate_seconds = Column(Integer, default=60)
    tags_json = Column(Text, nullable=True) # JSON list of string tags
    company_patterns_json = Column(Text, nullable=True) # JSON list of company styles: ["General", "TCS-style", "Wipro-style", ...]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate_answers = relationship("AptitudeCandidateAnswer", back_populates="question", cascade="all, delete-orphan")


class AptitudeTestConfig(Base):
    __tablename__ = "aptitude_test_configs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="MNC-Style Aptitude Practice Assessment")
    description = Column(Text, default="Evaluate your quantitative, logical, verbal and analytical skills with an MNC-style placement assessment.")
    total_questions = Column(Integer, default=40)
    duration_minutes = Column(Integer, default=45)
    negative_marking_enabled = Column(Boolean, default=True)
    correct_marks = Column(Float, default=1.0)
    negative_marks = Column(Float, default=0.25)
    passing_score = Column(Float, default=60.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AptitudeTestAttempt(Base):
    __tablename__ = "aptitude_test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    config_id = Column(Integer, ForeignKey("aptitude_test_configs.id", ondelete="SET NULL"), nullable=True)
    
    company_pattern = Column(String(100), default="General MNC") # General MNC, TCS-style, Wipro-style, etc.
    difficulty_mode = Column(String(50), default="Mixed") # Easy, Medium, Hard, Mixed
    
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="IN_PROGRESS", index=True) # IN_PROGRESS, SUBMITTED, EXPIRED, CANCELLED
    
    total_questions = Column(Integer, default=40)
    total_score = Column(Float, default=0.0)
    max_possible_score = Column(Float, default=40.0)
    percentage = Column(Float, default=0.0)
    accuracy = Column(Float, default=0.0)
    time_taken_seconds = Column(Integer, default=0)
    
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    unanswered_count = Column(Integer, default=0)
    
    performance_level = Column(String(50), default="Pending") # Excellent, Strong, Good, Needs Improvement, Requires Preparation
    
    section_scores_json = Column(Text, nullable=True) # JSON object mapping section name -> breakdown stats
    strengths_json = Column(Text, nullable=True) # JSON array of strength topics
    weaknesses_json = Column(Text, nullable=True) # JSON array of weak topics
    recommendations_json = Column(Text, nullable=True) # JSON array of practice recommendations
    time_analysis_json = Column(Text, nullable=True) # JSON object of time per section/question stats

    candidate = relationship("CandidateProfile", backref="aptitude_attempts")
    config = relationship("AptitudeTestConfig")
    answers = relationship("AptitudeCandidateAnswer", back_populates="attempt", cascade="all, delete-orphan")
    monitoring_events = relationship("AptitudeMonitoringEvent", back_populates="attempt", cascade="all, delete-orphan")


class AptitudeCandidateAnswer(Base):
    __tablename__ = "aptitude_candidate_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("aptitude_test_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("aptitude_questions.id", ondelete="CASCADE"), nullable=False)
    
    selected_option = Column(Integer, nullable=True) # 0, 1, 2, 3 or null if un-answered
    is_correct = Column(Boolean, nullable=True)
    is_marked_for_review = Column(Boolean, default=False)
    time_spent_seconds = Column(Integer, default=0)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    attempt = relationship("AptitudeTestAttempt", back_populates="answers")
    question = relationship("AptitudeQuestion", back_populates="candidate_answers")


class AptitudeMonitoringEvent(Base):
    __tablename__ = "aptitude_monitoring_events"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("aptitude_test_attempts.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False) # TAB_SWITCH, CAMERA_DISCONNECTED, CAMERA_PERMISSION_REVOKED, FULLSCREEN_EXIT
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_json = Column(Text, nullable=True) # JSON object with event details

    attempt = relationship("AptitudeTestAttempt", back_populates="monitoring_events")
