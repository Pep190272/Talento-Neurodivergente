"""Unit tests for UC-SUB-003: Subscribe — TDD."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.dto.subscription_dto import SubscribeDTO
from app.application.use_cases.subscribe import (
    EARLY_ADOPTER_COMPANY_LIMIT,
    EARLY_ADOPTER_THERAPIST_LIMIT,
    SubscribeUseCase,
)
from app.domain.entities.plan import Plan, PlanNotFoundError, PlanTarget, PlanTier
from app.domain.entities.subscription import DuplicateSubscriptionError, SubscriptionStatus
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


@pytest.fixture
def free_plan() -> Plan:
    return Plan.create(name="Free", slug="free-company", tier=PlanTier.FREE, target=PlanTarget.B2B)


@pytest.fixture
def pro_plan() -> Plan:
    return Plan.create(
        name="Pro", slug="pro-company", tier=PlanTier.PRO, target=PlanTarget.B2B,
        price_monthly=149.0,
    )


@pytest.fixture
def mock_plan_repo(free_plan) -> AsyncMock:
    repo = AsyncMock(spec=IPlanRepository)
    repo.find_by_slug.return_value = free_plan
    return repo


@pytest.fixture
def mock_sub_repo() -> AsyncMock:
    repo = AsyncMock(spec=ISubscriptionRepository)
    repo.find_active_by_subscriber.return_value = None
    repo.create.side_effect = lambda sub: sub
    repo.count_by_plan.return_value = 0  # first subscriber = early adopter
    return repo


@pytest.fixture
def use_case(mock_plan_repo, mock_sub_repo) -> SubscribeUseCase:
    return SubscribeUseCase(plan_repo=mock_plan_repo, subscription_repo=mock_sub_repo)


class TestSubscribeUseCase:
    async def test_subscribe_to_free_plan(self, use_case):
        dto = SubscribeDTO(
            subscriber_id="company001",
            subscriber_type="company",
            plan_slug="free-company",
        )
        result = await use_case.execute(dto)

        assert result.subscriber_id == "company001"
        assert result.status == "active"  # free = active immediately

    async def test_subscribe_to_paid_plan_trialing(self, use_case, mock_plan_repo, pro_plan):
        mock_plan_repo.find_by_slug.return_value = pro_plan

        dto = SubscribeDTO(
            subscriber_id="company002",
            subscriber_type="company",
            plan_slug="pro-company",
        )
        result = await use_case.execute(dto)
        assert result.status == "trialing"

    async def test_early_adopter_company(self, use_case, mock_plan_repo, mock_sub_repo, pro_plan):
        mock_plan_repo.find_by_slug.return_value = pro_plan
        mock_sub_repo.count_by_plan.return_value = 5  # within 20 limit

        dto = SubscribeDTO(
            subscriber_id="early_company",
            subscriber_type="company",
            plan_slug="pro-company",
        )
        result = await use_case.execute(dto)
        assert result.is_early_adopter is True

    async def test_not_early_adopter_after_limit(self, use_case, mock_plan_repo, mock_sub_repo, pro_plan):
        mock_plan_repo.find_by_slug.return_value = pro_plan
        mock_sub_repo.count_by_plan.return_value = EARLY_ADOPTER_COMPANY_LIMIT  # at limit

        dto = SubscribeDTO(
            subscriber_id="late_company",
            subscriber_type="company",
            plan_slug="pro-company",
        )
        result = await use_case.execute(dto)
        assert result.is_early_adopter is False

    async def test_early_adopter_therapist(self, use_case, mock_plan_repo, mock_sub_repo, pro_plan):
        mock_plan_repo.find_by_slug.return_value = pro_plan
        mock_sub_repo.count_by_plan.return_value = 10  # within 25 limit (unified ADR-006)

        dto = SubscribeDTO(
            subscriber_id="therapist001",
            subscriber_type="therapist",
            plan_slug="pro-company",
        )
        result = await use_case.execute(dto)
        assert result.is_early_adopter is True

    async def test_candidate_never_early_adopter(self, use_case):
        dto = SubscribeDTO(
            subscriber_id="candidate001",
            subscriber_type="individual",
            plan_slug="free-company",
        )
        result = await use_case.execute(dto)
        assert result.is_early_adopter is False

    async def test_plan_not_found_raises(self, use_case, mock_plan_repo):
        mock_plan_repo.find_by_slug.return_value = None

        dto = SubscribeDTO(subscriber_id="x", subscriber_type="company", plan_slug="nonexistent")
        with pytest.raises(PlanNotFoundError, match="nonexistent"):
            await use_case.execute(dto)

    async def test_duplicate_subscription_raises(self, use_case, mock_sub_repo):
        from app.domain.entities.subscription import Subscription
        mock_sub_repo.find_active_by_subscriber.return_value = AsyncMock()  # existing sub

        dto = SubscribeDTO(
            subscriber_id="company001",
            subscriber_type="company",
            plan_slug="free-company",
        )
        with pytest.raises(DuplicateSubscriptionError, match="already has"):
            await use_case.execute(dto)

    async def test_yearly_billing_cycle(self, use_case, mock_plan_repo, pro_plan):
        mock_plan_repo.find_by_slug.return_value = pro_plan

        dto = SubscribeDTO(
            subscriber_id="yearly001",
            subscriber_type="company",
            plan_slug="pro-company",
            billing_cycle="yearly",
        )
        result = await use_case.execute(dto)
        assert result.billing_cycle == "yearly"

    async def test_on_success_billing_cycle(self, use_case, mock_plan_repo, pro_plan):
        """ADR-006: Subscribe with on_success billing cycle."""
        mock_plan_repo.find_by_slug.return_value = pro_plan

        dto = SubscribeDTO(
            subscriber_id="success001",
            subscriber_type="company",
            plan_slug="pro-company",
            billing_cycle="on_success",
        )
        result = await use_case.execute(dto)
        assert result.billing_cycle == "on_success"
