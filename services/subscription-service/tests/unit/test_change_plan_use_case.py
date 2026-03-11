"""Unit tests for UC-SUB-005: ChangePlan — TDD."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.dto.subscription_dto import ChangePlanDTO
from app.application.use_cases.change_plan import ChangePlanUseCase
from app.domain.entities.plan import Plan, PlanNotFoundError, PlanTarget, PlanTier
from app.domain.entities.subscription import (
    Subscription,
    SubscriberType,
    SubscriptionNotFoundError,
)
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


@pytest.fixture
def starter_plan() -> Plan:
    return Plan.create(
        name="Starter", slug="starter", tier=PlanTier.STARTER, target=PlanTarget.B2B,
        price_monthly=49.0,
    )


@pytest.fixture
def pro_plan() -> Plan:
    return Plan.create(
        name="Pro", slug="pro", tier=PlanTier.PRO, target=PlanTarget.B2B,
        price_monthly=149.0,
    )


@pytest.fixture
def active_subscription(starter_plan) -> Subscription:
    sub = Subscription.create(
        subscriber_id="company001",
        subscriber_type=SubscriberType.COMPANY,
        plan=starter_plan,
    )
    sub.activate()
    return sub


@pytest.fixture
def mock_plan_repo(pro_plan) -> AsyncMock:
    repo = AsyncMock(spec=IPlanRepository)
    repo.find_by_slug.return_value = pro_plan
    return repo


@pytest.fixture
def mock_sub_repo(active_subscription) -> AsyncMock:
    repo = AsyncMock(spec=ISubscriptionRepository)
    repo.find_active_by_subscriber.return_value = active_subscription
    repo.update.side_effect = lambda sub: sub
    return repo


@pytest.fixture
def use_case(mock_plan_repo, mock_sub_repo) -> ChangePlanUseCase:
    return ChangePlanUseCase(plan_repo=mock_plan_repo, subscription_repo=mock_sub_repo)


class TestChangePlanUseCase:
    async def test_upgrade_plan(self, use_case, pro_plan):
        dto = ChangePlanDTO(subscriber_id="company001", new_plan_slug="pro")
        result = await use_case.execute(dto)

        assert result.plan_id == pro_plan.id
        assert result.plan_name == "Pro"

    async def test_no_active_subscription_raises(self, use_case, mock_sub_repo):
        mock_sub_repo.find_active_by_subscriber.return_value = None

        dto = ChangePlanDTO(subscriber_id="nobody", new_plan_slug="pro")
        with pytest.raises(SubscriptionNotFoundError, match="nobody"):
            await use_case.execute(dto)

    async def test_new_plan_not_found_raises(self, use_case, mock_plan_repo):
        mock_plan_repo.find_by_slug.return_value = None

        dto = ChangePlanDTO(subscriber_id="company001", new_plan_slug="nonexistent")
        with pytest.raises(PlanNotFoundError, match="nonexistent"):
            await use_case.execute(dto)

    async def test_inactive_plan_raises(self, use_case, mock_plan_repo, pro_plan):
        pro_plan.deactivate()
        mock_plan_repo.find_by_slug.return_value = pro_plan

        dto = ChangePlanDTO(subscriber_id="company001", new_plan_slug="pro")
        with pytest.raises(PlanNotFoundError, match="inactive"):
            await use_case.execute(dto)
