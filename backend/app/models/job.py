from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    domain = Column(String(100), nullable=True)
    experience_required = Column(String(100), nullable=True)
    
    # Store JSON strings for skills and keywords
    required_skills_json = Column(Text, nullable=True)
    preferred_skills_json = Column(Text, nullable=True)
    responsibilities_json = Column(Text, nullable=True)
    keywords_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("CandidateProfile", back_populates="job_descriptions")
    job_matches = relationship("JobMatchScore", back_populates="job_description", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job_description")


class JobMatchScore(Base):
    __tablename__ = "job_match_scores"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    match_percentage = Column(Float, nullable=False)
    matched_skills_json = Column(Text, nullable=True)
    missing_skills_json = Column(Text, nullable=True)
    partial_skills_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="job_matches")
    job_description = relationship("JobDescription", back_populates="job_matches")
