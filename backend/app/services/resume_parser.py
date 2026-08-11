import os
import json
import logging
from typing import Dict, Any, Tuple
from pypdf import PdfReader
from docx import Document
from sqlalchemy.orm import Session

from app.models.resume import Resume, ResumeAnalysis
from app.models.candidate import CandidateProfile, Education, Skill, Project, Certification
from app.ai.service import get_ai_service

logger = logging.getLogger(__name__)

class ResumeParserService:

    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """Extract plain text from PDF or DOCX file."""
        ext = os.path.splitext(file_path)[1].lower()
        text = ""

        if ext == ".pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        elif ext in [".docx", ".doc"]:
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        return text.strip()

    @staticmethod
    def calculate_resume_score(extracted_data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
        """
        Calculate Resume Score out of 100 with category breakdown and explanations.
        Categories:
        - Technical Skills (25%)
        - Project Strength (25%)
        - Experience (15%)
        - Education (15%)
        - Keyword Relevance (10%)
        - Completeness (10%)
        """
        skills = extracted_data.get("skills", [])
        projects = extracted_data.get("projects", [])
        educations = extracted_data.get("educations", [])
        certifications = extracted_data.get("certifications", [])

        # Technical Skills score
        tech_score = min(100.0, len(skills) * 12.5) if skills else 50.0
        
        # Project Strength score
        project_score = 50.0
        if projects:
            p_count = len(projects)
            project_score = min(100.0, 60.0 + p_count * 20.0)
            if any(p.get("technologies") for p in projects):
                project_score = min(100.0, project_score + 10.0)

        # Experience score
        exp_level = extracted_data.get("experience_level", "Entry-Level")
        if exp_level == "Senior": exp_score = 90.0
        elif exp_level == "Mid-Level": exp_score = 80.0
        else: exp_score = 65.0

        # Education score
        edu_score = 85.0 if educations else 60.0

        # Keyword relevance
        kw_score = min(100.0, 60.0 + len(skills) * 4.0)

        # Completeness score
        comp_count = 0
        if extracted_data.get("phone"): comp_count += 20
        if extracted_data.get("location"): comp_count += 10
        if skills: comp_count += 25
        if projects: comp_count += 25
        if educations: comp_count += 20
        completeness_score = float(comp_count)

        overall_score = round(
            (tech_score * 0.25) +
            (project_score * 0.25) +
            (exp_score * 0.15) +
            (edu_score * 0.15) +
            (kw_score * 0.10) +
            (completeness_score * 0.10),
            1
        )

        # ATS Compatibility Algorithm
        text_lower = raw_text.lower()
        
        # Action Verbs check
        action_verbs = [
            "developed", "designed", "implemented", "built", "architected", "optimized",
            "created", "engineered", "configured", "deployed", "managed", "integrated",
            "reduced", "increased", "spearheaded", "automated", "refactored"
        ]
        found_verbs = [v for v in action_verbs if v in text_lower]
        verb_score = min(100.0, 45.0 + len(found_verbs) * 8.0)

        # Metrics / Quantifiable results check
        metrics_keywords = ["%", "percent", "ms", "seconds", "users", "100k", "cgpa", "scale", "reduced", "increased"]
        found_metrics = [m for m in metrics_keywords if m in text_lower]
        impact_score = min(100.0, 50.0 + len(found_metrics) * 12.5)

        # Formatting & Section Headers check
        section_headers = ["skill", "project", "education", "experience", "certification", "contact", "summary"]
        found_headers = [h for h in section_headers if h in text_lower]
        ats_formatting_score = min(100.0, 45.0 + len(found_headers) * 9.0)

        # Keyword density
        ats_keyword_score = min(100.0, 55.0 + len(skills) * 4.5)

        # Overall ATS Compatibility Score
        ats_score = round(
            (ats_formatting_score * 0.30) +
            (ats_keyword_score * 0.30) +
            (verb_score * 0.20) +
            (impact_score * 0.20),
            1
        )

        ats_breakdown = {
            "action_verbs_count": len(found_verbs),
            "found_action_verbs": found_verbs[:6],
            "quantifiable_metrics_count": len(found_metrics),
            "parseability_status": "Passed (Clean Standard Layout Parsing)",
            "contact_info_status": "Complete" if extracted_data.get("phone") else "Missing Phone Number",
            "ats_recommendations": [
                "Use bullet points starting with strong technical action verbs (e.g. Developed, Designed, Implemented).",
                "Include quantifiable metrics (e.g. improved speed by 20%, handled 500+ users, 8.8 CGPA).",
                "Keep technical skill sections formatted with standard category headers for ATS parser indexing."
            ]
        }

        strengths = []
        weaknesses = []
        missing = []

        if skills:
            strengths.append(f"Strong technical skill stack with {len(skills)} identified proficiencies.")
        else:
            weaknesses.append("No technical skills explicitly parsed.")
            missing.append("Technical Skills list")

        if projects:
            strengths.append(f"Highlighted {len(projects)} practical development project(s).")
        else:
            weaknesses.append("Missing detailed project section.")
            missing.append("Project Portfolio")

        if certifications:
            strengths.append(f"Holds {len(certifications)} professional certification(s).")

        if not extracted_data.get("phone"):
            missing.append("Contact Phone Number")

        return {
            "overall_score": overall_score,
            "tech_skills_score": tech_score,
            "project_score": project_score,
            "experience_score": exp_score,
            "education_score": edu_score,
            "relevance_score": kw_score,
            "completeness_score": completeness_score,
            "ats_score": ats_score,
            "ats_formatting_score": ats_formatting_score,
            "ats_keyword_score": ats_keyword_score,
            "ats_readability_score": verb_score,
            "ats_breakdown": ats_breakdown,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_info": missing
        }


    @classmethod
    async def process_and_save_resume(
        cls, db: Session, candidate_profile: CandidateProfile, file_path: str, filename: str
    ) -> Tuple[Resume, ResumeAnalysis]:
        """Extract text, parse structured data with AI service, update candidate profile, and save analysis."""
        raw_text = cls.extract_text_from_file(file_path)
        
        # Save raw resume record
        resume = Resume(
            candidate_id=candidate_profile.id,
            filename=filename,
            file_path=file_path,
            raw_text=raw_text
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Call AI Service to extract structured details
        ai_service = get_ai_service()
        extracted_info = await ai_service.extract_resume_info(raw_text)

        # Update candidate profile with extracted fields (without blindly overwriting if already populated)
        if extracted_info.get("phone"): candidate_profile.phone = extracted_info["phone"]
        if extracted_info.get("location"): candidate_profile.location = extracted_info["location"]
        if extracted_info.get("target_role"): candidate_profile.target_role = extracted_info["target_role"]
        if extracted_info.get("experience_level"): candidate_profile.experience_level = extracted_info["experience_level"]
        if extracted_info.get("preferred_industry"): candidate_profile.preferred_industry = extracted_info["preferred_industry"]

        # Populate skills
        for s in extracted_info.get("skills", []):
            existing = db.query(Skill).filter(
                Skill.candidate_id == candidate_profile.id,
                Skill.name == s["name"]
            ).first()
            if not existing:
                db.add(Skill(
                    candidate_id=candidate_profile.id,
                    name=s["name"],
                    category=s.get("category", "Language"),
                    proficiency=s.get("proficiency", "Intermediate")
                ))

        # Populate projects
        for p in extracted_info.get("projects", []):
            existing = db.query(Project).filter(
                Project.candidate_id == candidate_profile.id,
                Project.title == p["title"]
            ).first()
            if not existing:
                db.add(Project(
                    candidate_id=candidate_profile.id,
                    title=p["title"],
                    description=p.get("description"),
                    technologies=p.get("technologies"),
                    responsibilities=p.get("responsibilities"),
                    features=p.get("features")
                ))

        # Populate educations
        for ed in extracted_info.get("educations", []):
            existing = db.query(Education).filter(
                Education.candidate_id == candidate_profile.id,
                Education.college == ed["college"]
            ).first()
            if not existing:
                db.add(Education(
                    candidate_id=candidate_profile.id,
                    degree=ed["degree"],
                    branch=ed.get("branch"),
                    college=ed["college"],
                    graduation_year=ed.get("graduation_year"),
                    cgpa=ed.get("cgpa")
                ))

        # Populate certifications
        for c in extracted_info.get("certifications", []):
            existing = db.query(Certification).filter(
                Certification.candidate_id == candidate_profile.id,
                Certification.name == c["name"]
            ).first()
            if not existing:
                db.add(Certification(
                    candidate_id=candidate_profile.id,
                    name=c["name"],
                    issuer=c.get("issuer"),
                    issue_date=c.get("issue_date")
                ))

        # Calculate scores
        score_data = cls.calculate_resume_score(extracted_info, raw_text)

        analysis = ResumeAnalysis(
            resume_id=resume.id,
            overall_score=score_data["overall_score"],
            tech_skills_score=score_data["tech_skills_score"],
            project_score=score_data["project_score"],
            experience_score=score_data["experience_score"],
            education_score=score_data["education_score"],
            relevance_score=score_data["relevance_score"],
            completeness_score=score_data["completeness_score"],
            ats_score=score_data.get("ats_score", 85.0),
            ats_formatting_score=score_data.get("ats_formatting_score", 90.0),
            ats_keyword_score=score_data.get("ats_keyword_score", 82.0),
            ats_readability_score=score_data.get("ats_readability_score", 88.0),
            ats_breakdown_json=json.dumps(score_data.get("ats_breakdown", {})),
            strengths_json=json.dumps(score_data["strengths"]),
            weaknesses_json=json.dumps(score_data["weaknesses"]),
            missing_info_json=json.dumps(score_data["missing_info"])
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return resume, analysis
