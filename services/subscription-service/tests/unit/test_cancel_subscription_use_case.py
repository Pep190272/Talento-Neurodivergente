"""Unit tests for UC-SUB-004: CancelSubscription — TDD."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.dto.subscription_dto import CancelSubscriptionDTO
from app.application.use_cases.cancel_subscription import CancelSubscriptionUseCase
from app.domain.entities.plan import Plan, PlanTarget, PlanTier
from app.domain.entities.subscription import (
    Subscription,
    SubscriberType,
    SubscriptionNotFoundError,
    SubscriptionStateError,
    SubscriptionStatus,
)
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


@pytest.fixture
def active_subscription() -> Subscription:
    plan = Plan.create(name="Free", slug="free", tier=PlanTier.FREE, target=PlanTarget.B2B)
    return Subscription.create(
        subscriber_id="company001",
        subscriber_type=SubscriberType.COMPANY,
        plan=plan,
    )


@pytest.fixture
def mock_sub_repo(active_subscription) -> AsyncMock:
    repo = AsyncMock(spec=ISubscriptionRepository)
    repo.find_by_id.return_value = active_subscription
    repo.update.side_effect = lambda sub: sub
    return repo


@pytest.fixture
def use_case(mock_sub_repo) -> CancelSubscriptionUseCase:
    return CancelSubscriptionUseCase(subscription_repo=mock_sub_repo)


class TestCancelSubscriptionUseCase:
    async def test_cancel_active_subscription(self, use_case):
        dto = CancelSubscriptionDTO(subscription_id="sub123", reason="Switching to competitor")
        result = await use_case.execute(dto)

        assert result.status == "canceled"

    async def test_cancel_with_reason(self, use_case):
        dto = CancelSubscriptionDTO(subscription_id="sub123", reason="Too expensive")
        result = await use_case.execute(dto)
        assert result.status == "canceled"

    async def test_subscription_not_found_raises(self, use_case, mock_sub_repo):
        mock_sub_repo.find_by_id.return_value = None

        dto = CancelSubscriptionDTO(subscription_id="nonexistent")
        with pytest.raises(SubscriptionNotFoundError, match="nonexistent"):
            await use_case.execute(dto)

    async def test_cancel_already_canceled_raises(self, use_case, active_subscription):
        active_subscription.cancel()  # cancel first time

        dto = CancelSubscriptionDTO(subscription_id="sub123")
        with pytest.raises(SubscriptionStateError, match="canceled"):
            await use_case.execute(dto)
