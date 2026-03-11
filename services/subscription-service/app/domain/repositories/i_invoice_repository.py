"""Invoice repository port."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.entities.invoice import Invoice


class IInvoiceRepository(ABC):
    """Port for invoice persistence operations."""

    @abstractmethod
    async def find_by_id(self, invoice_id: str) -> Invoice | None:
        """Find an invoice by ID."""

    @abstractmethod
    async def find_by_subscription(self, subscription_id: str) -> list[Invoice]:
        """Find all invoices for a subscription."""

    @abstractmethod
    async def create(self, invoice: Invoice) -> Invoice:
        """Persist a new invoice."""

    @abstractmethod
    async def update(self, invoice: Invoice) -> Invoice:
        """Update an existing invoice."""
