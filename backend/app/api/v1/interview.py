import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.evaluation import AnswerEvaluation, InterviewScore
from app.models.roadmap import SkillGap, PreparationPlan
from app.services.interview_engine import InterviewEngineService
from app.services.evaluation_engine import EvaluationEngineService
from app.schemas.interview import (
    InterviewCreate, InterviewResponse, InterviewQuestionResponse,
    AnswerSubmit, AnswerEvaluationResponse, InterviewScoreResponse
)
from app.schemas.roadmap import SkillGapResponse, PreparationPlanResponse

router = APIRouter(prefix="/interview", tags=["Adaptive AI Interview"])

def _format_question_response(q: InterviewQuestion) -> InterviewQuestionResponse:
    eval_res = None
    ans_res = None

    if q.answer:
        ans_res = AnswerSubmit(
            question_id=q.id,
            answer_text=q.answer.answer_text,
            audio_url=q.answer.audio_url,
            time_taken_seconds=q.answer.time_taken_seconds
        )
        if q.answer.evaluation:
            ev = q.answer.evaluation
            eval_res = AnswerEvaluationResponse(
                id=ev.id,
                answer_id=ev.answer_id,
                technical_score=ev.technical_score,
                relevance_score=ev.relevance_score,
                completeness_score=ev.completeness_score,
                communication_score=ev.communication_score,
                overall_score=ev.overall_score,
                strengths=json.loads(ev.strengths_json or "[]"),
                weaknesses=json.loads(ev.weaknesses_json or "[]"),
                missing_concepts=json.loads(ev.missing_concepts_json or "[]"),
                recommended_follow_up=ev.recommended_follow_up,
                evaluated_at=ev.evaluated_at
            )

    return InterviewQuestionResponse(
        id=q.id,
        interview_id=q.interview_id,
        sequence_number=q.sequence_number,
        question_text=q.question_text,
        question_type=q.question_type,
        difficulty=q.difficulty,
        context_reason=q.context_reason,
        expected_topics=json.loads(q.expected_topics_json or "[]"),
        follow_up_depth=q.follow_up_depth,
        code_starter=q.code_starter,
        code_language=q.code_language,
        answer=ans_res,
        evaluation=eval_res
    )

def _format_interview_response(interview: Interview) -> InterviewResponse:
    q_list = [_format_question_response(q) for q in interview.questions]
    score_res = None
    if interview.score:
        s = interview.score
        score_res = InterviewScoreResponse(
            id=s.id,
            interview_id=s.interview_id,
            overall_score=s.overall_score,
            technical_score=s.technical_score,
            problem_solving_score=s.problem_solving_score,
            communication_score=s.communication_score,
            project_knowledge_score=s.project_knowledge_score,
            job_relevance_score=s.job_relevance_score,
            career_readiness_score=s.career_readiness_score,
            readiness_category=s.readiness_category,
            calculated_at=s.calculated_at
        )

    return InterviewResponse(
        id=interview.id,
        candidate_id=interview.candidate_id,
        job_description_id=interview.job_description_id,
        type=interview.type,
        difficulty=interview.difficulty,
        total_questions=interview.total_questions,
        status=interview.status,
        instant_feedback_enabled=interview.instant_feedback_enabled,
        started_at=interview.started_at,
        completed_at=interview.completed_at,
        questions=q_list,
        score=score_res
    )

@router.post("/create", response_model=InterviewResponse)
async def create_interview(
    interview_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()

    interview = await InterviewEngineService.create_interview(
        db=db,
        candidate=profile,
        job_description_id=interview_in.job_description_id,
        interview_type=interview_in.type,
        difficulty=interview_in.difficulty,
        total_questions=interview_in.total_questions,
        instant_feedback_enabled=interview_in.instant_feedback_enabled
    )

    return _format_interview_response(interview)

@router.get("/list", response_model=List[InterviewResponse])
def get_candidate_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        return []
    interviews = db.query(Interview).filter(Interview.candidate_id == profile.id).order_by(Interview.started_at.desc()).all()
    return [_format_interview_response(i) for i in interviews]

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview_detail(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return _format_interview_response(interview)

@router.post("/{interview_id}/answer", response_model=AnswerEvaluationResponse)
async def submit_answer(
    interview_id: int,
    answer_in: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if interview.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Interview is already completed. Cannot submit new answers.")

    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == answer_in.question_id).first()
    if not question or question.interview_id != interview_id:
        raise HTTPException(status_code=404, detail="Question not found in this interview session")

    answer, evaluation = await EvaluationEngineService.submit_and_evaluate_answer(
        db, question, answer_in.answer_text, answer_in.audio_url, answer_in.time_taken_seconds
    )

    # Check if more questions are needed and not completed
    if interview.status != "COMPLETED":
        await InterviewEngineService.generate_next_question(db, interview)

    return AnswerEvaluationResponse(
        id=evaluation.id,
        answer_id=evaluation.answer_id,
        technical_score=evaluation.technical_score,
        relevance_score=evaluation.relevance_score,
        completeness_score=evaluation.completeness_score,
        communication_score=evaluation.communication_score,
        overall_score=evaluation.overall_score,
        strengths=json.loads(evaluation.strengths_json or "[]"),
        weaknesses=json.loads(evaluation.weaknesses_json or "[]"),
        missing_concepts=json.loads(evaluation.missing_concepts_json or "[]"),
        recommended_follow_up=evaluation.recommended_follow_up,
        evaluated_at=evaluation.evaluated_at
    )
