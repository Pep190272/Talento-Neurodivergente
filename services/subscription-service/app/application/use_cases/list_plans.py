"""UC-SUB-002: List available subscription plans."""

from __future__ import annotations

from app.application.dto.subscription_dto import PlanResponseDTO
from app.domain.entities.plan import PlanTarget
from app.domain.repositories.i_plan_repository import IPlanRepository


class ListPlansUseCase:
    """
    List all active subscription plans, optionally filtered by target (b2b/b2c).

    Flow:
    1. Query active plans from repository
    2. Map to response DTOs
    """

    def __init__(self, plan_repo: IPlanRepository) -> None:
        self._plan_repo = plan_repo

    async def execute(self, target: str | None = None) -> list[PlanResponseDTO]:
        plan_target = PlanTarget(target) if target else None
        plans = await self._plan_repo.list_active(plan_target)
        return [PlanResponseDTO.from_entity(p) for p in plans]
