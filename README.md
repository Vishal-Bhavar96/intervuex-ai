# IntervueX - Adaptive AI Interview & Career Readiness Platform

> **Tagline:** *"Practice Smarter. Interview Better. Get Career Ready."*

IntervueX is a full-stack, enterprise-grade AI interview simulation and career readiness platform for students, job seekers, and freshers. It analyzes candidate profiles, uploaded resumes (PDF/DOCX), and target job descriptions to deliver dynamic adaptive interviews, compute multi-dimensional readiness scores, identify skill gaps, and generate personalized 4-week preparation roadmaps.

---

## Key Features

1. **Candidate Profile & Resume Parsing**:
   - Upload PDF or DOCX resumes.
   - Text extraction, structured profile parsing, and 6-category score breakdown (Technical, Projects, Experience, Education, Keywords, Completeness).

2. **Job Description Analysis & Resume Matching**:
   - Paste target job descriptions to extract required technologies and keywords.
   - Calculates Job Match Fit Score (%) alongside matched, partial, and missing skills.

3. **Adaptive AI Interview Engine**:
   - Dynamic non-chatbot questions grounded in resume context, job skills, and project defense details.
   - Real-time adaptive follow-up logic based on answer strength (deeper inquiry for strong answers, targeted clarification for partial answers, foundational checks for weak answers).

4. **Multi-Category Evaluation & Career Readiness**:
   - Live answer evaluation across Technical Accuracy, Relevance, Completeness, and Communication.
   - Career Readiness Score classification (Excellent, Interview Ready, Needs Minor Improvement, Needs Improvement, Needs Significant Preparation).

5. **Sandboxed Coding IDE & Optional Voice**:
   - Subprocess-isolated Python code execution sandbox with execution timeouts and memory limits.
   - Optional Web Speech API speech-to-text voice input integration with text fallback.

6. **Skill Gap Analysis & 4-Week Roadmap**:
   - Automatic identification of candidate weak areas.
   - Interactive 4-week preparation plan with task completion tracking.

7. **Admin Platform Dashboard & Audit Trail**:
   - Platform analytics, user account management, and real-time security audit logs.

---

## Technology Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, PyJWT, Passlib (bcrypt).
- **Frontend**: React 18, TypeScript, Vite, Vanilla Enterprise SaaS CSS, Lucide Icons.
- **Database**: PostgreSQL (Production) / SQLite (Zero-config Development).
- **AI Service**: Abstracted Provider Layer (Google Gemini / OpenAI / Smart Mock Engine).
- **Security & Sandbox**: Isolated Python Subprocess Execution Sandbox.
- **Deployment**: Docker & Docker Compose.

---

## Getting Started Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend development)

### 1. Backend Setup

```bash
cd backend
py -3 -m pip install -r requirements.txt
py -3 -m pytest tests/ -v
py -3 -m uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend UI will be running at `http://localhost:5173`.

---

## Running with Docker Compose

```bash
docker-compose up --build
```

---

## Testing

Run unit and integration tests:

```bash
cd backend
py -3 -m pytest tests/ -v
```

---

## License & Project Status

Enterprise Production-Style Final-Year Project. Fully functional end-to-end.
