"""E2E test: Therapist flow (Issues #52, #53).

Tests:
1. Register as therapist → 2. Create professional profile
3. View dashboard → 4. Verification status

Run with:
    pytest tests/e2e/test_therapist_flow.py -v --timeout=30
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
def registered_therapist(auth_client):
    """Register a test therapist."""
    resp = auth_client.post("/api/v1/auth/register", json={
        "email": "e2e-therapist@test.diversia.click",
        "password": "TherapistPass123!",
        "name": "Dr. E2E Test",
        "role": "therapist",
    })
    if resp.status_code == 409:
        resp = auth_client.post("/api/v1/auth/login", json={
            "email": "e2e-therapist@test.diversia.click",
            "password": "TherapistPass123!",
        })
    assert resp.status_code in (200, 201)
    data = resp.json()
    return {
        "token": data["access_token"],
        "user_id": data["user"]["id"],
    }


@pytest.fixture(scope="module")
def auth_headers(registered_therapist):
    return {"Authorization": f"Bearer {registered_therapist['token']}"}


class TestTherapistRegistration:
    def test_register_as_therapist(self, auth_client):
        resp = auth_client.post("/api/v1/auth/register", json={
            "email": f"e2e-therapist-{os.getpid()}@test.diversia.click",
            "password": "SecureTherapist456!",
            "name": "Dr. Registration Test",
            "role": "therapist",
        })
        assert resp.status_code == 201
        assert resp.json()["user"]["role"] == "therapist"


class TestTherapistProfile:
    def test_create_therapist_profile(self, client, auth_headers):
        resp = client.post("/api/v1/profiles/therapist", json={
            "specialty": "ADHD and Autism Spectrum",
            "bio": "10 years of experience in neurodiversity support",
            "support_areas": ["adhd", "autism", "dyslexia"],
            "license_number": "PSY-E2E-12345",
        }, headers=auth_headers)
        assert resp.status_code in (201, 409)

    def test_profile_pending_verification(self, client, auth_headers):
        resp = client.post("/api/v1/profiles/therapist", json={
            "specialty": "ADHD",
            "bio": "Test",
            "support_areas": ["adhd"],
        }, headers=auth_headers)
        if resp.status_code == 201:
            assert resp.json()["verification_status"] == "pending"


class TestTherapistDashboard:
    def test_dashboard_loads(self, client, auth_headers):
        resp = client.get("/dashboard", headers=auth_headers, follow_redirects=True)
        assert resp.status_code == 200
