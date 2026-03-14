"""UC-SUB-003: Subscribe a user/company to a plan."""

from __future__ import annotations

from app.application.dto.subscription_dto import SubscribeDTO, SubscriptionResponseDTO
from app.domain.entities.plan import PlanNotFoundError
from app.domain.entities.subscription import (
    BillingCycle,
    DuplicateSubscriptionError,
    Subscription,
    SubscriberType,
)
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository

# DEPRECATED (ADR-006): Legacy SaaS model constants — kept for backwards compatibility.
# Unified to 25/25 to match auth-service (was 20/50). Will be removed in v3.0.
EARLY_ADOPTER_COMPANY_LIMIT = 25
EARLY_ADOPTER_THERAPIST_LIMIT = 25


class SubscribeUseCase:
    """
    Subscribe a user or company to a plan.

    Flow:
    1. Validate plan exists and is active
    2. Check no active subscription exists for subscriber
    3. Determine if early adopter (first N subscribers)
    4. Create Subscription entity
    5. Persist
    6. Return subscription DTO

    Business rules (ADR-005):
    - First 20 companies get PRO free for 6 months
    - First 50 therapists get PROFESIONAL free for 6 months
    - Candidates always free (plan base)
    """

    def __init__(
        self,
        plan_repo: IPlanRepository,
        subscription_repo: ISubscriptionRepository,
    ) -> None:
        self._plan_repo = plan_repo
        self._subscription_repo = subscription_repo

    async def execute(self, dto: SubscribeDTO) -> SubscriptionResponseDTO:
        # 1. Find plan
        plan = await self._plan_repo.find_by_slug(dto.plan_slug)
        if not plan or not plan.is_active:
            raise PlanNotFoundError(f"Plan '{dto.plan_slug}' not found or inactive")

        # 2. Check for existing active subscription
        existing = await self._subscription_repo.find_active_by_subscriber(dto.subscriber_id)
        if existing:
            raise DuplicateSubscriptionError(
                f"Subscriber '{dto.subscriber_id}' already has an active subscription"
            )

        # 3. Determine early adopter status
        subscriber_type = SubscriberType(dto.subscriber_type)
        is_early_adopter = await self._check_early_adopter(subscriber_type, plan.id)

        # 4. Create subscription
        subscription = Subscription.create(
            subscriber_id=dto.subscriber_id,
            subscriber_type=subscriber_type,
            plan=plan,
            billing_cycle=BillingCycle(dto.billing_cycle),
            is_early_adopter=is_early_adopter,
        )

        # 5. Persist
        subscription = await self._subscription_repo.create(subscription)

        # 6. Return
        return SubscriptionResponseDTO.from_entity(
            subscription,
            plan_name=plan.name,
            is_early_adopter=is_early_adopter,
        )

    async def _check_early_adopter(self, subscriber_type: SubscriberType, plan_id: str) -> bool:
        """Check if subscriber qualifies as early adopter."""
        count = await self._subscription_repo.count_by_plan(plan_id)

        if subscriber_type == SubscriberType.COMPANY:
            return count < EARLY_ADOPTER_COMPANY_LIMIT
        if subscriber_type == SubscriberType.THERAPIST:
            return count < EARLY_ADOPTER_THERAPIST_LIMIT

        return False  # Candidates don't have early adopter concept (always free)
