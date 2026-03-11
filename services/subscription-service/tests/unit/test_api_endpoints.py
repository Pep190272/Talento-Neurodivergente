"""Integration tests for API endpoints — uses httpx TestClient with in-memory repos."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    """Fresh app client — repos are reset via dependency override."""
    from app.api import deps
    from app.infrastructure.persistence.in_memory import (
        InMemoryInvoiceRepository,
        InMemoryPlanRepository,
        InMemorySubscriptionRepository,
    )

    # Fresh repos for each test
    fresh_plan_repo = InMemoryPlanRepository()
    fresh_sub_repo = InMemorySubscriptionRepository()
    fresh_inv_repo = InMemoryInvoiceRepository()

    app.dependency_overrides[deps.get_plan_repo] = lambda: fresh_plan_repo
    app.dependency_overrides[deps.get_subscription_repo] = lambda: fresh_sub_repo
    app.dependency_overrides[deps.get_invoice_repo] = lambda: fresh_inv_repo

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


class TestHealthEndpoint:
    async def test_health_check(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "subscription-service"


class TestPlanEndpoints:
    async def test_create_plan(self, client):
        resp = await client.post(
            "/api/v1/subscriptions/plans",
            json={
                "name": "Starter",
                "slug": "starter-company",
                "tier": "starter",
                "target": "b2b",
                "price_monthly": 49.0,
                "price_yearly": 490.0,
                "max_matches_per_month": 15,
                "max_job_posts": 3,
                "max_ai_reports": 3,
                "features": ["basic_matches", "3_ai_reports"],
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Starter"
        assert data["slug"] == "starter-company"
        assert data["price_monthly"] == 49.0
        assert data["is_active"] is True

    async def test_create_duplicate_slug_409(self, client):
        plan_data = {"name": "Free", "slug": "free", "tier": "free", "target": "b2b"}
        await client.post("/api/v1/subscriptions/plans", json=plan_data)
        resp = await client.post("/api/v1/subscriptions/plans", json=plan_data)
        assert resp.status_code == 409

    async def test_list_plans_empty(self, client):
        resp = await client.get("/api/v1/subscriptions/plans")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_plans_after_create(self, client):
        await client.post(
            "/api/v1/subscriptions/plans",
            json={"name": "Free", "slug": "free", "tier": "free", "target": "b2b"},
        )
        await client.post(
            "/api/v1/subscriptions/plans",
            json={"name": "Pro", "slug": "pro", "tier": "pro", "target": "b2b", "price_monthly": 149.0},
        )
        resp = await client.get("/api/v1/subscriptions/plans")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestSubscriptionEndpoints:
    async def _create_plan(self, client, slug="free", price=0.0):
        await client.post(
            "/api/v1/subscriptions/plans",
            json={"name": slug.title(), "slug": slug, "tier": "free" if price == 0 else "pro", "target": "b2b", "price_monthly": price},
        )

    async def test_subscribe_to_plan(self, client):
        await self._create_plan(client, "free")
        resp = await client.post(
            "/api/v1/subscriptions/subscriptions",
            json={"subscriber_id": "company001", "subscriber_type": "company", "plan_slug": "free"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["subscriber_id"] == "company001"
        assert data["status"] == "active"  # free = active

    async def test_subscribe_nonexistent_plan_404(self, client):
        resp = await client.post(
            "/api/v1/subscriptions/subscriptions",
            json={"subscriber_id": "x", "subscriber_type": "company", "plan_slug": "nonexistent"},
        )
        assert resp.status_code == 404

    async def test_duplicate_subscription_409(self, client):
        await self._create_plan(client, "free")
        sub_data = {"subscriber_id": "dup001", "subscriber_type": "company", "plan_slug": "free"}
        await client.post("/api/v1/subscriptions/subscriptions", json=sub_data)
        resp = await client.post("/api/v1/subscriptions/subscriptions", json=sub_data)
        assert resp.status_code == 409

    async def test_get_subscription(self, client):
        await self._create_plan(client, "free")
        await client.post(
            "/api/v1/subscriptions/subscriptions",
            json={"subscriber_id": "get001", "subscriber_type": "company", "plan_slug": "free"},
        )
        resp = await client.get("/api/v1/subscriptions/subscriptions/get001")
        assert resp.status_code == 200
        assert resp.json()["subscriber_id"] == "get001"

    async def test_get_nonexistent_subscription_404(self, client):
        resp = await client.get("/api/v1/subscriptions/subscriptions/nobody")
        assert resp.status_code == 404

    async def test_cancel_subscription(self, client):
        await self._create_plan(client, "free")
        create_resp = await client.post(
            "/api/v1/subscriptions/subscriptions",
            json={"subscriber_id": "cancel001", "subscriber_type": "company", "plan_slug": "free"},
        )
        sub_id = create_resp.json()["id"]
        resp = await client.post(
            f"/api/v1/subscriptions/subscriptions/{sub_id}/cancel",
            json={"reason": "Testing"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "canceled"

    async def test_change_plan(self, client):
        await self._create_plan(client, "free")
        await self._create_plan(client, "pro", price=149.0)
        await client.post(
            "/api/v1/subscriptions/subscriptions",
            json={"subscriber_id": "change001", "subscriber_type": "company", "plan_slug": "free"},
        )
        resp = await client.post(
            "/api/v1/subscriptions/subscriptions/change001/change-plan",
            json={"new_plan_slug": "pro"},
        )
        assert resp.status_code == 200
        assert resp.json()["plan_name"] == "Pro"
