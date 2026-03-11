"""DTOs for the subscription bounded context."""

from __future__ import annotations

from dataclasses import dataclass, field


# ── Plan DTOs ──────────────────────────────────────────────────


@dataclass
class CreatePlanDTO:
    name: str = ""
    slug: str = ""
    tier: str = "free"
    target: str = "b2b"
    price_monthly: float = 0.0
    price_yearly: float = 0.0
    currency: str = "EUR"
    max_matches_per_month: int = 0
    max_job_posts: int = 0
    max_ai_reports: int = 0
    max_courses: int = 0
    max_users_per_license: int = 1
    features: list[str] = field(default_factory=list)


@dataclass
class PlanResponseDTO:
    id: str = ""
    name: str = ""
    slug: str = ""
    tier: str = ""
    target: str = ""
    price_monthly: float = 0.0
    price_yearly: float = 0.0
    currency: str = "EUR"
    features: list[str] = field(default_factory=list)
    is_active: bool = True

    @classmethod
    def from_entity(cls, plan) -> PlanResponseDTO:
        return cls(
            id=plan.id,
            name=plan.name,
            slug=plan.slug,
            tier=plan.tier.value,
            target=plan.target.value,
            price_monthly=plan.price_monthly.amount,
            price_yearly=plan.price_yearly.amount,
            currency=plan.price_monthly.currency,
            features=plan.features,
            is_active=plan.is_active,
        )


# ── Subscription DTOs ─────────────────────────────────────────


@dataclass
class SubscribeDTO:
    subscriber_id: str = ""
    subscriber_type: str = "company"
    plan_slug: str = ""
    billing_cycle: str = "monthly"


@dataclass
class SubscriptionResponseDTO:
    id: str = ""
    subscriber_id: str = ""
    subscriber_type: str = ""
    plan_id: str = ""
    plan_name: str = ""
    status: str = ""
    billing_cycle: str = ""
    current_period_end: str = ""
    is_early_adopter: bool = False

    @classmethod
    def from_entity(cls, sub, plan_name: str = "", is_early_adopter: bool = False) -> SubscriptionResponseDTO:
        return cls(
            id=sub.id,
            subscriber_id=sub.subscriber_id,
            subscriber_type=sub.subscriber_type.value,
            plan_id=sub.plan_id,
            plan_name=plan_name,
            status=sub.status.value,
            billing_cycle=sub.billing_cycle.value,
            current_period_end=sub.current_period_end.isoformat(),
            is_early_adopter=is_early_adopter,
        )


@dataclass
class CancelSubscriptionDTO:
    subscription_id: str = ""
    reason: str = ""


@dataclass
class ChangePlanDTO:
    subscriber_id: str = ""
    new_plan_slug: str = ""
