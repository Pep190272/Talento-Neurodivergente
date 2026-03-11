"""UC-SUB-001: Create a subscription plan."""

from __future__ import annotations

from app.application.dto.subscription_dto import CreatePlanDTO, PlanResponseDTO
from app.domain.entities.plan import Plan, PlanLimits, PlanTarget, PlanTier
from app.domain.repositories.i_plan_repository import IPlanRepository


class CreatePlanUseCase:
    """
    Create a new subscription plan (admin operation).

    Flow:
    1. Validate slug uniqueness
    2. Create Plan entity with limits and pricing
    3. Persist plan
    4. Return plan DTO
    """

    def __init__(self, plan_repo: IPlanRepository) -> None:
        self._plan_repo = plan_repo

    async def execute(self, dto: CreatePlanDTO) -> PlanResponseDTO:
        # 1. Check slug uniqueness
        existing = await self._plan_repo.find_by_slug(dto.slug)
        if existing:
            raise DuplicatePlanSlugError(f"Plan with slug '{dto.slug}' already exists")

        # 2. Create plan entity
        limits = PlanLimits(
            max_matches_per_month=dto.max_matches_per_month,
            max_job_posts=dto.max_job_posts,
            max_ai_reports=dto.max_ai_reports,
            max_courses=dto.max_courses,
            max_users_per_license=dto.max_users_per_license,
        )
        plan = Plan.create(
            name=dto.name,
            slug=dto.slug,
            tier=PlanTier(dto.tier),
            target=PlanTarget(dto.target),
            price_monthly=dto.price_monthly,
            price_yearly=dto.price_yearly,
            currency=dto.currency,
            limits=limits,
            features=dto.features,
        )

        # 3. Persist
        plan = await self._plan_repo.create(plan)

        # 4. Return
        return PlanResponseDTO.from_entity(plan)


class DuplicatePlanSlugError(Exception):
    """Plan slug already exists."""
