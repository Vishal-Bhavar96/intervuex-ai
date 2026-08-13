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

    # Seed Aptitude Test Configuration if not present
    from app.models.aptitude import AptitudeTestConfig, AptitudeQuestion
    config = db.query(AptitudeTestConfig).first()
    if not config:
        logger.info("Seeding Aptitude Test Configuration...")
        db.add(AptitudeTestConfig(
            title="MNC-Style Aptitude Practice Assessment",
            description="Evaluate your quantitative, logical, verbal and analytical skills with an MNC-style placement assessment.",
            total_questions=40,
            duration_minutes=45,
            negative_marking_enabled=True,
            correct_marks=1.0,
            negative_marks=0.25,
            passing_score=60.0,
            is_active=True
        ))
        db.commit()

    # Seed Aptitude Question Bank if empty
    q_count = db.query(AptitudeQuestion).count()
    if q_count == 0:
        logger.info("Seeding MNC-Style Aptitude Question Bank...")
        raw_questions = [
            # --- QUANTITATIVE APTITUDE ---
            {
                "code": "QA001", "section": "Quantitative Aptitude", "topic": "Profit and Loss", "difficulty": "Easy",
                "question": "A product is marked at ₹2,000 and sold at a discount of 15%. What is the selling price?",
                "options": ["₹1,600", "₹1,700", "₹1,800", "₹1,850"], "correct": 1,
                "explanation": "Discount = 15% of ₹2,000 = ₹300. Selling Price = ₹2,000 - ₹300 = ₹1,700.",
                "patterns": ["General MNC", "TCS-style", "Wipro-style", "Cognizant-style"]
            },
            {
                "code": "QA002", "section": "Quantitative Aptitude", "topic": "Time Speed Distance", "difficulty": "Easy",
                "question": "A train travels 120 km in 2 hours. What is its average speed in km/h?",
                "options": ["40 km/h", "50 km/h", "60 km/h", "80 km/h"], "correct": 2,
                "explanation": "Speed = Distance / Time = 120 km / 2 hours = 60 km/h.",
                "patterns": ["General MNC", "Infosys-style", "Capgemini-style"]
            },
            {
                "code": "QA003", "section": "Quantitative Aptitude", "topic": "Percentages", "difficulty": "Medium",
                "question": "If the salary of an employee is increased by 20% and then decreased by 20%, what is the net percentage change in salary?",
                "options": ["0% change", "4% decrease", "4% increase", "2% decrease"], "correct": 1,
                "explanation": "Net % change = x + y + (xy/100) = 20 - 20 + (20 * -20 / 100) = -4%. Hence, a 4% decrease.",
                "patterns": ["General MNC", "Accenture-style", "TCS-style"]
            },
            {
                "code": "QA004", "section": "Quantitative Aptitude", "topic": "Ratio and Proportion", "difficulty": "Medium",
                "question": "The ratio of two numbers is 3:5. If 10 is added to each number, the new ratio becomes 5:7. What is the smaller number?",
                "options": ["12", "15", "18", "21"], "correct": 1,
                "explanation": "Let numbers be 3x and 5x. (3x + 10) / (5x + 10) = 5/7 => 21x + 70 = 25x + 50 => 4x = 20 => x = 5. Smaller number = 3 * 5 = 15.",
                "patterns": ["General MNC", "Cognizant-style", "Persistent-style"]
            },
            {
                "code": "QA005", "section": "Quantitative Aptitude", "topic": "Time and Work", "difficulty": "Medium",
                "question": "A can complete a piece of work in 12 days and B in 16 days. Working together, how many days will they take to complete the work?",
                "options": ["6.85 days", "7.2 days", "6.2 days", "8 days"], "correct": 0,
                "explanation": "Combined 1-day work = 1/12 + 1/16 = (4+3)/48 = 7/48. Total time = 48/7 ≈ 6.85 days.",
                "patterns": ["General MNC", "LTIMindtree-style", "Tech Mahindra-style"]
            },
            {
                "code": "QA006", "section": "Quantitative Aptitude", "topic": "Average", "difficulty": "Easy",
                "question": "The average of 5 consecutive numbers is 24. What is the highest of these numbers?",
                "options": ["24", "25", "26", "27"], "correct": 2,
                "explanation": "For an odd count of consecutive numbers, the average is the middle number. The numbers are 22, 23, 24, 25, 26. Highest is 26.",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "QA007", "section": "Quantitative Aptitude", "topic": "Simple Interest", "difficulty": "Medium",
                "question": "What sum of money will yield ₹450 as Simple Interest in 3 years at 6% per annum?",
                "options": ["₹2,200", "₹2,500", "₹2,700", "₹3,000"], "correct": 1,
                "explanation": "SI = (P * R * T) / 100 => 450 = (P * 6 * 3) / 100 => P = (450 * 100) / 18 = ₹2,500.",
                "patterns": ["General MNC", "Capgemini-style"]
            },
            {
                "code": "QA008", "section": "Quantitative Aptitude", "topic": "Compound Interest", "difficulty": "Hard",
                "question": "Find the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually.",
                "options": ["₹2,000", "₹2,100", "₹2,200", "₹2,050"], "correct": 1,
                "explanation": "Amount = P(1 + R/100)^n = 10000(1.1)^2 = ₹12,100. CI = 12,100 - 10,000 = ₹2,100.",
                "patterns": ["General MNC", "Infosys-style"]
            },
            {
                "code": "QA009", "section": "Quantitative Aptitude", "topic": "Probability", "difficulty": "Hard",
                "question": "Two unbiased dice are thrown. What is the probability of getting a sum equal to 8?",
                "options": ["1/6", "5/36", "7/36", "1/9"], "correct": 1,
                "explanation": "Favorable pairs: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes out of total 36. P = 5/36.",
                "patterns": ["General MNC", "TCS-style", "Persistent-style"]
            },
            {
                "code": "QA010", "section": "Quantitative Aptitude", "topic": "Permutation and Combination", "difficulty": "Hard",
                "question": "In how many different ways can the letters of the word 'LEADER' be arranged?",
                "options": ["360", "720", "180", "120"], "correct": 0,
                "explanation": "Total letters = 6, E repeats 2 times. Ways = 6! / 2! = 720 / 2 = 360.",
                "patterns": ["General MNC", "Accenture-style"]
            },

            # --- LOGICAL REASONING ---
            {
                "code": "LR001", "section": "Logical Reasoning", "topic": "Number Series", "difficulty": "Easy",
                "question": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
                "options": ["38", "40", "42", "44"], "correct": 2,
                "explanation": "Differences between consecutive terms are +4, +6, +8, +10. Next difference is +12. 30 + 12 = 42.",
                "patterns": ["General MNC", "TCS-style", "Cognizant-style"]
            },
            {
                "code": "LR002", "section": "Logical Reasoning", "topic": "Letter Series", "difficulty": "Easy",
                "question": "Find the next term in the series: AZ, CX, EV, GT, ?",
                "options": ["IR", "HS", "JQ", "KP"], "correct": 0,
                "explanation": "First letters: A(+2)C(+2)E(+2)G(+2)I. Second letters: Z(-2)X(-2)V(-2)T(-2)R. Result = IR.",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "LR003", "section": "Logical Reasoning", "topic": "Coding-Decoding", "difficulty": "Medium",
                "question": "If 'COMPUTER' is coded as 'RFUVQNPC', how is 'MEDICINE' coded in that same rule?",
                "options": ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJFEM"], "correct": 0,
                "explanation": "Reverse the word and add +1 to each letter except the first and last position. MEDICINE -> ENICIDEM -> E(O)(J)(D)(J)(E)(F)M.",
                "patterns": ["General MNC", "Infosys-style"]
            },
            {
                "code": "LR004", "section": "Logical Reasoning", "topic": "Blood Relations", "difficulty": "Medium",
                "question": "Pointing to a photograph, Rohit said, 'She is the daughter of my grandfather's only son.' How is the girl related to Rohit?",
                "options": ["Mother", "Sister", "Cousin", "Aunt"], "correct": 1,
                "explanation": "Grandfather's only son = Rohit's father. Daughter of Rohit's father = Rohit's sister.",
                "patterns": ["General MNC", "Capgemini-style", "Tech Mahindra-style"]
            },
            {
                "code": "LR005", "section": "Logical Reasoning", "topic": "Direction Sense", "difficulty": "Easy",
                "question": "A man walks 5 km North, turns right and walks 3 km, then turns right again and walks 5 km. How far is he from his starting point?",
                "options": ["3 km", "5 km", "8 km", "13 km"], "correct": 0,
                "explanation": "Moving North 5 km and South 5 km cancels out vertical displacement. Net horizontal distance = 3 km East.",
                "patterns": ["General MNC", "Accenture-style"]
            },
            {
                "code": "LR006", "section": "Logical Reasoning", "topic": "Syllogisms", "difficulty": "Medium",
                "question": "Statements: All cats are dogs. All dogs are birds.\nConclusion I: All cats are birds.\nConclusion II: Some birds are cats.",
                "options": ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], "correct": 2,
                "explanation": "Cats ⊂ Dogs ⊂ Birds. Therefore, all cats are birds, and some birds are cats. Both follow.",
                "patterns": ["General MNC", "LTIMindtree-style"]
            },
            {
                "code": "LR007", "section": "Logical Reasoning", "topic": "Seating Arrangement", "difficulty": "Hard",
                "question": "Five friends A, B, C, D, E are sitting in a row facing North. C is sitting between A and E. B is to the immediate right of E. D is at the extreme left. Who is sitting in the middle?",
                "options": ["A", "B", "C", "E"], "correct": 0,
                "explanation": "Arrangement from left to right: D - A - C - E - B. The middle person is A.",
                "patterns": ["General MNC", "Persistent-style", "TCS-style"]
            },
            {
                "code": "LR008", "section": "Logical Reasoning", "topic": "Analogy", "difficulty": "Easy",
                "question": "Architect : Building :: Sculptor : ?",
                "options": ["Museum", "Statue", "Chisel", "Stone"], "correct": 1,
                "explanation": "An architect creates a building; a sculptor creates a statue.",
                "patterns": ["General MNC", "Cognizant-style"]
            },
            {
                "code": "LR009", "section": "Logical Reasoning", "topic": "Classification", "difficulty": "Easy",
                "question": "Find the odd one out from the following group: Copper, Zinc, Brass, Iron",
                "options": ["Copper", "Zinc", "Brass", "Iron"], "correct": 2,
                "explanation": "Copper, Zinc, and Iron are pure element metals. Brass is an alloy (Copper + Zinc).",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "LR010", "section": "Logical Reasoning", "topic": "Statement and Conclusion", "difficulty": "Hard",
                "question": "Statement: Standard of living in city X is improving.\nConclusion I: Population of city X is increasing.\nConclusion II: Income level of people in city X is rising.",
                "options": ["Only I follows", "Only II follows", "Both follow", "Neither follows"], "correct": 1,
                "explanation": "Improvement in living standard directly correlates with higher income level (Conclusion II). Population increase does not necessarily follow.",
                "patterns": ["General MNC", "Infosys-style"]
            },

            # --- VERBAL ABILITY ---
            {
                "code": "VA001", "section": "Verbal Ability", "topic": "Grammar", "difficulty": "Easy",
                "question": "Select the correct option to complete the sentence: 'Neither of the candidates _____ submitted their original documents yet.'",
                "options": ["have", "has", "are", "were"], "correct": 1,
                "explanation": "'Neither' takes a singular verb. 'has submitted' is correct.",
                "patterns": ["General MNC", "Accenture-style", "TCS-style"]
            },
            {
                "code": "VA002", "section": "Verbal Ability", "topic": "Synonyms", "difficulty": "Medium",
                "question": "Choose the word most SIMILAR in meaning to 'METICULOUS':",
                "options": ["Careless", "Thorough", "Hastily", "Aggressive"], "correct": 1,
                "explanation": "'Meticulous' means showing great attention to detail; careful and precise. Synonym = Thorough.",
                "patterns": ["General MNC", "Cognizant-style"]
            },
            {
                "code": "VA003", "section": "Verbal Ability", "topic": "Antonyms", "difficulty": "Medium",
                "question": "Choose the word most OPPOSITE in meaning to 'CANDID':",
                "options": ["Frank", "Secretive", "Honest", "Direct"], "correct": 1,
                "explanation": "'Candid' means truthful and straightforward. The opposite is Secretive or Guarded.",
                "patterns": ["General MNC", "Capgemini-style"]
            },
            {
                "code": "VA004", "section": "Verbal Ability", "topic": "Error Detection", "difficulty": "Medium",
                "question": "Identify the part containing an error: 'She enjoys (A) / to read books (B) / in her free time. (C)'",
                "options": ["Part A", "Part B", "Part C", "No error"], "correct": 1,
                "explanation": "The verb 'enjoy' is followed by a gerund (-ing form). It should be 'reading books' instead of 'to read books'.",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "VA005", "section": "Verbal Ability", "topic": "Para Jumbles", "difficulty": "Hard",
                "question": "Rearrange P, Q, R, S to form a coherent paragraph:\nP: It has revolutionized communication globally.\nQ: The internet is a vast network of connected devices.\nR: Furthermore, it drives modern e-commerce.\nS: Today, billions rely on it daily.",
                "options": ["Q-P-R-S", "Q-S-P-R", "P-Q-R-S", "R-Q-P-S"], "correct": 0,
                "explanation": "Q defines the topic (Internet), P describes primary impact, R adds further detail, S summarizes current usage.",
                "patterns": ["General MNC", "Infosys-style"]
            },
            {
                "code": "VA006", "section": "Verbal Ability", "topic": "Sentence Completion", "difficulty": "Easy",
                "question": "Although he worked extremely hard, he failed to _____ the target.",
                "options": ["achieve", "acquire", "fulfill", "gain"], "correct": 0,
                "explanation": "'Achieve' collocates naturally with 'target'.",
                "patterns": ["General MNC", "Tech Mahindra-style"]
            },
            {
                "code": "VA007", "section": "Verbal Ability", "topic": "Vocabulary", "difficulty": "Medium",
                "question": "Choose the correct spelling:",
                "options": ["Accomodation", "Accommodation", "Acommodation", "Accomodatoin"], "correct": 1,
                "explanation": "The correct spelling has double 'c' and double 'm': Accommodation.",
                "patterns": ["General MNC", "LTIMindtree-style"]
            },
            {
                "code": "VA008", "section": "Verbal Ability", "topic": "Reading Comprehension", "difficulty": "Medium",
                "question": "Passage: 'Artificial Intelligence is rapidly transforming global industry workflows. While automation replaces repetitive manual tasks, it simultaneously creates demand for high-skilled data engineers and prompt architects.'\nAccording to the passage, AI automation:",
                "options": ["Eliminates all employment", "Only affects manual labor without new roles", "Replaces repetitive tasks and generates skilled jobs", "Has minimal impact on software roles"], "correct": 2,
                "explanation": "The passage states automation replaces repetitive manual tasks while simultaneously creating demand for high-skilled engineers.",
                "patterns": ["General MNC", "Persistent-style"]
            },
            {
                "code": "VA009", "section": "Verbal Ability", "topic": "Sentence Correction", "difficulty": "Hard",
                "question": "Choose the grammatically correct sentence:",
                "options": [
                    "The team have won all its matches this season.",
                    "The team has won all their matches this season.",
                    "The team has won all its matches this season.",
                    "The team have won all their matches this season."
                ], "correct": 2,
                "explanation": "As a collective noun acting as a single unit, 'team' takes singular verb 'has' and singular pronoun 'its'.",
                "patterns": ["General MNC", "TCS-style"]
            },
            {
                "code": "VA010", "section": "Verbal Ability", "topic": "Fill in the Blanks", "difficulty": "Easy",
                "question": "The project was delayed _____ unexpected hardware supply chain bottlenecks.",
                "options": ["due to", "because", "despite", "owing"], "correct": 0,
                "explanation": "'due to' acts as a preposition explaining the cause of the noun phrase 'bottlenecks'.",
                "patterns": ["General MNC", "Cognizant-style"]
            },

            # --- DATA INTERPRETATION ---
            {
                "code": "DI001", "section": "Data Interpretation", "topic": "Bar Charts", "difficulty": "Medium",
                "question": "A tech company's quarterly revenues (in ₹ Lakhs) are: Q1 = 120, Q2 = 150, Q3 = 180, Q4 = 210. What is the percentage increase in revenue from Q1 to Q4?",
                "options": ["50%", "75%", "85%", "100%"], "correct": 1,
                "explanation": "Increase = 210 - 120 = 90. Percentage increase = (90 / 120) * 100 = 75%.",
                "patterns": ["General MNC", "TCS-style", "Infosys-style"]
            },
            {
                "code": "DI002", "section": "Data Interpretation", "topic": "Pie Charts", "difficulty": "Medium",
                "question": "In a company budget pie chart, IT Infrastructure accounts for 72 degrees out of 360 degrees. What percentage of the total budget is allocated to IT Infrastructure?",
                "options": ["15%", "18%", "20%", "25%"], "correct": 2,
                "explanation": "Percentage = (72 / 360) * 100 = 1/5 * 100 = 20%.",
                "patterns": ["General MNC", "Cognizant-style", "Capgemini-style"]
            },
            {
                "code": "DI003", "section": "Data Interpretation", "topic": "Tables", "difficulty": "Hard",
                "question": "Table of Software Engineers hired across 3 years: Year 2023 = 40, Year 2024 = 50, Year 2025 = 60. What is the average number of hires per year?",
                "options": ["45", "50", "55", "60"], "correct": 1,
                "explanation": "Sum = 40 + 50 + 60 = 150. Average = 150 / 3 = 50.",
                "patterns": ["General MNC", "Accenture-style"]
            },
            {
                "code": "DI004", "section": "Data Interpretation", "topic": "Line Charts", "difficulty": "Medium",
                "question": "Line graph shows website visitors: Day 1 = 1,000, Day 2 = 1,400, Day 3 = 1,200, Day 4 = 1,800. What is the ratio of visitors on Day 2 to Day 4?",
                "options": ["7:9", "5:7", "4:5", "2:3"], "correct": 0,
                "explanation": "Ratio Day 2 : Day 4 = 1400 : 1800 = 14 : 18 = 7 : 9.",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "DI005", "section": "Data Interpretation", "topic": "Comparative Analysis", "difficulty": "Hard",
                "question": "Company A produced 500 units with 10% defects. Company B produced 800 units with 5% defects. Which company produced fewer defective units?",
                "options": ["Company A (50 defects)", "Company B (40 defects)", "Both equal", "Cannot be determined"], "correct": 1,
                "explanation": "Company A defects = 10% of 500 = 50. Company B defects = 5% of 800 = 40. Company B produced fewer defects (40).",
                "patterns": ["General MNC", "Persistent-style", "LTIMindtree-style"]
            },

            # --- ANALYTICAL REASONING ---
            {
                "code": "AR001", "section": "Analytical Reasoning", "topic": "Pattern Recognition", "difficulty": "Medium",
                "question": "If 3 # 4 = 25, 4 # 5 = 41, then what is 5 # 6?",
                "options": ["51", "61", "71", "81"], "correct": 1,
                "explanation": "Pattern: a # b = a^2 + b^2. 3^2 + 4^2 = 9 + 16 = 25. 4^2 + 5^2 = 16 + 25 = 41. 5^2 + 6^2 = 25 + 36 = 61.",
                "patterns": ["General MNC", "Infosys-style", "TCS-style"]
            },
            {
                "code": "AR002", "section": "Analytical Reasoning", "topic": "Data Sufficiency", "difficulty": "Hard",
                "question": "Is integer X even?\nStatement 1: X + 3 is an odd number.\nStatement 2: 2X is an even number.",
                "options": [
                    "Statement 1 alone is sufficient",
                    "Statement 2 alone is sufficient",
                    "Both statements together are needed",
                    "Neither statement is sufficient"
                ], "correct": 0,
                "explanation": "From St 1: Even + Odd = Odd => X must be even. St 1 alone is sufficient. St 2 is true for any integer X, so not sufficient.",
                "patterns": ["General MNC", "Cognizant-style"]
            },
            {
                "code": "AR003", "section": "Analytical Reasoning", "topic": "Pattern Recognition", "difficulty": "Easy",
                "question": "Complete the logic: 8 : 64 :: 11 : ?",
                "options": ["121", "132", "110", "144"], "correct": 0,
                "explanation": "8^2 = 64. Similarly 11^2 = 121.",
                "patterns": ["General MNC", "Wipro-style"]
            },
            {
                "code": "AR004", "section": "Analytical Reasoning", "topic": "Puzzles", "difficulty": "Hard",
                "question": "Four boxes P, Q, R, S of different weights. P is heavier than Q but lighter than R. S is heavier than R. Which box is the lightest?",
                "options": ["P", "Q", "R", "S"], "correct": 1,
                "explanation": "Order of weights from heaviest to lightest: S > R > P > Q. Lightest box is Q.",
                "patterns": ["General MNC", "Capgemini-style", "Accenture-style"]
            },
            {
                "code": "AR005", "section": "Analytical Reasoning", "topic": "Pattern Recognition", "difficulty": "Medium",
                "question": "If CLOCK is represented as 3-12-15-3-11, how is WATCH represented?",
                "options": ["23-1-20-3-8", "22-1-20-3-8", "23-2-20-4-9", "24-1-19-3-8"], "correct": 0,
                "explanation": "Letters replaced by positional numbers: W=23, A=1, T=20, C=3, H=8. Output = 23-1-20-3-8.",
                "patterns": ["General MNC", "Tech Mahindra-style", "Persistent-style"]
            }
        ]

        for item in raw_questions:
            db.add(AptitudeQuestion(
                question_code=item["code"],
                section=item["section"],
                topic=item["topic"],
                difficulty=item["difficulty"],
                question_text=item["question"],
                options_json=json.dumps(item["options"]),
                correct_option=item["correct"],
                explanation=item["explanation"],
                time_estimate_seconds=60,
                tags_json=json.dumps([item["section"], item["topic"], item["difficulty"]]),
                company_patterns_json=json.dumps(item["patterns"])
            ))
        db.commit()
        logger.info("Successfully seeded 35+ MNC-Style Aptitude Practice Questions.")

