"""Unit tests for Plan entity — TDD Red → Green → Refactor."""

from __future__ import annotations

import pytest

from app.domain.entities.plan import (
    BillingCycle,
    Money,
    Plan,
    PlanLimits,
    PlanNotFoundError,
    PlanTarget,
    PlanTier,
    PlanValidationError,
)


class TestMoney:
    """Value object tests."""

    def test_create_valid_money(self):
        m = Money(49.0, "EUR")
        assert m.amount == 49.0
        assert m.currency == "EUR"

    def test_negative_amount_raises(self):
        with pytest.raises(ValueError, match="negative"):
            Money(-10.0, "EUR")

    def test_invalid_currency_raises(self):
        with pytest.raises(ValueError, match="3 chars"):
            Money(10.0, "EURO")

    def test_money_is_immutable(self):
        m = Money(10.0)
        with pytest.raises(AttributeError):
            m.amount = 20.0


class TestPlanLimits:
    def test_default_limits(self):
        limits = PlanLimits()
        assert limits.max_matches_per_month == 0
        assert limits.max_job_posts == 0
        assert limits.max_users_per_license == 1

    def test_negative_limit_raises(self):
        with pytest.raises(ValueError, match="negative"):
            PlanLimits(max_job_posts=-1)

    def test_allows_within_limit(self):
        limits = PlanLimits(max_job_posts=5)
        assert limits.allows("max_job_posts", 3) is True
        assert limits.allows("max_job_posts", 5) is False  # at limit

    def test_zero_means_unlimited(self):
        limits = PlanLimits(max_job_posts=0)
        assert limits.allows("max_job_posts", 999) is True

    def test_unknown_resource_raises(self):
        limits = PlanLimits()
        with pytest.raises(ValueError, match="Unknown resource"):
            limits.allows("nonexistent", 0)


class TestPlan:
    def test_create_free_plan(self):
        plan = Plan.create(
            name="Free",
            slug="free-company",
            tier=PlanTier.FREE,
            target=PlanTarget.B2B,
        )
        assert plan.name == "Free"
        assert plan.slug == "free-company"
        assert plan.tier == PlanTier.FREE
        assert plan.target == PlanTarget.B2B
        assert plan.is_free() is True
        assert plan.is_active is True
        assert plan.id  # auto-generated

    def test_create_paid_plan(self):
        plan = Plan.create(
            name="Pro",
            slug="pro-company",
            tier=PlanTier.PRO,
            target=PlanTarget.B2B,
            price_monthly=149.0,
            price_yearly=1490.0,
            limits=PlanLimits(max_matches_per_month=0, max_job_posts=0, max_ai_reports=0),
            features=["unlimited_matches", "analytics", "team_fit_reports"],
        )
        assert plan.is_free() is False
        assert plan.price_monthly.amount == 149.0
        assert plan.price_yearly.amount == 1490.0
        assert len(plan.features) == 3

    def test_create_b2c_plan(self):
        plan = Plan.create(
            name="Candidato Pro",
            slug="pro-candidate",
            tier=PlanTier.PRO,
            target=PlanTarget.B2C,
            price_monthly=9.99,
        )
        assert plan.target == PlanTarget.B2C
        assert plan.price_monthly.amount == 9.99

    def test_empty_name_raises(self):
        with pytest.raises(PlanValidationError, match="name"):
            Plan.create(name="", slug="test", tier=PlanTier.FREE, target=PlanTarget.B2B)

    def test_empty_slug_raises(self):
        with pytest.raises(PlanValidationError, match="slug"):
            Plan.create(name="Test", slug="", tier=PlanTier.FREE, target=PlanTarget.B2B)

    def test_deactivate_plan(self):
        plan = Plan.create(name="Old", slug="old", tier=PlanTier.FREE, target=PlanTarget.B2B)
        assert plan.is_active is True
        plan.deactivate()
        assert plan.is_active is False

    def test_activate_plan(self):
        plan = Plan.create(name="Old", slug="old", tier=PlanTier.FREE, target=PlanTarget.B2B)
        plan.deactivate()
        plan.activate()
        assert plan.is_active is True

    def test_plan_tiers_match_adr005(self):
        """Verify all tiers from ADR-005 are defined."""
        assert PlanTier.FREE.value == "free"
        assert PlanTier.STARTER.value == "starter"
        assert PlanTier.PRO.value == "pro"
        assert PlanTier.PRO_PLUS.value == "pro_plus"
        assert PlanTier.ENTERPRISE.value == "enterprise"

    def test_billing_cycle_on_success_exists(self):
        """ADR-006: ON_SUCCESS billing cycle for success-fee model."""
        assert BillingCycle.ON_SUCCESS.value == "on_success"
        assert BillingCycle.MONTHLY.value == "monthly"
        assert BillingCycle.YEARLY.value == "yearly"
