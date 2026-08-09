# IntervueX AI Service Architecture & Anti-Hallucination Controls

## Provider Abstraction

IntervueX utilizes the Strategy Pattern for AI integrations (`AIServiceInterface`), decoupling the backend from specific vendor APIs.

```python
class AIServiceInterface(ABC):
    @abstractmethod
    async def extract_resume_info(self, raw_text: str) -> Dict[str, Any]: ...
    @abstractmethod
    async def analyze_job_description(self, raw_text: str) -> Dict[str, Any]: ...
    @abstractmethod
    async def generate_interview_question(...) -> Dict[str, Any]: ...
    @abstractmethod
    async def evaluate_answer(...) -> Dict[str, Any]: ...
    @abstractmethod
    async def generate_follow_up_question(...) -> Dict[str, Any]: ...
```

## Anti-Hallucination Safeguards

1. **Context Grounding**: AI prompts explicitly bind question generation to verified fields extracted from the candidate's resume, candidate profile, target job description, or previous answers.
2. **Schema Enforcement**: All AI responses must return structured JSON matching validated Pydantic schemas.
3. **Smart Local Mock Engine**: Provides high-fidelity offline execution fallback without throwing raw runtime exceptions when API keys are absent.
