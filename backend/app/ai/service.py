import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

class AIServiceInterface(ABC):
    """Abstract Base Class for AI Providers (Gemini, OpenAI, Mock)."""

    @abstractmethod
    async def extract_resume_info(self, raw_text: str) -> Dict[str, Any]:
        """Extract structured profile, skills, projects, and education from resume text."""
        pass

    @abstractmethod
    async def analyze_job_description(self, raw_text: str) -> Dict[str, Any]:
        """Extract job title, required skills, preferred skills, responsibilities, and domain."""
        pass

    @abstractmethod
    async def generate_interview_question(
        self,
        candidate_context: Dict[str, Any],
        job_context: Optional[Dict[str, Any]],
        interview_type: str,
        difficulty: str,
        sequence_number: int,
        previous_qa_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a dynamic, anti-hallucination interview question based on context."""
        pass

    @abstractmethod
    async def evaluate_answer(
        self,
        question_text: str,
        expected_topics: List[str],
        candidate_answer: str,
        previous_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Evaluate candidate answer across technical accuracy, relevance, completeness, communication."""
        pass

    @abstractmethod
    async def generate_follow_up_question(
        self,
        previous_question: str,
        candidate_answer: str,
        evaluation: Dict[str, Any],
        difficulty: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate an adaptive follow-up question based on candidate's answer strength."""
        pass


class MockAIService(AIServiceInterface):
    """
    High-fidelity deterministic fallback AI engine.
    Ensures 100% functional system execution even offline or without AI provider API keys.
    """

    async def extract_resume_info(self, raw_text: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        
        # Skill extraction heuristic dictionary
        known_techs = [
            "python", "django", "fastapi", "flask", "react", "typescript", "javascript",
            "html", "css", "postgresql", "sql", "mysql", "mongodb", "redis", "docker",
            "kubernetes", "aws", "git", "ci/cd", "rest api", "graphql", "java", "c++"
        ]
        
        found_skills = [tech for tech in known_techs if tech in text_lower]
        if not found_skills:
            found_skills = ["Python", "SQL", "Git", "REST API"]

        skills_list = []
        for s in found_skills:
            cat = "Language" if s in ["python", "javascript", "java", "c++", "sql"] else "Framework"
            if s in ["postgresql", "mysql", "mongodb", "redis"]: cat = "Database"
            if s in ["docker", "kubernetes", "aws", "git", "ci/cd"]: cat = "DevOps"
            skills_list.append({"name": s.title(), "category": cat, "proficiency": "Intermediate"})

        # Project extraction fallback
        projects = []
        if "project" in text_lower or "system" in text_lower:
            projects.append({
                "title": "Secure Cloud Management Platform" if "cloud" in text_lower else "Adaptive E-Commerce Platform",
                "description": "Designed and developed a scalable web service supporting authentication, data storage, and REST APIs.",
                "technologies": ", ".join([s.title() for s in found_skills[:4]]),
                "responsibilities": "Implemented core backend architecture, optimized query performance, and configured CI/CD workflows.",
                "features": "User authentication, real-time dashboard analytics, role-based authorization."
            })
        else:
            projects.append({
                "title": "Full-Stack Web Application",
                "description": "Built a modular REST API backend with modern frontend dashboard interfaces.",
                "technologies": "Python, FastAPI, React, PostgreSQL",
                "responsibilities": "Designed database schema, wrote unit tests, and integrated security middleware.",
                "features": "JWT Authentication, dynamic filtering, state persistence."
            })

        return {
            "phone": "+1 (555) 019-2834" if "phone" in text_lower or "+" in text_lower else "+91 9876543210",
            "location": "San Francisco, CA" if "san francisco" in text_lower else "Bengaluru, India",
            "target_role": "Full-Stack Software Engineer",
            "experience_level": "Entry-Level" if "fresher" in text_lower or "student" in text_lower else "Mid-Level",
            "preferred_industry": "Software Engineering / SaaS",
            "educations": [{
                "degree": "Bachelor of Technology",
                "branch": "Computer Science & Engineering",
                "college": "Institute of Technology",
                "graduation_year": 2025,
                "cgpa": "8.5 / 10"
            }],
            "skills": skills_list,
            "projects": projects,
            "certifications": [{
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "issue_date": "2024"
            }]
        }

    async def analyze_job_description(self, raw_text: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        
        required = []
        for tech in ["python", "fastapi", "react", "postgresql", "docker", "git", "rest api", "sql", "java", "aws"]:
            if tech in text_lower:
                required.append(tech.title())

        if not required:
            required = ["Python", "FastAPI", "PostgreSQL", "REST API", "Git"]

        preferred = ["Redis", "Celery", "AWS", "Docker", "GraphQL"]
        
        return {
            "title": "Python Backend Developer" if "backend" in text_lower else "Full-Stack Software Engineer",
            "domain": "Software Engineering",
            "experience_required": "0-2 Years",
            "required_skills": required,
            "preferred_skills": preferred[:3],
            "responsibilities": [
                "Design and maintain high-performance RESTful APIs",
                "Collaborate with cross-functional teams to deliver production features",
                "Write clean, modular code with comprehensive automated unit tests",
                "Optimize database queries and system performance"
            ],
            "keywords": required + preferred[:2]
        }

    async def generate_interview_question(
        self,
        candidate_context: Dict[str, Any],
        job_context: Optional[Dict[str, Any]],
        interview_type: str,
        difficulty: str,
        sequence_number: int,
        previous_qa_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        # Check projects or skills from resume
        projects = candidate_context.get("projects", [])
        skills = candidate_context.get("skills", [])
        target_role = candidate_context.get("target_role") or "Software Engineer"
        
        project_title = projects[0].get("title") if projects else "Secure File Sharing System"
        project_techs = projects[0].get("technologies") if projects else "Python, Django, SQL"
        
        skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in skills] if skills else ["Python", "Django", "SQL", "Git"]
        primary_skill = skill_names[0] if skill_names else "Python"
        second_skill = skill_names[1] if len(skill_names) > 1 else "Django"
        db_skill = next((s for s in skill_names if any(kw in s.lower() for kw in ["sql", "db", "postgres"])), "SQL")

        # 15 Core Fresher-Friendly Structured Interviewer Questions (Personalized per logged-in candidate)
        fresher_sequence = [
            {
                "question": f"Tell me about yourself, your academic background, and what interests you about becoming a {target_role}.",
                "question_type": "hr",
                "resume_source": "RESUME",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Evaluating candidate self-introduction and career interest in {target_role}.",
                "reasons": [
                    f"✓ Candidate Target Role: {target_role}",
                    "✓ Evaluating self-introduction, communication, and background overview"
                ],
                "expected_topics": ["Self Introduction", "Background", "Career Objective"]
            },
            {
                "question": f"Can you explain your project, '{project_title}'?",
                "question_type": "project",
                "resume_source": "PROJECT",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Evaluating project overview and architecture for '{project_title}'.",
                "reasons": [
                    f"✓ Project: {project_title} listed in resume",
                    "✓ Evaluating high-level project purpose and architecture"
                ],
                "expected_topics": ["Project Purpose", "Architecture", "System Overview"]
            },
            {
                "question": f"What was your specific role and personal contribution in developing '{project_title}'?",
                "question_type": "project",
                "resume_source": "PROJECT",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Assessing individual contribution and hands-on coding role in '{project_title}'.",
                "reasons": [
                    f"✓ Project: {project_title}",
                    "✓ Evaluating hands-on feature ownership and individual coding role"
                ],
                "expected_topics": ["Individual Role", "Code Ownership", "Features Developed"]
            },
            {
                "question": f"What technologies, frameworks ({project_techs}), and tools did you use in developing '{project_title}'?",
                "question_type": "project",
                "resume_source": "PROJECT",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Assessing technical stack selection for '{project_title}'.",
                "reasons": [
                    f"✓ Project Tech Stack: {project_techs}",
                    "✓ Evaluating technology stack choices and tool selection"
                ],
                "expected_topics": ["Technology Stack", "Frameworks", "Database & Tools"]
            },
            {
                "question": f"What major technical challenges or bugs did you face while building '{project_title}'?",
                "question_type": "project",
                "resume_source": "PROJECT",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Evaluating technical problem identification and complexity in '{project_title}'.",
                "reasons": [
                    f"✓ Project: {project_title}",
                    "✓ Evaluating technical hurdles, edge cases, and bug identification"
                ],
                "expected_topics": ["Technical Challenges", "Bugs", "System Bottlenecks"]
            },
            {
                "question": f"How did you solve those technical challenges in '{project_title}', and what was your step-by-step resolution process?",
                "question_type": "project",
                "resume_source": "PROJECT",
                "skill": primary_skill,
                "project": project_title,
                "reason": "Assessing problem-solving process, debugging strategy, and resilience.",
                "reasons": [
                    f"✓ Problem solving in {project_title}",
                    "✓ Evaluating debugging strategy, testing, and technical resolution"
                ],
                "expected_topics": ["Problem Solving", "Debugging Process", "Solution Architecture"]
            },
            {
                "question": f"What is {primary_skill}, and what are its key features that make it popular in modern software engineering?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Testing core programming language fundamentals in {primary_skill}.",
                "reasons": [
                    f"✓ {primary_skill} listed in technical skills",
                    "✓ Testing language features, dynamic typing, and ecosystem"
                ],
                "expected_topics": [primary_skill, "Core Features", "Syntax & Ecosystem"]
            },
            {
                "question": "What is Object-Oriented Programming (OOP), and can you explain its core pillars (Encapsulation, Inheritance, Polymorphism, Abstraction) with examples?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": primary_skill,
                "project": project_title,
                "reason": "Testing Object-Oriented Programming concepts.",
                "reasons": [
                    "✓ Fundamental OOP architecture check",
                    "✓ Testing Encapsulation, Abstraction, Inheritance, and Polymorphism"
                ],
                "expected_topics": ["OOP", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction"]
            },
            {
                "question": f"What is {db_skill}, and how do you write basic queries using clauses like WHERE, GROUP BY, and JOINs?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": db_skill,
                "project": project_title,
                "reason": f"Testing relational database fundamentals and query writing in {db_skill}.",
                "reasons": [
                    f"✓ {db_skill} database skills check",
                    "✓ Testing relational queries, filtering, grouping, and JOINs"
                ],
                "expected_topics": [db_skill, "Relational Database", "Queries", "JOINs", "GROUP BY"]
            },
            {
                "question": "What is a REST API, and what are standard HTTP methods (GET, POST, PUT, DELETE) and status codes?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": "REST API",
                "project": project_title,
                "reason": "Testing Web API architecture and HTTP protocol knowledge.",
                "reasons": [
                    "✓ REST API web development skills check",
                    "✓ Testing HTTP methods, endpoints, JSON payload formatting, and status codes"
                ],
                "expected_topics": ["REST API", "HTTP Verbs", "JSON", "Status Codes"]
            },
            {
                "question": f"What is the difference between SQL (relational) and NoSQL (non-relational) databases, and when would you choose {db_skill} over NoSQL?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": db_skill,
                "project": project_title,
                "reason": "Testing database architectural selection and SQL vs NoSQL trade-offs.",
                "reasons": [
                    "✓ Database architecture evaluation",
                    "✓ Testing ACID compliance vs eventual consistency, scaling, and schema flexibility"
                ],
                "expected_topics": ["SQL vs NoSQL", "Relational vs Document", "ACID", "Scalability"]
            },
            {
                "question": f"How do you handle errors and exceptions in {primary_skill} using try-except-finally blocks?",
                "question_type": "technical",
                "resume_source": "TECHNICAL",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Testing exception handling and code reliability in {primary_skill}.",
                "reasons": [
                    f"✓ {primary_skill} exception handling check",
                    "✓ Testing try-except blocks, custom exceptions, and error logging"
                ],
                "expected_topics": ["Exception Handling", "try-except", "Custom Exceptions", "Error Logging"]
            },
            {
                "question": f"Explain your strongest technical skill ({primary_skill}), how you mastered it, and a practical application where you used it.",
                "question_type": "technical",
                "resume_source": "RESUME",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Evaluating candidate's depth of mastery in primary skill ({primary_skill}).",
                "reasons": [
                    f"✓ Primary Skill: {primary_skill}",
                    "✓ Evaluating technical confidence, depth of mastery, and practical usage"
                ],
                "expected_topics": [primary_skill, "Technical Depth", "Practical Application"]
            },
            {
                "question": f"Why should we hire you for this {target_role} position?",
                "question_type": "hr",
                "resume_source": "HR",
                "skill": primary_skill,
                "project": project_title,
                "reason": f"Evaluating candidate self-awareness, unique value proposition, and role alignment for {target_role}.",
                "reasons": [
                    f"✓ Target Role: {target_role}",
                    "✓ Assessing candidate pitch, confidence, and placement suitability"
                ],
                "expected_topics": ["Candidate Pitch", "Value Proposition", "Role Fit"]
            },
            {
                "question": f"Where do you see yourself in 5 years in your engineering career as a {target_role}?",
                "question_type": "hr",
                "resume_source": "HR",
                "skill": primary_skill,
                "project": project_title,
                "reason": "Evaluating long-term career ambition, growth mindset, and vision.",
                "reasons": [
                    "✓ Long-term career vision check",
                    "✓ Assessing commitment, growth goals, and leadership/technical trajectory"
                ],
                "expected_topics": ["5-Year Vision", "Career Growth", "Leadership/Technical Aspirations"]
            }
        ]

        if interview_type == "CODING":
            res = {
                "question": f"Write a {primary_skill} function `two_sum(nums: list[int], target: int) -> list[int]` that returns indices of the two numbers such that they add up to target. Optimize for O(n) time complexity.",
                "question_type": "coding",
                "resume_source": "CODING",
                "skill": primary_skill,
                "project": project_title,
                "expected_topics": ["Hash Map", "Array Search", "Time Complexity O(n)"],
                "reason": "Testing fundamental problem-solving and optimal data structure usage.",
                "reasons": [
                    f"✓ Skill: {primary_skill} problem solving",
                    "✓ Testing optimal data structure selection & time complexity"
                ],
                "code_starter": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Implement optimal O(n) solution using a dictionary\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n",
                "code_language": primary_skill.lower()
            }
        else:
            idx = (sequence_number - 1) % len(fresher_sequence)
            res = fresher_sequence[idx]

        res["difficulty"] = difficulty
        res["follow_up_depth"] = 0
        return res


    async def evaluate_answer(
        self,
        question_text: str,
        expected_topics: List[str],
        candidate_answer: str,
        previous_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        ans_len = len(candidate_answer.strip().split())
        
        # Scoring logic based on answer completeness & keywords
        if ans_len < 5:
            tech_score = 35.0
            rel_score = 40.0
            comp_score = 30.0
            comm_score = 50.0
            strengths = ["Prompt response submission"]
            weaknesses = ["Answer is excessively brief", "Lacks technical specifics and examples"]
            missing = expected_topics if expected_topics else ["Detailed explanation", "Concrete code example"]
            rec_follow = "Can you elaborate further with a step-by-step technical explanation?"
        elif ans_len < 25:
            tech_score = 70.0
            rel_score = 75.0
            comp_score = 65.0
            comm_score = 75.0
            strengths = ["Identified core concepts correctly", "Clear communication style"]
            weaknesses = ["Could include deeper architectural considerations", "Missing edge-case analysis"]
            missing = [expected_topics[-1]] if expected_topics else ["Scaling considerations"]
            rec_follow = "What specific trade-offs or performance limits might apply to your solution?"
        else:
            tech_score = 88.0
            rel_score = 92.0
            comp_score = 85.0
            comm_score = 90.0
            strengths = ["Comprehensive technical explanation", "Accurate domain concepts", "Good structured answer"]
            weaknesses = ["Minor opportunity to discuss enterprise monitoring/logging"]
            missing = []
            rec_follow = "How would you write automated tests to verify this behavior under heavy load?"

        overall = round((tech_score * 0.4 + rel_score * 0.2 + comp_score * 0.2 + comm_score * 0.2), 1)

        return {
            "technical_score": tech_score,
            "relevance_score": rel_score,
            "completeness_score": comp_score,
            "communication_score": comm_score,
            "overall_score": overall,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_concepts": missing,
            "recommended_follow_up": rec_follow
        }

    async def generate_follow_up_question(
        self,
        previous_question: str,
        candidate_answer: str,
        evaluation: Dict[str, Any],
        difficulty: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        overall = evaluation.get("overall_score", 70)
        
        if overall >= 85:
            # Strong answer -> deeper question
            return {
                "question": f"Building on your great answer regarding '{previous_question[:40]}...', how would you handle distributed locking and race conditions across multiple worker nodes?",
                "question_type": "technical",
                "difficulty": "HARD",
                "expected_topics": ["Distributed Systems", "Race Conditions", "Redis Mutex/Locking"],
                "reason": "Strong previous performance triggered a deeper technical inquiry on concurrency.",
                "follow_up_depth": 1
            }
        elif overall >= 60:
            # Partial answer -> clarification question
            missing = evaluation.get("missing_concepts", ["key principles"])
            concept = missing[0] if missing else "edge cases"
            return {
                "question": f"You mentioned key points in your previous answer, but how specifically would you address {concept}?",
                "question_type": "technical",
                "difficulty": difficulty,
                "expected_topics": [concept, "Practical Implementation"],
                "reason": "Partial answer triggered a targeted clarification question.",
                "follow_up_depth": 1
            }
        else:
            # Weak answer -> simpler foundational question
            return {
                "question": "Let's step back to core principles: What are the fundamental differences between synchronous and asynchronous execution in software development?",
                "question_type": "technical",
                "difficulty": "EASY",
                "expected_topics": ["Sync vs Async", "Event Loop", "Single/Multi-threading"],
                "reason": "Weak answer triggered a foundational sanity check question.",
                "follow_up_depth": 1
            }


class GeminiAIService(AIServiceInterface):
    """Google Gemini AI Service Implementation."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={api_key}"

    async def _call_gemini_json(self, prompt: str) -> Dict[str, Any]:
        system_instruction = "You are IntervueX AI, an expert software engineering interviewer. Always return valid JSON without markdown wrapping."
        full_prompt = f"{system_instruction}\n\nPrompt:\n{prompt}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            res = await client.post(self.endpoint, json=payload)
            res.raise_for_status()
            data = res.json()
            raw_text = data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(raw_text)

    async def extract_resume_info(self, raw_text: str) -> Dict[str, Any]:
        prompt = f"""Extract candidate information from the following resume text into a strict JSON structure.
Do NOT invent information not present in the text.

Resume Text:
{raw_text[:4000]}

Return JSON with format:
{{
  "phone": "...",
  "location": "...",
  "target_role": "...",
  "experience_level": "Entry-Level | Mid-Level | Senior",
  "preferred_industry": "...",
  "educations": [{{"degree": "...", "branch": "...", "college": "...", "graduation_year": 2025, "cgpa": "..."}}],
  "skills": [{{"name": "...", "category": "Language|Framework|Database|Cloud|DevOps|Tool", "proficiency": "Intermediate"}}],
  "projects": [{{"title": "...", "description": "...", "technologies": "...", "responsibilities": "...", "features": "..."}}],
  "certifications": [{{"name": "...", "issuer": "...", "issue_date": "..."}}]
}}"""
        return await self._call_gemini_json(prompt)

    async def analyze_job_description(self, raw_text: str) -> Dict[str, Any]:
        prompt = f"""Analyze this job description text and extract structured job requirements into JSON:

Job Text:
{raw_text[:4000]}

Return JSON format:
{{
  "title": "...",
  "domain": "...",
  "experience_required": "...",
  "required_skills": ["Skill1", "Skill2"],
  "preferred_skills": ["Skill3"],
  "responsibilities": ["Resp1", "Resp2"],
  "keywords": ["Keyword1", "Keyword2"]
}}"""
        return await self._call_gemini_json(prompt)

    async def generate_interview_question(
        self,
        candidate_context: Dict[str, Any],
        job_context: Optional[Dict[str, Any]],
        interview_type: str,
        difficulty: str,
        sequence_number: int,
        previous_qa_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        prompt = f"""Generate an interview question for candidate.
Candidate context: {json.dumps(candidate_context)}
Job context: {json.dumps(job_context or {})}
Interview Type: {interview_type}
Difficulty: {difficulty}
Sequence Number: {sequence_number}
Previous QA History: {json.dumps(previous_qa_history)}

Return JSON:
{{
  "question": "...",
  "question_type": "{interview_type.lower()}",
  "difficulty": "{difficulty}",
  "reason": "...",
  "expected_topics": ["topic1", "topic2"],
  "code_starter": null,
  "code_language": "python"
}}"""
        return await self._call_gemini_json(prompt)

    async def evaluate_answer(
        self,
        question_text: str,
        expected_topics: List[str],
        candidate_answer: str,
        previous_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        prompt = f"""Evaluate candidate's answer.
Question: {question_text}
Expected Topics: {json.dumps(expected_topics)}
Answer: {candidate_answer}

Return JSON:
{{
  "technical_score": 85.0,
  "relevance_score": 90.0,
  "completeness_score": 80.0,
  "communication_score": 88.0,
  "overall_score": 85.8,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missing_concepts": ["..."],
  "recommended_follow_up": "..."
}}"""
        return await self._call_gemini_json(prompt)

    async def generate_follow_up_question(
        self,
        previous_question: str,
        candidate_answer: str,
        evaluation: Dict[str, Any],
        difficulty: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        prompt = f"""Generate follow-up question based on evaluation.
Previous Question: {previous_question}
Candidate Answer: {candidate_answer}
Evaluation: {json.dumps(evaluation)}

Return JSON:
{{
  "question": "...",
  "question_type": "technical",
  "difficulty": "{difficulty}",
  "expected_topics": ["..."],
  "reason": "...",
  "follow_up_depth": 1
}}"""
        return await self._call_gemini_json(prompt)


def get_ai_service() -> AIServiceInterface:
    """Factory function to retrieve configured AI service provider."""
    provider = settings.AI_PROVIDER.lower()
    api_key = settings.AI_API_KEY
    
    if (provider == "gemini" or provider == "auto") and api_key:
        try:
            logger.info("Initializing Gemini AI Service")
            return GeminiAIService(api_key=api_key)
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini AI Service: {e}. Falling back to Mock service.")
    
    logger.info("Using Mock AI Service Engine")
    return MockAIService()
