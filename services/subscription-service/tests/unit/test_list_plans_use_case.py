"""Unit tests for UC-SUB-002: ListPlans — TDD."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.list_plans import ListPlansUseCase
from app.domain.entities.plan import Plan, PlanTarget, PlanTier
from app.domain.repositories.i_plan_repository import IPlanRepository


@pytest.fixture
def sample_plans() -> list[Plan]:
    return [
        Plan.create(name="Free", slug="free-company", tier=PlanTier.FREE, target=PlanTarget.B2B),
        Plan.create(name="Starter", slug="starter", tier=PlanTier.STARTER, target=PlanTarget.B2B, price_monthly=49.0),
        Plan.create(name="Pro", slug="pro", tier=PlanTier.PRO, target=PlanTarget.B2B, price_monthly=149.0),
        Plan.create(name="Candidato Pro", slug="pro-candidate", tier=PlanTier.PRO, target=PlanTarget.B2C, price_monthly=9.99),
    ]


@pytest.fixture
def mock_plan_repo(sample_plans) -> AsyncMock:
    repo = AsyncMock(spec=IPlanRepository)
    repo.list_active.return_value = sample_plans
    return repo


@pytest.fixture
def use_case(mock_plan_repo) -> ListPlansUseCase:
    return ListPlansUseCase(plan_repo=mock_plan_repo)


class TestListPlansUseCase:
    async def test_list_all_plans(self, use_case):
        result = await use_case.execute()
        assert len(result) == 4

    async def test_list_b2b_plans(self, use_case, mock_plan_repo):
        b2b_plans = [p for p in mock_plan_repo.list_active.return_value if p.target == PlanTarget.B2B]
        mock_plan_repo.list_active.return_value = b2b_plans

        result = await use_case.execute(target="b2b")
        assert all(p.target == "b2b" for p in result)

    async def test_list_b2c_plans(self, use_case, mock_plan_repo):
        b2c_plans = [p for p in mock_plan_repo.list_active.return_value if p.target == PlanTarget.B2C]
        mock_plan_repo.list_active.return_value = b2c_plans

        result = await use_case.execute(target="b2c")
        assert all(p.target == "b2c" for p in result)

    async def test_empty_list(self, use_case, mock_plan_repo):
        mock_plan_repo.list_active.return_value = []
        result = await use_case.execute()
        assert result == []
