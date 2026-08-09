# IntervueX REST API Documentation

All API endpoints reside under `/api/v1`. OpenAPI specification is generated dynamically at `/docs`.

## Endpoint Reference

### Authentication
- `POST /api/v1/auth/register`: Register new candidate or admin account
- `POST /api/v1/auth/login`: Authenticate and receive JWT access/refresh tokens
- `GET /api/v1/auth/me`: Retrieve current authenticated user details

### Candidate Profile
- `GET /api/v1/profile`: Retrieve candidate profile, educations, skills, and projects
- `PUT /api/v1/profile`: Update contact details, target role, and experience level
- `POST /api/v1/profile/skill`: Add new technical skill
- `POST /api/v1/profile/project`: Add new software development project

### Resume Processing
- `POST /api/v1/resume/upload`: Upload PDF or DOCX file for text extraction and scoring
- `GET /api/v1/resume/latest`: Get detailed resume score breakdown across 6 metrics

### Job Matching
- `POST /api/v1/job/analyze`: Extract required skills and keywords from raw job description
- `POST /api/v1/job/{job_id}/match`: Compare uploaded resume vs job description to calculate fit %

### Adaptive AI Interview
- `POST /api/v1/interview/create`: Initialize new interview session
- `GET /api/v1/interview/{id}`: Fetch interview status and questions
- `POST /api/v1/interview/{id}/answer`: Submit candidate response for real-time evaluation

### Sandboxed Coding IDE
- `POST /api/v1/coding/run`: Execute Python code in isolated process sandbox with time limits

### Analytics & Admin
- `GET /api/v1/analytics/dashboard`: Retrieve candidate dashboard metrics
- `GET /api/v1/analytics/admin`: Retrieve global platform statistics
- `GET /api/v1/admin/users`: List all users and toggle account status
- `GET /api/v1/admin/audit-logs`: View system activity audit trail
