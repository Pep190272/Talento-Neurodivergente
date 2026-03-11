"""Unit tests for Subscription entity — TDD."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.domain.entities.plan import BillingCycle, Plan, PlanLimits, PlanTarget, PlanTier
from app.domain.entities.subscription import (
    DuplicateSubscriptionError,
    Subscription,
    SubscriberType,
    SubscriptionStateError,
    SubscriptionStatus,
    SubscriptionValidationError,
)


@pytest.fixture
def free_plan() -> Plan:
    return Plan.create(
        name="Free", slug="free-company", tier=PlanTier.FREE, target=PlanTarget.B2B,
    )


@pytest.fixture
def pro_plan() -> Plan:
    return Plan.create(
        name="Pro", slug="pro-company", tier=PlanTier.PRO, target=PlanTarget.B2B,
        price_monthly=149.0, price_yearly=1490.0,
    )


class TestSubscriptionCreate:
    def test_create_free_subscription_is_active(self, free_plan):
        sub = Subscription.create(
            subscriber_id="company123",
            subscriber_type=SubscriberType.COMPANY,
            plan=free_plan,
        )
        assert sub.subscriber_id == "company123"
        assert sub.status == SubscriptionStatus.ACTIVE  # free = active immediately
        assert sub.plan_id == free_plan.id
        assert sub.billing_cycle == BillingCycle.MONTHLY

    def test_create_paid_subscription_is_trialing(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="company456",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        assert sub.status == SubscriptionStatus.TRIALING

    def test_early_adopter_gets_6_months_trial(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="early001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
            is_early_adopter=True,
        )
        assert sub.status == SubscriptionStatus.TRIALING
        # 6 months ≈ 180 days
        days_diff = (sub.current_period_end - sub.current_period_start).days
        assert days_diff == 180

    def test_early_adopter_free_plan_no_special_treatment(self, free_plan):
        sub = Subscription.create(
            subscriber_id="early002",
            subscriber_type=SubscriberType.COMPANY,
            plan=free_plan,
            is_early_adopter=True,
        )
        # Free plans are always active, no extended trial
        assert sub.status == SubscriptionStatus.ACTIVE

    def test_yearly_billing_cycle(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="yearly001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
            billing_cycle=BillingCycle.YEARLY,
        )
        assert sub.billing_cycle == BillingCycle.YEARLY

    def test_empty_subscriber_id_raises(self, free_plan):
        with pytest.raises(SubscriptionValidationError, match="subscriber_id"):
            Subscription.create(
                subscriber_id="",
                subscriber_type=SubscriberType.COMPANY,
                plan=free_plan,
            )

    def test_therapist_subscriber_type(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="therapist001",
            subscriber_type=SubscriberType.THERAPIST,
            plan=pro_plan,
        )
        assert sub.subscriber_type == SubscriberType.THERAPIST


class TestSubscriptionLifecycle:
    def test_activate_trialing(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="act001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        assert sub.status == SubscriptionStatus.TRIALING
        sub.activate()
        assert sub.status == SubscriptionStatus.ACTIVE

    def test_cancel_active_subscription(self, free_plan):
        sub = Subscription.create(
            subscriber_id="cancel001",
            subscriber_type=SubscriberType.COMPANY,
            plan=free_plan,
        )
        sub.cancel(reason="Too expensive")
        assert sub.status == SubscriptionStatus.CANCELED
        assert sub.cancel_reason == "Too expensive"
        assert sub.canceled_at is not None

    def test_cancel_canceled_raises(self, free_plan):
        sub = Subscription.create(
            subscriber_id="cancel002",
            subscriber_type=SubscriberType.COMPANY,
            plan=free_plan,
        )
        sub.cancel()
        with pytest.raises(SubscriptionStateError, match="canceled"):
            sub.cancel()

    def test_activate_canceled_raises(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="act002",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        sub.cancel()
        with pytest.raises(SubscriptionStateError, match="canceled"):
            sub.activate()

    def test_mark_past_due(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="past001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        sub.activate()
        sub.mark_past_due()
        assert sub.status == SubscriptionStatus.PAST_DUE

    def test_mark_past_due_trialing_raises(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="past002",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        with pytest.raises(SubscriptionStateError, match="active"):
            sub.mark_past_due()

    def test_renew_active_subscription(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="renew001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        sub.activate()
        old_end = sub.current_period_end
        sub.renew()
        assert sub.status == SubscriptionStatus.ACTIVE
        assert sub.current_period_end > old_end

    def test_renew_canceled_raises(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="renew002",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        sub.cancel()
        with pytest.raises(SubscriptionStateError, match="canceled"):
            sub.renew()

    def test_expire_subscription(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="expire001",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        sub.expire()
        assert sub.status == SubscriptionStatus.EXPIRED

    def test_is_active_helper(self, free_plan):
        sub = Subscription.create(
            subscriber_id="helper001",
            subscriber_type=SubscriberType.COMPANY,
            plan=free_plan,
        )
        assert sub.is_active() is True
        sub.cancel()
        assert sub.is_active() is False

    def test_is_in_trial_helper(self, pro_plan):
        sub = Subscription.create(
            subscriber_id="helper002",
            subscriber_type=SubscriberType.COMPANY,
            plan=pro_plan,
        )
        assert sub.is_in_trial() is True
        sub.activate()
        assert sub.is_in_trial() is False
