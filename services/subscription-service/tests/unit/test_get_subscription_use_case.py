"""Unit tests for UC-SUB-006: GetSubscription — TDD."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.get_subscription import GetSubscriptionUseCase
from app.domain.entities.plan import Plan, PlanTarget, PlanTier
from app.domain.entities.subscription import (
    Subscription,
    SubscriberType,
    SubscriptionNotFoundError,
)
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


@pytest.fixture
def pro_plan() -> Plan:
    return Plan.create(
        name="Pro", slug="pro", tier=PlanTier.PRO, target=PlanTarget.B2B,
        price_monthly=149.0,
    )


@pytest.fixture
def active_subscription(pro_plan) -> Subscription:
    return Subscription.create(
        subscriber_id="company001",
        subscriber_type=SubscriberType.COMPANY,
        plan=pro_plan,
    )


@pytest.fixture
def mock_plan_repo(pro_plan) -> AsyncMock:
    repo = AsyncMock(spec=IPlanRepository)
    repo.find_by_id.return_value = pro_plan
    return repo


@pytest.fixture
def mock_sub_repo(active_subscription) -> AsyncMock:
    repo = AsyncMock(spec=ISubscriptionRepository)
    repo.find_active_by_subscriber.return_value = active_subscription
    return repo


@pytest.fixture
def use_case(mock_plan_repo, mock_sub_repo) -> GetSubscriptionUseCase:
    return GetSubscriptionUseCase(plan_repo=mock_plan_repo, subscription_repo=mock_sub_repo)


class TestGetSubscriptionUseCase:
    async def test_get_existing_subscription(self, use_case):
        result = await use_case.execute("company001")

        assert result.subscriber_id == "company001"
        assert result.plan_name == "Pro"
        assert result.status == "trialing"

    async def test_no_subscription_raises(self, use_case, mock_sub_repo):
        mock_sub_repo.find_active_by_subscriber.return_value = None

        with pytest.raises(SubscriptionNotFoundError, match="nobody"):
            await use_case.execute("nobody")

    async def test_includes_plan_name(self, use_case):
        result = await use_case.execute("company001")
        assert result.plan_name == "Pro"
