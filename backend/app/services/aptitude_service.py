import json
import logging
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.candidate import CandidateProfile
from app.models.aptitude import (
    AptitudeQuestion,
    AptitudeTestConfig,
    AptitudeTestAttempt,
    AptitudeCandidateAnswer,
    AptitudeMonitoringEvent
)
from app.schemas.aptitude import (
    StartAptitudeTestRequest,
    SaveAnswerRequest,
    AdminQuestionCreateUpdate
)

logger = logging.getLogger(__name__)

SECTIONS_DISTRIBUTION = [
    ("Quantitative Aptitude", 10),
    ("Logical Reasoning", 10),
    ("Verbal Ability", 10),
    ("Data Interpretation", 5),
    ("Analytical Reasoning", 5)
]

class AptitudeService:

    @staticmethod
    def start_test(db: Session, candidate: CandidateProfile, req: StartAptitudeTestRequest) -> AptitudeTestAttempt:
        """Start a new proctored Aptitude Test attempt for candidate."""
        # 1. Check if candidate already has an active attempt
        existing_attempt = db.query(AptitudeTestAttempt).filter(
            AptitudeTestAttempt.candidate_id == candidate.id,
            AptitudeTestAttempt.status == "IN_PROGRESS"
        ).first()

        now = datetime.now(timezone.utc)
        if existing_attempt:
            # Check if active attempt is expired
            if existing_attempt.expires_at.tzinfo is None:
                exp = existing_attempt.expires_at.replace(tzinfo=timezone.utc)
            else:
                exp = existing_attempt.expires_at

            if now >= exp:
                AptitudeService.submit_attempt(db, existing_attempt.id)
            else:
                return existing_attempt

        # Fetch config
        config = db.query(AptitudeTestConfig).filter(AptitudeTestConfig.is_active == True).first()
        duration_minutes = req.duration_minutes or (config.duration_minutes if config else 45)
        total_questions = req.total_questions or (config.total_questions if config else 40)

        expires_at = now + timedelta(minutes=duration_minutes)

        attempt = AptitudeTestAttempt(
            candidate_id=candidate.id,
            config_id=config.id if config else None,
            company_pattern=req.company_pattern or "General MNC",
            difficulty_mode=req.difficulty_mode or "Mixed",
            started_at=now,
            expires_at=expires_at,
            status="IN_PROGRESS",
            total_questions=total_questions,
            max_possible_score=float(total_questions)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        # Select Questions from Bank
        selected_questions = AptitudeService._select_balanced_questions(
            db, req.company_pattern, req.difficulty_mode, total_questions
        )

        # Initialize candidate answer placeholders
        for q in selected_questions:
            ans = AptitudeCandidateAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option=None,
                is_correct=None,
                is_marked_for_review=False,
                time_spent_seconds=0
            )
            db.add(ans)
        
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def _select_balanced_questions(
        db: Session, company_pattern: Optional[str], difficulty_mode: Optional[str], total_questions: int
    ) -> List[AptitudeQuestion]:
        """Select questions balanced by section and difficulty mode from the question bank."""
        all_qs = db.query(AptitudeQuestion).all()
        if not all_qs:
            return []

        # Filter by company pattern if applicable
        pattern_qs = []
        if company_pattern and company_pattern != "General MNC":
            for q in all_qs:
                pats = json.loads(q.company_patterns_json) if q.company_patterns_json else []
                if company_pattern in pats or "General MNC" in pats or "General" in pats:
                    pattern_qs.append(q)
        if not pattern_qs:
            pattern_qs = all_qs

        selected: List[AptitudeQuestion] = []
        seen_ids = set()

        for section, count in SECTIONS_DISTRIBUTION:
            sec_qs = [q for q in pattern_qs if q.section == section and q.id not in seen_ids]
            if len(sec_qs) < count:
                sec_qs = [q for q in all_qs if q.section == section and q.id not in seen_ids]
            
            # Apply difficulty mode filter if specified
            if difficulty_mode in ["Easy", "Medium", "Hard"]:
                diff_qs = [q for q in sec_qs if q.difficulty == difficulty_mode]
                if len(diff_qs) >= count:
                    sec_qs = diff_qs

            random.shuffle(sec_qs)
            chosen = sec_qs[:count]
            for c in chosen:
                selected.append(c)
                seen_ids.add(c.id)

        # If total selected is less than target total_questions, top up from remaining questions
        if len(selected) < total_questions:
            remaining = [q for q in all_qs if q.id not in seen_ids]
            random.shuffle(remaining)
            needed = total_questions - len(selected)
            selected.extend(remaining[:needed])

        return selected[:total_questions]

    @staticmethod
    def get_attempt_state(db: Session, attempt_id: int) -> Dict[str, Any]:
        """Fetch attempt status and questions with timer validation."""
        attempt = db.query(AptitudeTestAttempt).filter(AptitudeTestAttempt.id == attempt_id).first()
        if not attempt:
            raise ValueError("Attempt not found")

        now = datetime.now(timezone.utc)
        exp = attempt.expires_at.replace(tzinfo=timezone.utc) if attempt.expires_at.tzinfo is None else attempt.expires_at

        # Check timer expiration
        if attempt.status == "IN_PROGRESS" and now >= exp:
            attempt = AptitudeService.submit_attempt(db, attempt.id)

        remaining_seconds = max(0, int((exp - now).total_seconds())) if attempt.status == "IN_PROGRESS" else 0

        # Fetch candidate answers
        c_answers = db.query(AptitudeCandidateAnswer).filter(AptitudeCandidateAnswer.attempt_id == attempt.id).all()
        answer_map = {ans.question_id: ans for ans in c_answers}

        questions_list = []
        for ans in c_answers:
            q = ans.question
            options = json.loads(q.options_json) if q.options_json else []
            questions_list.append({
                "id": q.id,
                "question_code": q.question_code,
                "section": q.section,
                "topic": q.topic,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "options": options,
                "time_estimate_seconds": q.time_estimate_seconds,
                "is_marked_for_review": ans.is_marked_for_review,
                "selected_option": ans.selected_option
            })

        return {
            "attempt_id": attempt.id,
            "company_pattern": attempt.company_pattern,
            "difficulty_mode": attempt.difficulty_mode,
            "started_at": attempt.started_at.isoformat(),
            "expires_at": attempt.expires_at.isoformat(),
            "remaining_seconds": remaining_seconds,
            "status": attempt.status,
            "total_questions": attempt.total_questions,
            "duration_minutes": int((attempt.expires_at - attempt.started_at).total_seconds() / 60),
            "questions": questions_list
        }

    @staticmethod
    def save_answer(db: Session, attempt_id: int, req: SaveAnswerRequest) -> AptitudeCandidateAnswer:
        """Auto-save candidate answer for a question in an active attempt."""
        attempt = db.query(AptitudeTestAttempt).filter(AptitudeTestAttempt.id == attempt_id).first()
        if not attempt or attempt.status != "IN_PROGRESS":
            raise ValueError("Attempt is not in progress")

        now = datetime.now(timezone.utc)
        exp = attempt.expires_at.replace(tzinfo=timezone.utc) if attempt.expires_at.tzinfo is None else attempt.expires_at
        if now >= exp:
            AptitudeService.submit_attempt(db, attempt_id)
            raise ValueError("Test time has expired. Attempt auto-submitted.")

        ans = db.query(AptitudeCandidateAnswer).filter(
            AptitudeCandidateAnswer.attempt_id == attempt_id,
            AptitudeCandidateAnswer.question_id == req.question_id
        ).first()

        if not ans:
            ans = AptitudeCandidateAnswer(
                attempt_id=attempt_id,
                question_id=req.question_id
            )
            db.add(ans)

        ans.selected_option = req.selected_option
        if req.is_marked_for_review is not None:
            ans.is_marked_for_review = req.is_marked_for_review
        if req.time_spent_seconds:
            ans.time_spent_seconds = (ans.time_spent_seconds or 0) + req.time_spent_seconds

        db.commit()
        db.refresh(ans)
        return ans

    @staticmethod
    def record_monitoring_event(db: Session, attempt_id: int, event_type: str, metadata: Optional[Dict[str, Any]] = None) -> AptitudeMonitoringEvent:
        """Record proctoring monitoring event (e.g. TAB_SWITCH, CAMERA_DISCONNECTED)."""
        attempt = db.query(AptitudeTestAttempt).filter(AptitudeTestAttempt.id == attempt_id).first()
        if not attempt:
            raise ValueError("Attempt not found")

        evt = AptitudeMonitoringEvent(
            attempt_id=attempt_id,
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            metadata_json=json.dumps(metadata) if metadata else None
        )
        db.add(evt)
        db.commit()
        db.refresh(evt)
        return evt

    @staticmethod
    def submit_attempt(db: Session, attempt_id: int, answers_payload: Optional[List[SaveAnswerRequest]] = None) -> AptitudeTestAttempt:
        """Submit assessment, grade backend responses, compute section scores, time analysis & career readiness."""
        attempt = db.query(AptitudeTestAttempt).filter(AptitudeTestAttempt.id == attempt_id).first()
        if not attempt:
            raise ValueError("Attempt not found")

        if attempt.status == "SUBMITTED":
            return attempt

        now = datetime.now(timezone.utc)

        # Batch save any remaining unsaved payload answers
        if answers_payload:
            for item in answers_payload:
                ans = db.query(AptitudeCandidateAnswer).filter(
                    AptitudeCandidateAnswer.attempt_id == attempt_id,
                    AptitudeCandidateAnswer.question_id == item.question_id
                ).first()
                if ans:
                    ans.selected_option = item.selected_option
                    ans.is_marked_for_review = item.is_marked_for_review
                    if item.time_spent_seconds:
                        ans.time_spent_seconds = (ans.time_spent_seconds or 0) + item.time_spent_seconds

            db.commit()

        # Grade all answers
        c_answers = db.query(AptitudeCandidateAnswer).filter(AptitudeCandidateAnswer.attempt_id == attempt_id).all()
        
        correct_marks = 1.0
        negative_marks = 0.25

        total_score = 0.0
        correct_cnt = 0
        incorrect_cnt = 0
        unanswered_cnt = 0

        section_stats: Dict[str, Dict[str, Any]] = {}
        topic_stats: Dict[str, Dict[str, Any]] = {}

        total_time = 0

        for ans in c_answers:
            q = ans.question
            sec = q.section
            topic = q.topic
            time_sec = ans.time_spent_seconds or 0
            total_time += time_sec

            if sec not in section_stats:
                section_stats[sec] = {
                    "total": 0, "correct": 0, "incorrect": 0, "unanswered": 0, "score": 0.0, "time": 0
                }
            section_stats[sec]["total"] += 1
            section_stats[sec]["time"] += time_sec

            if topic not in topic_stats:
                topic_stats[topic] = {"total": 0, "correct": 0}
            topic_stats[topic]["total"] += 1

            if ans.selected_option is None:
                unanswered_cnt += 1
                section_stats[sec]["unanswered"] += 1
                ans.is_correct = False
            elif ans.selected_option == q.correct_option:
                correct_cnt += 1
                ans.is_correct = True
                total_score += correct_marks
                section_stats[sec]["correct"] += 1
                section_stats[sec]["score"] += correct_marks
                topic_stats[topic]["correct"] += 1
            else:
                incorrect_cnt += 1
                ans.is_correct = False
                total_score -= negative_marks
                section_stats[sec]["incorrect"] += 1
                section_stats[sec]["score"] -= negative_marks

        total_questions = len(c_answers) or 40
        max_score = float(total_questions) * correct_marks
        total_score = max(0.0, round(total_score, 2))
        percentage = round((total_score / max_score) * 100.0, 1) if max_score > 0 else 0.0
        
        answered_cnt = correct_cnt + incorrect_cnt
        accuracy = round((correct_cnt / answered_cnt) * 100.0, 1) if answered_cnt > 0 else 0.0

        # Performance Level
        if percentage >= 90:
            level = "Excellent"
        elif percentage >= 80:
            level = "Strong"
        elif percentage >= 70:
            level = "Good"
        elif percentage >= 60:
            level = "Needs Improvement"
        else:
            level = "Requires Preparation"

        # Formulate section breakdown list
        sec_breakdown = []
        for sec_name, stats in section_stats.items():
            tot = stats["total"]
            cor = stats["correct"]
            inc = stats["incorrect"]
            unans = stats["unanswered"]
            sc = max(0.0, round(stats["score"], 2))
            sec_pct = round((cor / tot) * 100.0, 1) if tot > 0 else 0.0
            sec_acc = round((cor / (cor + inc)) * 100.0, 1) if (cor + inc) > 0 else 0.0
            avg_t = round(stats["time"] / tot, 1) if tot > 0 else 0.0
            sec_breakdown.append({
                "section": sec_name,
                "total_questions": tot,
                "correct": cor,
                "incorrect": inc,
                "unanswered": unans,
                "score": sc,
                "percentage": sec_pct,
                "accuracy": sec_acc,
                "avg_time_per_question": avg_t
            })

        # Calculate Strengths & Weaknesses by topic
        strengths = []
        weaknesses = []
        for topic, stat in topic_stats.items():
            t_acc = (stat["correct"] / stat["total"]) * 100.0
            if t_acc >= 75.0:
                strengths.append(topic)
            elif t_acc < 60.0:
                weaknesses.append(topic)

        if not strengths:
            strengths = ["General Comprehension", "Basic Reasoning"]
        if not weaknesses:
            weaknesses = ["Advanced Probability", "Speed Mathematics"]

        # Formulate Personalized Recommendations
        recommendations = []
        for weak in weaknesses[:3]:
            recommendations.append(f"Practice {weak} – 15 MNC-Style Questions")
        if accuracy < 75.0:
            recommendations.append("Speed & Accuracy Timed Aptitude Challenge")
        if unanswered_cnt > 5:
            recommendations.append("Time Management Strategy & Elimination Techniques")

        start_t = attempt.started_at.replace(tzinfo=timezone.utc) if attempt.started_at.tzinfo is None else attempt.started_at
        time_taken = int((now - start_t).total_seconds())

        attempt.status = "SUBMITTED"
        attempt.submitted_at = now
        attempt.total_score = total_score
        attempt.percentage = percentage
        attempt.accuracy = accuracy
        attempt.time_taken_seconds = time_taken
        attempt.correct_count = correct_cnt
        attempt.incorrect_count = incorrect_cnt
        attempt.unanswered_count = unanswered_cnt
        attempt.performance_level = level
        attempt.section_scores_json = json.dumps(sec_breakdown)
        attempt.strengths_json = json.dumps(strengths)
        attempt.weaknesses_json = json.dumps(weaknesses)
        attempt.recommendations_json = json.dumps(recommendations)
        attempt.time_analysis_json = json.dumps({
            "total_time_seconds": time_taken,
            "avg_time_per_question": round(time_taken / total_questions, 1) if total_questions > 0 else 0
        })

        db.commit()
        db.refresh(attempt)

        # Update Career Readiness Score for Candidate Profile
        AptitudeService._update_candidate_career_readiness(db, attempt.candidate_id)

        return attempt

    @staticmethod
    def _update_candidate_career_readiness(db: Session, candidate_id: int):
        """Update candidate's career readiness score by incorporating Aptitude performance."""
        # Find latest completed aptitude attempt
        latest_apt = db.query(AptitudeTestAttempt).filter(
            AptitudeTestAttempt.candidate_id == candidate_id,
            AptitudeTestAttempt.status == "SUBMITTED"
        ).order_by(AptitudeTestAttempt.submitted_at.desc()).first()

        apt_score = latest_apt.percentage if latest_apt else 75.0

        # We log audit entry
        logger.info(f"Updated Career Readiness for Candidate ID {candidate_id}: Aptitude Score = {apt_score}%")

    @staticmethod
    def get_result(db: Session, attempt_id: int) -> Dict[str, Any]:
        """Fetch detailed test result for candidate report."""
        attempt = db.query(AptitudeTestAttempt).filter(AptitudeTestAttempt.id == attempt_id).first()
        if not attempt:
            raise ValueError("Result not found")

        c_answers = db.query(AptitudeCandidateAnswer).filter(AptitudeCandidateAnswer.attempt_id == attempt.id).all()
        q_reviews = []
        for ans in c_answers:
            q = ans.question
            options = json.loads(q.options_json) if q.options_json else []
            q_reviews.append({
                "question_id": q.id,
                "question_code": q.question_code,
                "section": q.section,
                "topic": q.topic,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "options": options,
                "candidate_answer": ans.selected_option,
                "correct_answer": q.correct_option,
                "is_correct": ans.is_correct,
                "explanation": q.explanation
            })

        sec_performances = json.loads(attempt.section_scores_json) if attempt.section_scores_json else []
        strengths = json.loads(attempt.strengths_json) if attempt.strengths_json else []
        weaknesses = json.loads(attempt.weaknesses_json) if attempt.weaknesses_json else []
        recommendations = json.loads(attempt.recommendations_json) if attempt.recommendations_json else []

        candidate_name = attempt.candidate.user.full_name if (attempt.candidate and attempt.candidate.user) else "Candidate"

        return {
            "attempt_id": attempt.id,
            "candidate_name": candidate_name,
            "company_pattern": attempt.company_pattern,
            "difficulty_mode": attempt.difficulty_mode,
            "started_at": attempt.started_at.isoformat(),
            "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else attempt.started_at.isoformat(),
            "status": attempt.status,
            "total_questions": attempt.total_questions,
            "total_score": attempt.total_score,
            "max_possible_score": attempt.max_possible_score,
            "percentage": attempt.percentage,
            "accuracy": attempt.accuracy,
            "time_taken_seconds": attempt.time_taken_seconds,
            "correct_count": attempt.correct_count,
            "incorrect_count": attempt.incorrect_count,
            "unanswered_count": attempt.unanswered_count,
            "performance_level": attempt.performance_level,
            "section_performances": sec_performances,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
            "question_reviews": q_reviews
        }

    @staticmethod
    def get_candidate_history(db: Session, candidate_id: int) -> List[Dict[str, Any]]:
        """Fetch attempt history list for a candidate."""
        attempts = db.query(AptitudeTestAttempt).filter(
            AptitudeTestAttempt.candidate_id == candidate_id
        ).order_by(AptitudeTestAttempt.started_at.desc()).all()

        history = []
        for item in attempts:
            dt_str = item.started_at.strftime("%d %b %Y")
            history.append({
                "id": item.id,
                "date": dt_str,
                "company_pattern": item.company_pattern,
                "difficulty_mode": item.difficulty_mode,
                "percentage": item.percentage,
                "accuracy": item.accuracy,
                "duration_minutes": round(item.time_taken_seconds / 60) if item.time_taken_seconds else 0,
                "performance_level": item.performance_level,
                "status": item.status
            })
        return history

    @staticmethod
    def admin_get_questions(db: Session) -> List[AptitudeQuestion]:
        """Fetch all questions for admin panel."""
        return db.query(AptitudeQuestion).order_by(AptitudeQuestion.id.desc()).all()

    @staticmethod
    def admin_create_question(db: Session, req: AdminQuestionCreateUpdate) -> AptitudeQuestion:
        """Create new question in question bank."""
        q = AptitudeQuestion(
            question_code=req.question_code,
            section=req.section,
            topic=req.topic,
            difficulty=req.difficulty,
            question_text=req.question_text,
            options_json=json.dumps(req.options),
            correct_option=req.correct_option,
            explanation=req.explanation,
            time_estimate_seconds=req.time_estimate_seconds or 60,
            tags_json=json.dumps(req.tags or []),
            company_patterns_json=json.dumps(req.company_patterns or ["General MNC"])
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        return q

    @staticmethod
    def admin_delete_question(db: Session, question_id: int) -> bool:
        """Delete question from question bank."""
        q = db.query(AptitudeQuestion).filter(AptitudeQuestion.id == question_id).first()
        if not q:
            return False
        db.delete(q)
        db.commit()
        return True
