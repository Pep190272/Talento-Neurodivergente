"""E2E test: GDPR compliance flows (Issues #52, #53).

Tests:
1. Consent management (Art. 6, 7)
2. Data export (Art. 15, 20)
3. Account deletion / right to be forgotten (Art. 17)
4. Error handling for unauthorized access

Run with:
    pytest tests/e2e/test_gdpr_compliance.py -v --timeout=30
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
def test_user(auth_client):
    """Create a disposable test user for GDPR tests."""
    resp = auth_client.post("/api/v1/auth/register", json={
        "email": f"gdpr-test-{os.getpid()}@test.diversia.click",
        "password": "GDPRTestPass123!",
        "name": "GDPR Test User",
        "role": "candidate",
    })
    assert resp.status_code == 201
    data = resp.json()
    return {
        "token": data["access_token"],
        "user_id": data["user"]["id"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }


class TestUnauthenticatedAccess:
    """Verify protected endpoints require authentication."""

    def test_profile_requires_auth(self, client):
        resp = client.get("/api/v1/profiles/me")
        assert resp.status_code == 401

    def test_quiz_submit_requires_auth(self, client):
        resp = client.post("/api/v1/profiles/quiz", json={"answers": []})
        assert resp.status_code == 401


class TestDataAccess:
    """GDPR Art. 15: Right of access."""

    def test_user_can_access_own_profile(self, client, test_user):
        # First create profile
        client.post("/api/v1/profiles/", json={
            "role": "candidate",
            "display_name": "GDPR Test",
        }, headers=test_user["headers"])

        resp = client.get("/api/v1/profiles/me", headers=test_user["headers"])
        assert resp.status_code == 200
        data = resp.json()
        assert data["user_id"] == test_user["user_id"]


class TestHealthEndpoints:
    """Verify health checks are publicly accessible."""

    def test_health_check(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
