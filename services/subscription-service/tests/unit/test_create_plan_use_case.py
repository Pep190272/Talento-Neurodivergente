"""Unit tests for UC-SUB-001: CreatePlan — TDD with mocked repository."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.dto.subscription_dto import CreatePlanDTO
from app.application.use_cases.create_plan import CreatePlanUseCase, DuplicatePlanSlugError
from app.domain.entities.plan import Plan, PlanTier, PlanTarget
from app.domain.repositories.i_plan_repository import IPlanRepository


@pytest.fixture
def mock_plan_repo() -> AsyncMock:
    repo = AsyncMock(spec=IPlanRepository)
    repo.find_by_slug.return_value = None
    repo.create.side_effect = lambda plan: plan
    return repo


@pytest.fixture
def use_case(mock_plan_repo) -> CreatePlanUseCase:
    return CreatePlanUseCase(plan_repo=mock_plan_repo)


class TestCreatePlanUseCase:
    async def test_create_free_plan(self, use_case, mock_plan_repo):
        dto = CreatePlanDTO(
            name="Free Company",
            slug="free-company",
            tier="free",
            target="b2b",
        )
        result = await use_case.execute(dto)

        assert result.name == "Free Company"
        assert result.slug == "free-company"
        assert result.tier == "free"
        assert result.target == "b2b"
        assert result.price_monthly == 0.0
        assert result.is_active is True
        mock_plan_repo.find_by_slug.assert_called_once_with("free-company")
        mock_plan_repo.create.assert_called_once()

    async def test_create_paid_plan_with_features(self, use_case):
        dto = CreatePlanDTO(
            name="Pro",
            slug="pro-company",
            tier="pro",
            target="b2b",
            price_monthly=149.0,
            price_yearly=1490.0,
            max_matches_per_month=0,
            max_job_posts=0,
            max_ai_reports=0,
            features=["unlimited_matches", "analytics", "team_fit_reports"],
        )
        result = await use_case.execute(dto)

        assert result.price_monthly == 149.0
        assert result.price_yearly == 1490.0
        assert len(result.features) == 3

    async def test_create_starter_plan_with_limits(self, use_case):
        dto = CreatePlanDTO(
            name="Starter",
            slug="starter-company",
            tier="starter",
            target="b2b",
            price_monthly=49.0,
            max_matches_per_month=15,
            max_job_posts=3,
            max_ai_reports=3,
        )
        result = await use_case.execute(dto)
        assert result.slug == "starter-company"

    async def test_duplicate_slug_raises(self, use_case, mock_plan_repo):
        existing = Plan.create(
            name="Existing", slug="taken", tier=PlanTier.FREE, target=PlanTarget.B2B,
        )
        mock_plan_repo.find_by_slug.return_value = existing

        dto = CreatePlanDTO(name="New", slug="taken", tier="free", target="b2b")
        with pytest.raises(DuplicatePlanSlugError, match="taken"):
            await use_case.execute(dto)

    async def test_create_b2c_plan(self, use_case):
        dto = CreatePlanDTO(
            name="Candidato Pro",
            slug="pro-candidate",
            tier="pro",
            target="b2c",
            price_monthly=9.99,
        )
        result = await use_case.execute(dto)
        assert result.target == "b2c"
