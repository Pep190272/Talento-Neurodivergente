"""In-memory repository implementations — for development and testing.

These will be replaced by SQLAlchemy-backed repos when PostgreSQL persistence
is wired up. They provide a working service without any database dependency.
"""

from __future__ import annotations

from app.domain.entities.invoice import Invoice
from app.domain.entities.plan import Plan, PlanTarget
from app.domain.entities.subscription import Subscription, SubscriptionStatus
from app.domain.repositories.i_invoice_repository import IInvoiceRepository
from app.domain.repositories.i_plan_repository import IPlanRepository
from app.domain.repositories.i_subscription_repository import ISubscriptionRepository


class InMemoryPlanRepository(IPlanRepository):
    def __init__(self) -> None:
        self._plans: dict[str, Plan] = {}

    async def find_by_id(self, plan_id: str) -> Plan | None:
        return self._plans.get(plan_id)

    async def find_by_slug(self, slug: str) -> Plan | None:
        for plan in self._plans.values():
            if plan.slug == slug:
                return plan
        return None

    async def list_active(self, target: PlanTarget | None = None) -> list[Plan]:
        result = [p for p in self._plans.values() if p.is_active]
        if target:
            result = [p for p in result if p.target == target]
        return result

    async def create(self, plan: Plan) -> Plan:
        self._plans[plan.id] = plan
        return plan

    async def update(self, plan: Plan) -> Plan:
        self._plans[plan.id] = plan
        return plan


class InMemorySubscriptionRepository(ISubscriptionRepository):
    def __init__(self) -> None:
        self._subscriptions: dict[str, Subscription] = {}

    async def find_by_id(self, subscription_id: str) -> Subscription | None:
        return self._subscriptions.get(subscription_id)

    async def find_active_by_subscriber(self, subscriber_id: str) -> Subscription | None:
        for sub in self._subscriptions.values():
            if (
                sub.subscriber_id == subscriber_id
                and sub.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING)
            ):
                return sub
        return None

    async def create(self, subscription: Subscription) -> Subscription:
        self._subscriptions[subscription.id] = subscription
        return subscription

    async def update(self, subscription: Subscription) -> Subscription:
        self._subscriptions[subscription.id] = subscription
        return subscription

    async def count_by_plan(self, plan_id: str) -> int:
        return sum(
            1
            for sub in self._subscriptions.values()
            if sub.plan_id == plan_id
            and sub.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING)
        )


class InMemoryInvoiceRepository(IInvoiceRepository):
    def __init__(self) -> None:
        self._invoices: dict[str, Invoice] = {}

    async def find_by_id(self, invoice_id: str) -> Invoice | None:
        return self._invoices.get(invoice_id)

    async def find_by_subscription(self, subscription_id: str) -> list[Invoice]:
        return [
            inv
            for inv in self._invoices.values()
            if inv.subscription_id == subscription_id
        ]

    async def create(self, invoice: Invoice) -> Invoice:
        self._invoices[invoice.id] = invoice
        return invoice

    async def update(self, invoice: Invoice) -> Invoice:
        self._invoices[invoice.id] = invoice
        return invoice
