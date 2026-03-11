"""Dependency injection for API endpoints.

Uses in-memory repositories by default. When PostgreSQL is configured,
swap to SQL-backed repositories.
"""

from __future__ import annotations

from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository
from app.domain.repositories.i_invoice_repository import IInvoiceRepository
from app.infrastructure.persistence.in_memory import (
    InMemoryPlanRepository,
    InMemorySubscriptionRepository,
    InMemoryInvoiceRepository,
)

# Singleton in-memory repos (replaced by SQL repos when DB is available)
_plan_repo = InMemoryPlanRepository()
_subscription_repo = InMemorySubscriptionRepository()
_invoice_repo = InMemoryInvoiceRepository()


def get_plan_repo() -> IPlanRepository:
    return _plan_repo


def get_subscription_repo() -> ISubscriptionRepository:
    return _subscription_repo


def get_invoice_repo() -> IInvoiceRepository:
    return _invoice_repo
