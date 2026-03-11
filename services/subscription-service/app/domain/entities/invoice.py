"""Invoice domain entity — represents a billing event for a subscription."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

from shared.domain import BaseEntity

from .plan import Money


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


@dataclass(eq=False)
class Invoice(BaseEntity):
    """
    Invoice aggregate root — a billing record for a subscription period.

    Invariants:
    - amount must be non-negative
    - period_end must be after period_start
    - cannot pay an already paid invoice
    - cannot refund an unpaid invoice
    """

    subscription_id: str = ""
    amount: Money = field(default_factory=lambda: Money(0.0))
    status: InvoiceStatus = InvoiceStatus.DRAFT

    # Stripe integration
    stripe_invoice_id: str | None = None
    stripe_payment_intent_id: str | None = None

    # Billing period
    period_start: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    period_end: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Payment lifecycle
    paid_at: datetime | None = None
    failed_at: datetime | None = None
    failure_reason: str | None = None

    @classmethod
    def create(
        cls,
        *,
        subscription_id: str,
        amount: float,
        currency: str = "EUR",
        period_start: datetime,
        period_end: datetime,
    ) -> Invoice:
        """Factory: create a new invoice."""
        if not subscription_id.strip():
            raise InvoiceValidationError("subscription_id cannot be empty")
        if period_end <= period_start:
            raise InvoiceValidationError("period_end must be after period_start")

        return cls(
            subscription_id=subscription_id,
            amount=Money(amount, currency),
            status=InvoiceStatus.DRAFT,
            period_start=period_start,
            period_end=period_end,
        )

    def send(self) -> None:
        """Mark invoice as pending (sent to customer)."""
        if self.status != InvoiceStatus.DRAFT:
            raise InvoiceStateError("Only draft invoices can be sent")
        self.status = InvoiceStatus.PENDING
        self.touch()

    def mark_paid(self) -> None:
        """Mark invoice as paid."""
        if self.status in (InvoiceStatus.PAID, InvoiceStatus.REFUNDED):
            raise InvoiceStateError(f"Cannot pay an invoice with status: {self.status.value}")
        self.status = InvoiceStatus.PAID
        self.paid_at = datetime.now(timezone.utc)
        self.touch()

    def mark_failed(self, reason: str = "") -> None:
        """Mark invoice as failed."""
        if self.status == InvoiceStatus.PAID:
            raise InvoiceStateError("Cannot fail a paid invoice")
        self.status = InvoiceStatus.FAILED
        self.failed_at = datetime.now(timezone.utc)
        self.failure_reason = reason
        self.touch()

    def refund(self) -> None:
        """Refund a paid invoice."""
        if self.status != InvoiceStatus.PAID:
            raise InvoiceStateError("Only paid invoices can be refunded")
        self.status = InvoiceStatus.REFUNDED
        self.touch()


class InvoiceValidationError(Exception):
    """Invoice domain validation error."""


class InvoiceStateError(Exception):
    """Invalid invoice state transition."""
