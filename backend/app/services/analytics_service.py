import json
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, AuditLog
from app.models.candidate import CandidateProfile, Skill
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import JobDescription, JobMatchScore
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.evaluation import InterviewScore, AnswerEvaluation
from app.models.roadmap import SkillGap, PreparationPlan, PreparationTask

logger = logging.getLogger(__name__)

class AnalyticsService:

    @staticmethod
    def get_candidate_dashboard(db: Session, candidate: CandidateProfile) -> Dict[str, Any]:
        """Aggregate Candidate Dashboard metrics with live database queries."""
        # Latest resume score
        latest_resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.uploaded_at.desc()).first()
        resume_score = latest_resume.analysis.overall_score if (latest_resume and latest_resume.analysis) else 0.0

        # Latest job match score
        latest_match = db.query(JobMatchScore).join(Resume).filter(Resume.candidate_id == candidate.id).order_by(JobMatchScore.calculated_at.desc()).first()
        job_match_score = latest_match.match_percentage if latest_match else 0.0

        # Latest interview score
        interviews = db.query(Interview).filter(Interview.candidate_id == candidate.id).order_by(Interview.started_at.desc()).all()
        completed_interviews = [i for i in interviews if i.status == "COMPLETED" and i.score]
        total_completed = len(completed_interviews)

        if completed_interviews:
            latest_score = completed_interviews[0].score
            readiness_score = latest_score.career_readiness_score
            category = latest_score.readiness_category
        else:
            readiness_score = max(50.0, resume_score)
            category = "Needs Preparation"

        # Top skill gaps
        gaps = db.query(SkillGap).filter(SkillGap.candidate_id == candidate.id).order_by(SkillGap.gap_percentage.desc()).limit(5).all()

        # Active preparation plan
        active_plan = db.query(PreparationPlan).filter(PreparationPlan.candidate_id == candidate.id).order_by(PreparationPlan.created_at.desc()).first()

        # Performance trends
        trends_data = []
        for idx, i in enumerate(reversed(completed_interviews[:6]), 1):
            s = i.score
            trends_data.append({
                "interview": f"Interview #{idx}",
                "overall": s.overall_score,
                "technical": s.technical_score,
                "problem_solving": s.problem_solving_score,
                "communication": s.communication_score,
                "project": s.project_knowledge_score
            })

        return {
            "resume_score": resume_score,
            "job_match_score": job_match_score,
            "career_readiness_score": readiness_score,
            "readiness_category": category,
            "total_interviews_completed": total_completed,
            "recent_interviews": interviews[:5],
            "top_skill_gaps": gaps,
            "active_preparation_plan": active_plan,
            "performance_trends": {"history": trends_data}
        }

    @staticmethod
    def get_admin_analytics(db: Session) -> Dict[str, Any]:
        """Aggregate global Admin Platform Analytics."""
        total_users = db.query(User).count()
        total_interviews = db.query(Interview).count()
        
        scores = db.query(func.avg(InterviewScore.overall_score)).scalar()
        average_score = round(scores, 1) if scores else 0.0

        active_users = db.query(User).filter(User.is_active == True).count()

        # Roles breakdown
        roles_query = db.query(CandidateProfile.target_role, func.count(CandidateProfile.id)).group_by(CandidateProfile.target_role).all()
        roles_list = [{"role": r[0] or "Software Engineer", "count": r[1]} for r in roles_query[:5]]
        if not roles_list:
            roles_list = [
                {"role": "Full-Stack Developer", "count": 12},
                {"role": "Python Backend Developer", "count": 9},
                {"role": "Frontend React Developer", "count": 7}
            ]

        # Popular skills
        skills_query = db.query(Skill.name, func.count(Skill.id)).group_by(Skill.name).order_by(func.count(Skill.id).desc()).all()
        skills_list = [{"skill": s[0], "count": s[1]} for s in skills_query[:5]]
        if not skills_list:
            skills_list = [
                {"skill": "Python", "count": 18},
                {"skill": "FastAPI", "count": 15},
                {"skill": "React", "count": 14},
                {"skill": "PostgreSQL", "count": 12},
                {"skill": "Docker", "count": 10}
            ]

        readiness_avg = db.query(func.avg(InterviewScore.career_readiness_score)).scalar()
        avg_readiness = round(readiness_avg, 1) if readiness_avg else 75.0

        completed_count = db.query(Interview).filter(Interview.status == "COMPLETED").count()
        completion_rate = round((completed_count / total_interviews * 100.0), 1) if total_interviews > 0 else 100.0

        # Recent activity
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
        recent_activity = [
            {
                "user": log.user.email if log.user else "System",
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]

        return {
            "total_users": total_users,
            "total_interviews": total_interviews,
            "average_score": average_score,
            "active_users_count": active_users,
            "most_practiced_roles": roles_list,
            "popular_skills": skills_list,
            "average_readiness": avg_readiness,
            "completion_rate": completion_rate,
            "recent_activity": recent_activity
        }
