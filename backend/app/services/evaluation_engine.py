import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.evaluation import AnswerEvaluation, InterviewScore
from app.ai.service import get_ai_service
from app.services.roadmap_engine import RoadmapEngineService

logger = logging.getLogger(__name__)

class EvaluationEngineService:

    @classmethod
    async def submit_and_evaluate_answer(
        cls,
        db: Session,
        question: InterviewQuestion,
        answer_text: str,
        audio_url: Optional[str] = None,
        time_taken_seconds: int = 0
    ) -> Tuple[InterviewAnswer, AnswerEvaluation]:
        """Submit candidate answer and evaluate immediately."""
        # Check if already answered
        existing_answer = db.query(InterviewAnswer).filter(
            InterviewAnswer.question_id == question.id
        ).first()

        if existing_answer:
            answer = existing_answer
            answer.answer_text = answer_text
            answer.audio_url = audio_url
            answer.time_taken_seconds = time_taken_seconds
            answer.submitted_at = datetime.now(timezone.utc)
        else:
            answer = InterviewAnswer(
                question_id=question.id,
                answer_text=answer_text,
                audio_url=audio_url,
                time_taken_seconds=time_taken_seconds
            )
            db.add(answer)
            db.commit()
            db.refresh(answer)

        # Call AI Service to evaluate
        expected_topics = json.loads(question.expected_topics_json or "[]")
        ai_service = get_ai_service()
        eval_data = await ai_service.evaluate_answer(
            question_text=question.question_text,
            expected_topics=expected_topics,
            candidate_answer=answer_text
        )

        existing_eval = db.query(AnswerEvaluation).filter(
            AnswerEvaluation.answer_id == answer.id
        ).first()

        if existing_eval:
            evaluation = existing_eval
            evaluation.technical_score = eval_data["technical_score"]
            evaluation.relevance_score = eval_data["relevance_score"]
            evaluation.completeness_score = eval_data["completeness_score"]
            evaluation.communication_score = eval_data["communication_score"]
            evaluation.overall_score = eval_data["overall_score"]
            evaluation.strengths_json = json.dumps(eval_data.get("strengths", []))
            evaluation.weaknesses_json = json.dumps(eval_data.get("weaknesses", []))
            evaluation.missing_concepts_json = json.dumps(eval_data.get("missing_concepts", []))
            evaluation.recommended_follow_up = eval_data.get("recommended_follow_up")
        else:
            evaluation = AnswerEvaluation(
                answer_id=answer.id,
                technical_score=eval_data["technical_score"],
                relevance_score=eval_data["relevance_score"],
                completeness_score=eval_data["completeness_score"],
                communication_score=eval_data["communication_score"],
                overall_score=eval_data["overall_score"],
                strengths_json=json.dumps(eval_data.get("strengths", [])),
                weaknesses_json=json.dumps(eval_data.get("weaknesses", [])),
                missing_concepts_json=json.dumps(eval_data.get("missing_concepts", [])),
                recommended_follow_up=eval_data.get("recommended_follow_up")
            )
            db.add(evaluation)

        db.commit()
        db.refresh(evaluation)

        # Check if interview is completed or generate next question
        interview = db.query(Interview).filter(Interview.id == question.interview_id).first()
        answered_count = db.query(InterviewAnswer).join(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview.id
        ).count()

        if answered_count >= interview.total_questions:
            await cls.complete_interview(db, interview)

        return answer, evaluation

    @classmethod
    async def complete_interview(cls, db: Session, interview: Interview) -> InterviewScore:
        """Calculate final interview scores, readiness score, skill gaps, and roadmap."""
        questions = db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview.id
        ).all()

        evaluations = []
        for q in questions:
            if q.answer and q.answer.evaluation:
                evaluations.append(q.answer.evaluation)

        if not evaluations:
            # Fallback zero scores if empty
            tech_avg = rel_avg = comp_avg = comm_avg = overall_avg = 50.0
        else:
            tech_avg = sum(e.technical_score for e in evaluations) / len(evaluations)
            rel_avg = sum(e.relevance_score for e in evaluations) / len(evaluations)
            comp_avg = sum(e.completeness_score for e in evaluations) / len(evaluations)
            comm_avg = sum(e.communication_score for e in evaluations) / len(evaluations)
            overall_avg = sum(e.overall_score for e in evaluations) / len(evaluations)

        # Category scores
        problem_solving_score = round((tech_avg * 0.5 + comp_avg * 0.5), 1)
        project_knowledge_score = round((rel_avg * 0.6 + tech_avg * 0.4), 1)
        job_relevance_score = round((rel_avg * 0.7 + comp_avg * 0.3), 1)

        # Career Readiness Score
        career_readiness = round(overall_avg, 1)

        if career_readiness >= 90:
            category = "Excellent"
        elif career_readiness >= 80:
            category = "Interview Ready"
        elif career_readiness >= 70:
            category = "Needs Minor Improvement"
        elif career_readiness >= 60:
            category = "Needs Improvement"
        else:
            category = "Needs Significant Preparation"

        score = InterviewScore(
            interview_id=interview.id,
            overall_score=round(overall_avg, 1),
            technical_score=round(tech_avg, 1),
            problem_solving_score=problem_solving_score,
            communication_score=round(comm_avg, 1),
            project_knowledge_score=project_knowledge_score,
            job_relevance_score=job_relevance_score,
            career_readiness_score=career_readiness,
            readiness_category=category
        )

        db.add(score)
        interview.status = "COMPLETED"
        interview.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(score)

        # Generate skill gaps and preparation plan automatically
        await RoadmapEngineService.generate_gaps_and_roadmap(db, interview, score)

        return score
