"""UC-SUB-006: Get subscription details for a subscriber."""

from __future__ import annotations

from app.application.dto.subscription_dto import SubscriptionResponseDTO
from app.domain.entities.subscription import SubscriptionNotFoundError
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


class GetSubscriptionUseCase:
    """
    Get the current subscription for a subscriber.

    Flow:
    1. Find active subscription by subscriber ID
    2. Load plan name for display
    3. Return subscription DTO
    """

    def __init__(
        self,
        plan_repo: IPlanRepository,
        subscription_repo: ISubscriptionRepository,
    ) -> None:
        self._plan_repo = plan_repo
        self._subscription_repo = subscription_repo

    async def execute(self, subscriber_id: str) -> SubscriptionResponseDTO:
        # 1. Find active subscription
        subscription = await self._subscription_repo.find_active_by_subscriber(
            subscriber_id
        )
        if not subscription:
            raise SubscriptionNotFoundError(
                f"No active subscription for subscriber '{subscriber_id}'"
            )

        # 2. Load plan name
        plan_name = ""
        plan = await self._plan_repo.find_by_id(subscription.plan_id)
        if plan:
            plan_name = plan.name

        # 3. Return
        return SubscriptionResponseDTO.from_entity(subscription, plan_name=plan_name)
