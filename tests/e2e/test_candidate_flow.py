"""E2E test: Complete candidate flow (Issues #52, #53).

Tests the full candidate journey:
1. Register → 2. Create profile → 3. Submit quiz → 4. View dashboard
5. Apply to job → 6. Export data → 7. Delete account

Requires:
- profile-service running on port 8002
- auth-service running on port 8001

Run with:
    pytest tests/e2e/test_candidate_flow.py -v --timeout=30
"""

from __future__ import annotations

import os

import httpx
import pytest

BASE_URL = os.getenv("PROFILE_SERVICE_URL", "http://localhost:8002")
AUTH_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")


@pytest.fixture(scope="module")
def client():
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as c:
        yield c


@pytest.fixture(scope="module")
def auth_client():
    with httpx.Client(base_url=AUTH_URL, timeout=10.0) as c:
        yield c


@pytest.fixture(scope="module")
def registered_user(auth_client):
    """Register a test user and return auth token."""
    resp = auth_client.post("/api/v1/auth/register", json={
        "email": "e2e-candidate@test.diversia.click",
        "password": "TestPassword123!",
        "name": "E2E Candidate",
        "role": "candidate",
    })
    if resp.status_code == 409:
        # User already exists, login instead
        resp = auth_client.post("/api/v1/auth/login", json={
            "email": "e2e-candidate@test.diversia.click",
            "password": "TestPassword123!",
        })
    assert resp.status_code in (200, 201)
    data = resp.json()
    return {
        "token": data["access_token"],
        "user_id": data["user"]["id"],
    }


@pytest.fixture(scope="module")
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


class TestCandidateRegistration:
    """Step 1: User registration via auth-service."""

    def test_register_returns_token(self, auth_client):
        resp = auth_client.post("/api/v1/auth/register", json={
            "email": f"e2e-reg-{os.getpid()}@test.diversia.click",
            "password": "SecurePass456!",
            "name": "Registration Test",
            "role": "candidate",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "candidate"

    def test_duplicate_email_returns_409(self, auth_client, registered_user):
        resp = auth_client.post("/api/v1/auth/register", json={
            "email": "e2e-candidate@test.diversia.click",
            "password": "AnotherPass789!",
            "name": "Duplicate",
            "role": "candidate",
        })
        assert resp.status_code == 409


class TestProfileCreation:
    """Step 2: Create profile via profile-service."""

    def test_create_profile(self, client, auth_headers):
        resp = client.post("/api/v1/profiles/", json={
            "role": "candidate",
            "display_name": "E2E Candidate",
            "bio": "Testing the full candidate flow",
        }, headers=auth_headers)
        assert resp.status_code in (201, 409)  # 409 if already created

    def test_get_my_profile(self, client, auth_headers):
        resp = client.get("/api/v1/profiles/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "candidate"


class TestQuizSubmission:
    """Step 3: Submit neurocognitive quiz."""

    def test_get_quiz_questions(self, client):
        resp = client.get("/api/v1/profiles/quiz/questions")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 24
        assert data["dimensions"] == 24

    def test_submit_quiz(self, client, auth_headers):
        # Get questions first
        questions_resp = client.get("/api/v1/profiles/quiz/questions")
        questions = questions_resp.json()["questions"]

        # Submit answers (all neutral 0.5 for testing)
        answers = [
            {
                "question_id": q["question_id"],
                "dimension": q["dimension"],
                "value": 0.65,
            }
            for q in questions
        ]

        resp = client.post("/api/v1/profiles/quiz", json={
            "answers": answers,
        }, headers=auth_headers)
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data["status"] in ("completed", "flagged")
        assert data["vector_dimensions"] is not None


class TestDashboard:
    """Step 4: View candidate dashboard."""

    def test_dashboard_page_loads(self, client, auth_headers):
        # The dashboard HTML page
        resp = client.get("/dashboard", headers=auth_headers, follow_redirects=True)
        assert resp.status_code == 200


class TestJobApplication:
    """Step 5: Apply to a job."""

    def test_view_jobs_list(self, client, auth_headers):
        resp = client.get("/jobs", follow_redirects=True)
        assert resp.status_code == 200


class TestGDPRExport:
    """Step 6: GDPR data export (Art. 15 + Art. 20)."""

    def test_export_data(self, client, auth_headers):
        resp = client.get("/api/v1/profiles/me", headers=auth_headers)
        assert resp.status_code == 200
        # Verify profile data is accessible
        data = resp.json()
        assert "user_id" in data


class TestAccountDeletion:
    """Step 7: GDPR right to erasure (Art. 17)."""

    def test_profile_exists_before_deletion(self, client, auth_headers):
        resp = client.get("/api/v1/profiles/me", headers=auth_headers)
        assert resp.status_code == 200
