import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.candidate import CandidateProfile, Skill, Project, Education
from app.models.job import JobDescription
from app.ai.service import get_ai_service

logger = logging.getLogger(__name__)

class InterviewEngineService:

    @classmethod
    async def create_interview(
        cls,
        db: Session,
        candidate: CandidateProfile,
        job_description_id: Optional[int] = None,
        interview_type: str = "TECHNICAL",
        difficulty: str = "MEDIUM",
        total_questions: int = 10,
        instant_feedback_enabled: bool = True
    ) -> Interview:
        """Create a new interview and generate the initial question."""
        interview = Interview(
            candidate_id=candidate.id,
            job_description_id=job_description_id,
            type=interview_type,
            difficulty=difficulty,
            total_questions=total_questions,
            status="IN_PROGRESS",
            instant_feedback_enabled=instant_feedback_enabled,
            started_at=datetime.now(timezone.utc)
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

        # Generate first question
        await cls.generate_next_question(db, interview)
        return interview

    @classmethod
    async def generate_next_question(cls, db: Session, interview: Interview) -> Optional[InterviewQuestion]:
        """Generate the next interview question based on candidate state and previous answers."""
        if interview.status == "COMPLETED":
            return None

        current_questions = db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview.id
        ).order_by(InterviewQuestion.sequence_number.asc()).all()

        if len(current_questions) >= interview.total_questions:
            # Interview questions limit reached
            return None

        candidate = interview.candidate
        
        # Build candidate context
        skills = db.query(Skill).filter(Skill.candidate_id == candidate.id).all()
        projects = db.query(Project).filter(Project.candidate_id == candidate.id).all()
        educations = db.query(Education).filter(Education.candidate_id == candidate.id).all()

        candidate_context = {
            "target_role": candidate.target_role,
            "experience_level": candidate.experience_level,
            "skills": [{"name": s.name, "category": s.category} for s in skills],
            "projects": [{"title": p.title, "description": p.description, "technologies": p.technologies} for p in projects],
            "educations": [{"degree": e.degree, "college": e.college} for e in educations]
        }

        # Job Context
        job_context = None
        if interview.job_description_id:
            job = db.query(JobDescription).filter(JobDescription.id == interview.job_description_id).first()
            if job:
                job_context = {
                    "title": job.title,
                    "domain": job.domain,
                    "required_skills": json.loads(job.required_skills_json or "[]"),
                    "preferred_skills": json.loads(job.preferred_skills_json or "[]")
                }

        # Build QA history
        previous_qa = []
        for q in current_questions:
            if q.answer:
                previous_qa.append({
                    "question": q.question_text,
                    "answer": q.answer.answer_text,
                    "evaluation_score": q.answer.evaluation.overall_score if q.answer.evaluation else 70.0
                })

        # Call AI Service
        ai_service = get_ai_service()
        seq_num = len(current_questions) + 1

        # Check if the previous answer warrants an adaptive follow-up
        last_q = current_questions[-1] if current_questions else None
        if last_q and last_q.answer and last_q.answer.evaluation:
            eval_obj = last_q.answer.evaluation
            eval_dict = {
                "technical_score": eval_obj.technical_score,
                "relevance_score": eval_obj.relevance_score,
                "completeness_score": eval_obj.completeness_score,
                "communication_score": eval_obj.communication_score,
                "overall_score": eval_obj.overall_score,
                "missing_concepts": json.loads(eval_obj.missing_concepts_json or "[]")
            }
            
            # Generate adaptive follow-up if follow_up_depth < 2
            if last_q.follow_up_depth < 2 and eval_dict["overall_score"] < 80:
                q_data = await ai_service.generate_follow_up_question(
                    previous_question=last_q.question_text,
                    candidate_answer=last_q.answer.answer_text,
                    evaluation=eval_dict,
                    difficulty=interview.difficulty,
                    context=candidate_context
                )
                q_data["sequence_number"] = seq_num
            else:
                q_data = await ai_service.generate_interview_question(
                    candidate_context=candidate_context,
                    job_context=job_context,
                    interview_type=interview.type,
                    difficulty=interview.difficulty,
                    sequence_number=seq_num,
                    previous_qa_history=previous_qa
                )
        else:
            q_data = await ai_service.generate_interview_question(
                candidate_context=candidate_context,
                job_context=job_context,
                interview_type=interview.type,
                difficulty=interview.difficulty,
                sequence_number=seq_num,
                previous_qa_history=previous_qa
            )

        # Save generated question
        question = InterviewQuestion(
            interview_id=interview.id,
            sequence_number=seq_num,
            question_text=q_data["question"],
            question_type=q_data.get("question_type", "technical"),
            difficulty=q_data.get("difficulty", interview.difficulty),
            context_reason=q_data.get("reason"),
            expected_topics_json=json.dumps(q_data.get("expected_topics", [])),
            follow_up_depth=q_data.get("follow_up_depth", 0),
            code_starter=q_data.get("code_starter"),
            code_language=q_data.get("code_language", "python"),
            resume_source=q_data.get("resume_source", "RESUME"),
            skill_name=q_data.get("skill"),
            project_title=q_data.get("project"),
            reasons_json=json.dumps(q_data.get("reasons", [q_data.get("reason")] if q_data.get("reason") else []))
        )

        db.add(question)
        db.commit()
        db.refresh(question)

        return question
