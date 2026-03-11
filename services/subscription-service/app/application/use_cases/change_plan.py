"""UC-SUB-005: Change subscription plan (upgrade/downgrade)."""

from __future__ import annotations

from app.application.dto.subscription_dto import ChangePlanDTO, SubscriptionResponseDTO
from app.domain.entities.plan import PlanNotFoundError
from app.domain.entities.subscription import SubscriptionNotFoundError
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


class ChangePlanUseCase:
    """
    Change the plan of an active subscription.

    Flow:
    1. Find active subscription for subscriber
    2. Find new plan by slug
    3. Update plan reference
    4. Persist
    5. Return updated subscription
    """

    def __init__(
        self,
        plan_repo: IPlanRepository,
        subscription_repo: ISubscriptionRepository,
    ) -> None:
        self._plan_repo = plan_repo
        self._subscription_repo = subscription_repo

    async def execute(self, dto: ChangePlanDTO) -> SubscriptionResponseDTO:
        # 1. Find active subscription
        subscription = await self._subscription_repo.find_active_by_subscriber(
            dto.subscriber_id
        )
        if not subscription:
            raise SubscriptionNotFoundError(
                f"No active subscription for subscriber '{dto.subscriber_id}'"
            )

        # 2. Find new plan
        new_plan = await self._plan_repo.find_by_slug(dto.new_plan_slug)
        if not new_plan or not new_plan.is_active:
            raise PlanNotFoundError(
                f"Plan '{dto.new_plan_slug}' not found or inactive"
            )

        # 3. Update plan
        subscription.plan_id = new_plan.id
        subscription.plan = new_plan
        subscription.touch()

        # 4. Persist
        subscription = await self._subscription_repo.update(subscription)

        # 5. Return
        return SubscriptionResponseDTO.from_entity(subscription, plan_name=new_plan.name)
