# IntervueX Database Schema & Entity Relationships

The database schema is fully normalized and managed via SQLAlchemy ORM.

## Entity ER Diagram Summary

- `User` 1:1 `CandidateProfile`
- `User` 1:N `AuditLog`
- `CandidateProfile` 1:N `Resume`
- `Resume` 1:1 `ResumeAnalysis`
- `CandidateProfile` 1:N `JobDescription`
- `Resume` + `JobDescription` -> `JobMatchScore`
- `CandidateProfile` 1:N `Interview`
- `Interview` 1:N `InterviewQuestion`
- `InterviewQuestion` 1:1 `InterviewAnswer`
- `InterviewAnswer` 1:1 `AnswerEvaluation`
- `Interview` 1:1 `InterviewScore`
- `CandidateProfile` 1:N `SkillGap`
- `CandidateProfile` 1:N `PreparationPlan`
- `PreparationPlan` 1:N `PreparationTask`
