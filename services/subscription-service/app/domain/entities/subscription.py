"""Subscription domain entity — links a subscriber to a plan."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum

from shared.domain import BaseEntity

from .plan import BillingCycle, Plan


class SubscriptionStatus(str, Enum):
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    EXPIRED = "expired"


class SubscriberType(str, Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"
    THERAPIST = "therapist"


def _period_end(start: datetime, cycle: BillingCycle) -> datetime:
    """Calculate period end based on billing cycle."""
    if cycle == BillingCycle.YEARLY:
        return start + timedelta(days=365)
    return start + timedelta(days=30)


@dataclass(eq=False)
class Subscription(BaseEntity):
    """
    Subscription aggregate root — binds a subscriber to a plan.

    Invariants:
    - A subscriber can only have one active subscription at a time
    - Cannot cancel an already canceled/expired subscription
    - Cannot activate a canceled subscription (must create new)
    - Period end must be after period start
    """

    subscriber_id: str = ""
    subscriber_type: SubscriberType = SubscriberType.COMPANY
    plan_id: str = ""

    status: SubscriptionStatus = SubscriptionStatus.TRIALING
    billing_cycle: BillingCycle = BillingCycle.MONTHLY

    current_period_start: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    current_period_end: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30)
    )

    # Stripe integration (empty until Stripe is configured)
    stripe_subscription_id: str | None = None
    stripe_customer_id: str | None = None

    # Cancellation
    canceled_at: datetime | None = None
    cancel_reason: str | None = None

    # Transient — loaded from repository, not persisted directly
    plan: Plan | None = field(default=None, repr=False)

    @classmethod
    def create(
        cls,
        *,
        subscriber_id: str,
        subscriber_type: SubscriberType,
        plan: Plan,
        billing_cycle: BillingCycle = BillingCycle.MONTHLY,
        is_early_adopter: bool = False,
    ) -> Subscription:
        """Factory: create a new subscription."""
        if not subscriber_id.strip():
            raise SubscriptionValidationError("subscriber_id cannot be empty")

        now = datetime.now(timezone.utc)
        period_end = _period_end(now, billing_cycle)

        # Early adopters get 6 months free trial
        status = SubscriptionStatus.TRIALING
        if is_early_adopter and not plan.is_free():
            period_end = now + timedelta(days=180)

        # Free plans are immediately active
        if plan.is_free():
            status = SubscriptionStatus.ACTIVE

        return cls(
            subscriber_id=subscriber_id,
            subscriber_type=subscriber_type,
            plan_id=plan.id,
            status=status,
            billing_cycle=billing_cycle,
            current_period_start=now,
            current_period_end=period_end,
            plan=plan,
        )

    def activate(self) -> None:
        """Activate subscription (e.g., after successful payment)."""
        if self.status == SubscriptionStatus.CANCELED:
            raise SubscriptionStateError("Cannot activate a canceled subscription")
        if self.status == SubscriptionStatus.EXPIRED:
            raise SubscriptionStateError("Cannot activate an expired subscription")
        self.status = SubscriptionStatus.ACTIVE
        self.touch()

    def cancel(self, reason: str = "") -> None:
        """Cancel subscription. Takes effect at end of current period."""
        if self.status in (SubscriptionStatus.CANCELED, SubscriptionStatus.EXPIRED):
            raise SubscriptionStateError(
                f"Cannot cancel a subscription with status: {self.status.value}"
            )
        self.status = SubscriptionStatus.CANCELED
        self.canceled_at = datetime.now(timezone.utc)
        self.cancel_reason = reason
        self.touch()

    def mark_past_due(self) -> None:
        """Mark as past due (payment failed)."""
        if self.status != SubscriptionStatus.ACTIVE:
            raise SubscriptionStateError("Only active subscriptions can be marked past due")
        self.status = SubscriptionStatus.PAST_DUE
        self.touch()

    def expire(self) -> None:
        """Expire the subscription."""
        self.status = SubscriptionStatus.EXPIRED
        self.touch()

    def renew(self) -> None:
        """Renew for the next billing period."""
        if self.status not in (SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE):
            raise SubscriptionStateError(
                f"Cannot renew a subscription with status: {self.status.value}"
            )
        now = datetime.now(timezone.utc)
        self.current_period_start = now
        self.current_period_end = _period_end(now, self.billing_cycle)
        self.status = SubscriptionStatus.ACTIVE
        self.touch()

    def is_active(self) -> bool:
        return self.status == SubscriptionStatus.ACTIVE

    def is_in_trial(self) -> bool:
        return self.status == SubscriptionStatus.TRIALING

    def has_expired_period(self) -> bool:
        return datetime.now(timezone.utc) > self.current_period_end


class SubscriptionValidationError(Exception):
    """Subscription domain validation error."""


class SubscriptionStateError(Exception):
    """Invalid subscription state transition."""


class SubscriptionNotFoundError(Exception):
    """Subscription does not exist."""


class DuplicateSubscriptionError(Exception):
    """Subscriber already has an active subscription."""
