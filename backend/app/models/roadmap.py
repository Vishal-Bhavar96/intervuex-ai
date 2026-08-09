from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(150), nullable=False)
    required_level = Column(Float, default=80.0)
    demonstrated_level = Column(Float, default=50.0)
    gap_percentage = Column(Float, nullable=False)
    status = Column(String(50), default="IDENTIFIED")  # IDENTIFIED, IN_PROGRESS, RESOLVED
    identified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("CandidateProfile", back_populates="skill_gaps")


class PreparationPlan(Base):
    __tablename__ = "preparation_plans"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    overall_progress = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("CandidateProfile", back_populates="preparation_plans")
    interview = relationship("Interview", back_populates="preparation_plans")
    tasks = relationship("PreparationTask", back_populates="plan", cascade="all, delete-orphan", order_by="PreparationTask.week_number")


class PreparationTask(Base):
    __tablename__ = "preparation_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("preparation_plans.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, nullable=False)  # Week 1, 2, 3, 4
    topic = Column(String(255), nullable=False)
    resources_json = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    plan = relationship("PreparationPlan", back_populates="tasks")
