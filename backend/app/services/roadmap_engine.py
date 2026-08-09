import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewQuestion
from app.models.evaluation import InterviewScore
from app.models.roadmap import SkillGap, PreparationPlan, PreparationTask
from app.models.candidate import CandidateProfile, Skill

logger = logging.getLogger(__name__)

class RoadmapEngineService:

    @classmethod
    async def generate_gaps_and_roadmap(
        cls, db: Session, interview: Interview, score: InterviewScore
    ) -> PreparationPlan:
        """Analyze interview missing concepts and create SkillGaps and a 4-Week Roadmap."""
        candidate = interview.candidate

        # Extract missing concepts from evaluations
        questions = db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview.id).all()
        missing_concepts = []
        for q in questions:
            if q.answer and q.answer.evaluation:
                missing = json.loads(q.answer.evaluation.missing_concepts_json or "[]")
                missing_concepts.extend(missing)

        if not missing_concepts:
            missing_concepts = ["System Design & Optimization", "SQL Query Tuning", "Docker & Containerization", "REST API Authentication"]

        # Create or update Skill Gap entries
        unique_gaps = list(set(missing_concepts))[:5]
        for gap_name in unique_gaps:
            existing = db.query(SkillGap).filter(
                SkillGap.candidate_id == candidate.id,
                SkillGap.skill_name == gap_name
            ).first()

            if not existing:
                db.add(SkillGap(
                    candidate_id=candidate.id,
                    skill_name=gap_name,
                    required_level=85.0,
                    demonstrated_level=max(30.0, min(75.0, score.overall_score - 10.0)),
                    gap_percentage=max(10.0, 85.0 - score.overall_score),
                    status="IDENTIFIED"
                ))

        # Create Preparation Plan
        plan = PreparationPlan(
            candidate_id=candidate.id,
            interview_id=interview.id,
            title=f"Targeted 4-Week Mastery Plan ({interview.type.title()} Interview)",
            overall_progress=0.0
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        # Generate 4-Week Tasks
        w1_topic = f"Week 1: Core Fundamentals & {unique_gaps[0] if len(unique_gaps) > 0 else 'Database Optimization'}"
        w2_topic = f"Week 2: Advanced Architecture & {unique_gaps[1] if len(unique_gaps) > 1 else 'RESTful Service Security'}"
        w3_topic = f"Week 3: DevOps, Containerization & {unique_gaps[2] if len(unique_gaps) > 2 else 'System Scalability'}"
        w4_topic = "Week 4: Comprehensive Mock Interview Defense & Code Review"

        tasks = [
            PreparationTask(
                plan_id=plan.id,
                week_number=1,
                topic=w1_topic,
                resources_json=json.dumps([
                    f"Review documentation and practice key concepts for {unique_gaps[0] if len(unique_gaps) > 0 else 'Core SQL'}.",
                    "Complete 5 targeted practice exercises on data structures & query execution.",
                    "Review previous interview evaluation feedback notes."
                ])
            ),
            PreparationTask(
                plan_id=plan.id,
                week_number=2,
                topic=w2_topic,
                resources_json=json.dumps([
                    "Implement OAuth2/JWT authentication flow in a sample backend service.",
                    "Study design patterns for microservices and API gateways.",
                    "Practice technical project architecture defense."
                ])
            ),
            PreparationTask(
                plan_id=plan.id,
                week_number=3,
                topic=w3_topic,
                resources_json=json.dumps([
                    "Write a Dockerfile and docker-compose setup for a multi-container application.",
                    "Configure Redis caching to optimize database response latencies.",
                    "Study common concurrency and race-condition edge cases."
                ])
            ),
            PreparationTask(
                plan_id=plan.id,
                week_number=4,
                topic=w4_topic,
                resources_json=json.dumps([
                    "Take a timed 15-question Hard-difficulty mock interview.",
                    "Perform self-code review on all previous coding submissions.",
                    "Refine 2-minute elevator pitch and behavioral STAR answers."
                ])
            )
        ]

        for t in tasks:
            db.add(t)

        db.commit()
        db.refresh(plan)
        return plan

    @classmethod
    def update_task_completion(cls, db: Session, task: PreparationTask, is_completed: bool) -> PreparationPlan:
        """Update completion status of a task and recalculate plan progress."""
        task.is_completed = is_completed
        db.commit()

        plan = db.query(PreparationPlan).filter(PreparationPlan.id == task.plan_id).first()
        if plan:
            all_tasks = db.query(PreparationTask).filter(PreparationTask.plan_id == plan.id).all()
            if all_tasks:
                completed_count = sum(1 for t in all_tasks if t.is_completed)
                plan.overall_progress = round((completed_count / len(all_tasks)) * 100.0, 1)
                db.commit()
                db.refresh(plan)

        return plan
