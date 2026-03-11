"""UC-SUB-004: Cancel a subscription."""

from __future__ import annotations

from app.application.dto.subscription_dto import CancelSubscriptionDTO, SubscriptionResponseDTO
from app.domain.entities.subscription import SubscriptionNotFoundError
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


class CancelSubscriptionUseCase:
    """
    Cancel an active subscription.

    Flow:
    1. Find subscription by ID
    2. Cancel it (domain logic validates state)
    3. Persist
    4. Return updated subscription
    """

    def __init__(self, subscription_repo: ISubscriptionRepository) -> None:
        self._subscription_repo = subscription_repo

    async def execute(self, dto: CancelSubscriptionDTO) -> SubscriptionResponseDTO:
        # 1. Find
        subscription = await self._subscription_repo.find_by_id(dto.subscription_id)
        if not subscription:
            raise SubscriptionNotFoundError(
                f"Subscription '{dto.subscription_id}' not found"
            )

        # 2. Cancel (domain validates state)
        subscription.cancel(reason=dto.reason)

        # 3. Persist
        subscription = await self._subscription_repo.update(subscription)

        # 4. Return
        return SubscriptionResponseDTO.from_entity(subscription)
