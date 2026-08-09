from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.core.sandbox import PythonSandbox
from app.schemas.interview import CodingRunRequest, CodingRunResponse

router = APIRouter(prefix="/coding", tags=["Coding Interview Sandbox"])

@router.post("/run", response_model=CodingRunResponse)
def run_code_in_sandbox(
    request: CodingRunRequest,
    current_user: User = Depends(get_current_user)
):
    sandbox = PythonSandbox(timeout_seconds=3.0)
    result = sandbox.execute_code(code=request.code, test_cases=request.test_cases)
    
    return CodingRunResponse(
        stdout=result["stdout"],
        stderr=result["stderr"],
        exit_code=result["exit_code"],
        execution_time_ms=result["execution_time_ms"],
        passed_test_cases=result["passed_test_cases"],
        total_test_cases=result["total_test_cases"],
        error=result["error"]
    )
