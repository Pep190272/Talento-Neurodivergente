"""Plan domain entity — defines subscription tiers and their limits."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from shared.domain import BaseEntity


class PlanTarget(str, Enum):
    B2C = "b2c"
    B2B = "b2b"


class PlanTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    STARTER = "starter"
    PRO = "pro"
    PRO_PLUS = "pro_plus"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


@dataclass(frozen=True)
class Money:
    """Value object for monetary amounts."""

    amount: float
    currency: str = "EUR"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError(f"Money amount cannot be negative: {self.amount}")
        if len(self.currency) != 3:
            raise ValueError(f"Currency must be 3 chars ISO code: {self.currency}")


@dataclass(frozen=True)
class PlanLimits:
    """Value object for plan resource limits."""

    max_matches_per_month: int = 0
    max_job_posts: int = 0
    max_ai_reports: int = 0
    max_courses: int = 0
    max_users_per_license: int = 1

    def __post_init__(self) -> None:
        for attr in ("max_matches_per_month", "max_job_posts", "max_ai_reports",
                      "max_courses", "max_users_per_license"):
            val = getattr(self, attr)
            if val < 0:
                raise ValueError(f"{attr} cannot be negative: {val}")

    def allows(self, resource: str, current_usage: int) -> bool:
        """Check if current usage is within the plan limit for a resource.

        A limit of 0 means unlimited for paid plans (enforced at use case level).
        """
        limit = getattr(self, resource, None)
        if limit is None:
            raise ValueError(f"Unknown resource: {resource}")
        if limit == 0:
            return True  # 0 = unlimited
        return current_usage < limit


@dataclass(eq=False)
class Plan(BaseEntity):
    """
    Plan aggregate root — defines a subscription tier with pricing and limits.

    Invariants:
    - name and slug must not be empty
    - yearly price should be <= monthly * 12 (discount)
    - limits must be non-negative
    """

    name: str = ""
    slug: str = ""
    tier: PlanTier = PlanTier.FREE
    target: PlanTarget = PlanTarget.B2B

    price_monthly: Money = field(default_factory=lambda: Money(0.0))
    price_yearly: Money = field(default_factory=lambda: Money(0.0))

    limits: PlanLimits = field(default_factory=PlanLimits)
    features: list[str] = field(default_factory=list)

    is_active: bool = True

    @classmethod
    def create(
        cls,
        *,
        name: str,
        slug: str,
        tier: PlanTier,
        target: PlanTarget,
        price_monthly: float = 0.0,
        price_yearly: float = 0.0,
        currency: str = "EUR",
        limits: PlanLimits | None = None,
        features: list[str] | None = None,
    ) -> Plan:
        """Factory method to create a plan with validation."""
        if not name.strip():
            raise PlanValidationError("Plan name cannot be empty")
        if not slug.strip():
            raise PlanValidationError("Plan slug cannot be empty")

        return cls(
            name=name,
            slug=slug,
            tier=tier,
            target=target,
            price_monthly=Money(price_monthly, currency),
            price_yearly=Money(price_yearly, currency),
            limits=limits or PlanLimits(),
            features=features or [],
        )

    def is_free(self) -> bool:
        return self.price_monthly.amount == 0.0

    def deactivate(self) -> None:
        self.is_active = False
        self.touch()

    def activate(self) -> None:
        self.is_active = True
        self.touch()


class PlanValidationError(Exception):
    """Plan domain validation error."""


class PlanNotFoundError(Exception):
    """Plan does not exist."""
