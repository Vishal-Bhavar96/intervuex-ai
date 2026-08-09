from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class EducationSchema(BaseModel):
    id: Optional[int] = None
    degree: str
    branch: Optional[str] = None
    college: str
    graduation_year: Optional[int] = None
    cgpa: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SkillSchema(BaseModel):
    id: Optional[int] = None
    category: str  # Language, Framework, Database, Cloud, DevOps, Tool
    name: str
    proficiency: Optional[str] = "Intermediate"
    model_config = ConfigDict(from_attributes=True)

class ProjectSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    responsibilities: Optional[str] = None
    features: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CertificationSchema(BaseModel):
    id: Optional[int] = None
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CandidateProfileCreate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = "Entry-Level"
    preferred_industry: Optional[str] = None
    educations: Optional[List[EducationSchema]] = []
    skills: Optional[List[SkillSchema]] = []
    projects: Optional[List[ProjectSchema]] = []
    certifications: Optional[List[CertificationSchema]] = []

class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_industry: Optional[str] = None

class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_industry: Optional[str] = None
    educations: List[EducationSchema] = []
    skills: List[SkillSchema] = []
    projects: List[ProjectSchema] = []
    certifications: List[CertificationSchema] = []
    model_config = ConfigDict(from_attributes=True)
