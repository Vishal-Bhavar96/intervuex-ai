import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.core.sandbox import PythonSandbox

from sqlalchemy.pool import StaticPool

# Test DB Setup - In Memory SQLite with StaticPool to share connection across threads
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_auth_and_profile_flow():
    # 1. Register candidate
    reg_payload = {
        "email": "candidate@intervuex.com",
        "password": "Password123!",
        "full_name": "Jane Candidate",
        "role": "CANDIDATE"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get profile
    res_prof = client.get("/api/v1/profile", headers=headers)
    assert res_prof.status_code == 200
    assert res_prof.json()["user_id"] == data["user"]["id"]

    # 3. Update profile
    update_payload = {"phone": "+1 555 1234", "target_role": "Python Backend Engineer"}
    res_up = client.put("/api/v1/profile", json=update_payload, headers=headers)
    assert res_up.status_code == 200
    assert res_up.json()["target_role"] == "Python Backend Engineer"

def test_python_sandbox_security_and_execution():
    sandbox = PythonSandbox(timeout_seconds=2.0)

    # Valid execution
    res1 = sandbox.execute_code("def add(a, b):\n    return a + b\nprint(add(5, 7))")
    assert res1["exit_code"] == 0
    assert "12" in res1["stdout"]

    # Restricted keyword execution
    res2 = sandbox.execute_code("import os\nos.listdir('.')")
    assert res2["exit_code"] == 1
    assert "Security Error" in res2["stderr"]

def test_interview_flow():
    # Register
    reg_payload = {
        "email": "interview_tester@intervuex.com",
        "password": "Password123!",
        "full_name": "Interview Tester"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create interview
    create_payload = {
        "type": "TECHNICAL",
        "difficulty": "MEDIUM",
        "total_questions": 3,
        "instant_feedback_enabled": True
    }
    res_int = client.post("/api/v1/interview/create", json=create_payload, headers=headers)
    assert res_int.status_code == 200
    interview_data = res_int.json()
    assert interview_data["status"] == "IN_PROGRESS"
    assert len(interview_data["questions"]) == 1

    first_q_id = interview_data["questions"][0]["id"]

    # Submit answer
    ans_payload = {
        "question_id": first_q_id,
        "answer_text": "Python uses reference counting and a generational garbage collector to automatically reclaim unreferenced object memory.",
        "time_taken_seconds": 25
    }
    res_ans = client.post(f"/api/v1/interview/{interview_data['id']}/answer", json=ans_payload, headers=headers)
    assert res_ans.status_code == 200
    eval_data = res_ans.json()
    assert eval_data["overall_score"] > 0.0

def test_aptitude_assessment_flow():
    # 1. Register candidate
    reg_payload = {
        "email": "aptitude_candidate@intervuex.com",
        "password": "Password123!",
        "full_name": "Aptitude Tester"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Seed demo questions in in-memory test DB
    from app.core.seed import seed_demo_data
    db = TestingSessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()

    # 2. Start Aptitude Test
    start_payload = {
        "company_pattern": "TCS-style",
        "difficulty_mode": "Mixed",
        "total_questions": 40,
        "duration_minutes": 45
    }
    res_start = client.post("/api/v1/aptitude/tests/start", json=start_payload, headers=headers)
    assert res_start.status_code == 200
    attempt_data = res_start.json()
    attempt_id = attempt_data["attempt_id"]
    assert attempt_data["status"] == "IN_PROGRESS"
    assert len(attempt_data["questions"]) > 0

    first_q = attempt_data["questions"][0]

    # 3. Save Candidate Answer
    ans_payload = {
        "question_id": first_q["id"],
        "selected_option": 1,
        "is_marked_for_review": False,
        "time_spent_seconds": 30
    }
    res_save = client.post(f"/api/v1/aptitude/attempts/{attempt_id}/answer", json=ans_payload, headers=headers)
    assert res_save.status_code == 200
    assert res_save.json()["status"] == "success"

    # 4. Record Monitoring Event
    evt_payload = {
        "attempt_id": attempt_id,
        "event_type": "TAB_SWITCH",
        "metadata": {"reason": "User switched window"}
    }
    res_evt = client.post("/api/v1/aptitude/monitoring-event", json=evt_payload, headers=headers)
    assert res_evt.status_code == 200
    assert res_evt.json()["status"] == "recorded"

    # 5. Submit Assessment
    res_sub = client.post(f"/api/v1/aptitude/attempts/{attempt_id}/submit", json={"answers": []}, headers=headers)
    assert res_sub.status_code == 200
    result_data = res_sub.json()
    assert result_data["status"] == "SUBMITTED"
    assert result_data["total_score"] >= 0.0
    assert len(result_data["section_performances"]) > 0

    # 6. Get History
    res_hist = client.get("/api/v1/aptitude/history", headers=headers)
    assert res_hist.status_code == 200
    assert len(res_hist.json()) == 1

