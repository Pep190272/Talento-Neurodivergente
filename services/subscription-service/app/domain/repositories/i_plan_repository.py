"""Plan repository port — interface that infrastructure must implement."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.entities.plan import Plan, PlanTarget, PlanTier


class IPlanRepository(ABC):
    """Port for plan persistence operations."""

    @abstractmethod
    async def find_by_id(self, plan_id: str) -> Plan | None:
        """Find a plan by ID."""

    @abstractmethod
    async def find_by_slug(self, slug: str) -> Plan | None:
        """Find a plan by slug."""

    @abstractmethod
    async def list_active(self, target: PlanTarget | None = None) -> list[Plan]:
        """List all active plans, optionally filtered by target."""

    @abstractmethod
    async def create(self, plan: Plan) -> Plan:
        """Persist a new plan."""

    @abstractmethod
    async def update(self, plan: Plan) -> Plan:
        """Update an existing plan."""
