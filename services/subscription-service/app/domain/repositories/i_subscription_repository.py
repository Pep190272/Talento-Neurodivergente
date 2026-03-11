"""Subscription repository port."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.entities.subscription import Subscription, SubscriptionStatus


class ISubscriptionRepository(ABC):
    """Port for subscription persistence operations."""

    @abstractmethod
    async def find_by_id(self, subscription_id: str) -> Subscription | None:
        """Find a subscription by ID."""

    @abstractmethod
    async def find_active_by_subscriber(self, subscriber_id: str) -> Subscription | None:
        """Find the active subscription for a subscriber."""

    @abstractmethod
    async def create(self, subscription: Subscription) -> Subscription:
        """Persist a new subscription."""

    @abstractmethod
    async def update(self, subscription: Subscription) -> Subscription:
        """Update an existing subscription."""

    @abstractmethod
    async def count_by_plan(self, plan_id: str) -> int:
        """Count subscribers on a given plan (for early adopter tracking)."""
