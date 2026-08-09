import json
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User, AuditLog
from app.models.candidate import CandidateProfile, Education, Skill, Project, Certification
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import JobDescription, JobMatchScore
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.evaluation import AnswerEvaluation, InterviewScore
from app.models.roadmap import SkillGap, PreparationPlan, PreparationTask

logger = logging.getLogger(__name__)

def seed_demo_data(db: Session):
    """Seed initial demo users and candidate profile into the database if missing."""
    # 1. Candidate User
    candidate_user = db.query(User).filter(User.email == "candidate@intervuex.com").first()
    if not candidate_user:
        logger.info("Seeding demo candidate user (candidate@intervuex.com)...")
        candidate_user = User(
            email="candidate@intervuex.com",
            hashed_password=get_password_hash("Password123!"),
            full_name="Jane Candidate",
            role="CANDIDATE",
            is_active=True
        )
        db.add(candidate_user)
        db.commit()
        db.refresh(candidate_user)

    # 2. Admin User
    admin_user = db.query(User).filter(User.email == "admin@intervuex.com").first()
    if not admin_user:
        logger.info("Seeding demo admin user (admin@intervuex.com)...")
        admin_user = User(
            email="admin@intervuex.com",
            hashed_password=get_password_hash("Password123!"),
            full_name="System Admin",
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # 3. Candidate Profile
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == candidate_user.id).first()
    if not profile:
        profile = CandidateProfile(
            user_id=candidate_user.id,
            phone="+1 (555) 019-2834",
            location="San Francisco, CA",
            target_role="Python Backend Developer",
            experience_level="Entry-Level",
            preferred_industry="Software Engineering / SaaS"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Educations
        db.add(Education(
            candidate_id=profile.id,
            degree="Bachelor of Technology",
            branch="Computer Science & Engineering",
            college="Institute of Technology",
            graduation_year=2025,
            cgpa="8.8 / 10"
        ))

        # Technical Skills
        skills = [
            ("Python", "Language", "Advanced"),
            ("FastAPI", "Framework", "Intermediate"),
            ("PostgreSQL", "Database", "Intermediate"),
            ("Docker", "DevOps", "Beginner"),
            ("Git", "Tool", "Advanced"),
            ("REST API", "Framework", "Advanced")
        ]
        for name, cat, prof in skills:
            db.add(Skill(candidate_id=profile.id, name=name, category=cat, proficiency=prof))

        # Projects
        db.add(Project(
            candidate_id=profile.id,
            title="Secure File Sharing & E-Commerce Platform",
            description="Designed and built a modular REST API backend supporting JWT authentication, encrypted file storage, and relational PostgreSQL queries.",
            technologies="Python, FastAPI, PostgreSQL, Cryptography, Docker",
            responsibilities="Developed core backend routes, implemented database schemas, and optimized query latencies.",
            features="Role-based access control, file encryption, automated unit testing harness."
        ))

        db.add(Certification(
            candidate_id=profile.id,
            name="AWS Certified Cloud Practitioner",
            issuer="Amazon Web Services",
            issue_date="2024"
        ))

        db.commit()

        # Resume & Resume Analysis
        resume = Resume(
            candidate_id=profile.id,
            filename="Jane_Candidate_Resume.pdf",
            file_path="./uploads/Jane_Candidate_Resume.pdf",
            raw_text="Jane Candidate - Software Engineer\nSkills: Python, FastAPI, PostgreSQL, REST API, Docker, Git.\nProjects: Secure File Sharing Platform."
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        db.add(ResumeAnalysis(
            resume_id=resume.id,
            overall_score=78.0,
            tech_skills_score=82.0,
            project_score=80.0,
            experience_score=65.0,
            education_score=85.0,
            relevance_score=75.0,
            completeness_score=84.0,
            strengths_json=json.dumps([
                "Strong technical foundation in Python and REST API development.",
                "Demonstrated practical project work with encryption and databases.",
                "Complete education and technical skills section."
            ]),
            weaknesses_json=json.dumps([
                "Could expand on cloud deployment and CI/CD pipelines.",
                "Add performance benchmarks for database queries."
            ]),
            missing_info_json=json.dumps(["Cloud deployment details"])
        ))

        # Job Description & Match
        job = JobDescription(
            candidate_id=profile.id,
            title="Python Backend Developer",
            raw_text="Required Skills: Python, FastAPI, PostgreSQL, REST API, Docker, Git. Preferred Skills: Redis, AWS.",
            domain="Software Engineering",
            experience_required="0-2 Years",
            required_skills_json=json.dumps(["Python", "FastAPI", "PostgreSQL", "REST API", "Docker", "Git"]),
            preferred_skills_json=json.dumps(["Redis", "AWS"]),
            responsibilities_json=json.dumps(["Maintain high-performance REST APIs", "Write clean Python code"]),
            keywords_json=json.dumps(["Python", "FastAPI", "PostgreSQL", "REST API", "Docker"])
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        db.add(JobMatchScore(
            resume_id=resume.id,
            job_description_id=job.id,
            match_percentage=76.0,
            matched_skills_json=json.dumps(["Python", "FastAPI", "PostgreSQL", "REST API", "Git"]),
            missing_skills_json=json.dumps(["AWS"]),
            partial_skills_json=json.dumps(["Docker"]),
            explanation="Candidate matches 5 of 6 core required skills with high technical relevance."
        ))

        db.commit()

        # Audit log entry
        db.add(AuditLog(
            user_id=candidate_user.id,
            action="SYSTEM_INIT_SEED",
            details="Demo dataset automatically initialized.",
            ip_address="127.0.0.1"
        ))
        db.commit()
