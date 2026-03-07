"""Base entity for all domain entities across services."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


def _generate_cuid() -> str:
    """Generate a CUID-like identifier compatible with existing Prisma IDs."""
    return str(uuid.uuid4()).replace("-", "")[:25]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class BaseEntity:
    """
    Base class for all domain entities.

    Provides identity (id), timestamps (created_at, updated_at),
    and equality based on identity rather than attribute values.
    """

    id: str = field(default_factory=_generate_cuid)
    created_at: datetime = field(default_factory=_utc_now)
    updated_at: datetime = field(default_factory=_utc_now)

    def touch(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = _utc_now()

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, BaseEntity):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        return hash(self.id)
