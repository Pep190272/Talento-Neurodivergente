"""Unit tests for Invoice entity — TDD."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.domain.entities.invoice import (
    Invoice,
    InvoiceStateError,
    InvoiceStatus,
    InvoiceValidationError,
)


@pytest.fixture
def now() -> datetime:
    return datetime.now(timezone.utc)


class TestInvoiceCreate:
    def test_create_valid_invoice(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=149.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        assert inv.subscription_id == "sub123"
        assert inv.amount.amount == 149.0
        assert inv.amount.currency == "EUR"
        assert inv.status == InvoiceStatus.DRAFT

    def test_empty_subscription_id_raises(self, now):
        with pytest.raises(InvoiceValidationError, match="subscription_id"):
            Invoice.create(
                subscription_id="",
                amount=10.0,
                period_start=now,
                period_end=now + timedelta(days=30),
            )

    def test_period_end_before_start_raises(self, now):
        with pytest.raises(InvoiceValidationError, match="period_end"):
            Invoice.create(
                subscription_id="sub123",
                amount=10.0,
                period_start=now,
                period_end=now - timedelta(days=1),
            )


class TestInvoiceLifecycle:
    def test_send_invoice(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        assert inv.status == InvoiceStatus.PENDING

    def test_send_non_draft_raises(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        with pytest.raises(InvoiceStateError, match="draft"):
            inv.send()

    def test_mark_paid(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        inv.mark_paid()
        assert inv.status == InvoiceStatus.PAID
        assert inv.paid_at is not None

    def test_pay_already_paid_raises(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        inv.mark_paid()
        with pytest.raises(InvoiceStateError, match="paid"):
            inv.mark_paid()

    def test_mark_failed(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        inv.mark_failed(reason="Card declined")
        assert inv.status == InvoiceStatus.FAILED
        assert inv.failure_reason == "Card declined"

    def test_fail_paid_raises(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        inv.mark_paid()
        with pytest.raises(InvoiceStateError, match="paid"):
            inv.mark_failed()

    def test_refund_paid_invoice(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        inv.send()
        inv.mark_paid()
        inv.refund()
        assert inv.status == InvoiceStatus.REFUNDED

    def test_refund_unpaid_raises(self, now):
        inv = Invoice.create(
            subscription_id="sub123",
            amount=49.0,
            period_start=now,
            period_end=now + timedelta(days=30),
        )
        with pytest.raises(InvoiceStateError, match="paid"):
            inv.refund()
