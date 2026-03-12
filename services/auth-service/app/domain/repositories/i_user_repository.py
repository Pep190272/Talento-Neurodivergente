"""User repository port — interface that infrastructure must implement."""

from __future__ import annotations

from abc import ABC, abstractmethod

from shared.domain import Email

from app.domain.entities.user import User


class IUserRepository(ABC):
    """Port for user persistence operations."""

    @abstractmethod
    async def find_by_email(self, email: Email) -> User | None:
        """Find a user by email. Returns None if not found."""

    @abstractmethod
    async def find_by_id(self, user_id: str) -> User | None:
        """Find a user by ID. Returns None if not found."""

    @abstractmethod
    async def create(self, user: User) -> User:
        """Persist a new user. Returns the created user."""

    @abstractmethod
    async def update(self, user: User) -> User:
        """Update an existing user. Returns the updated user."""

    @abstractmethod
    async def count_by_role(self, role: str) -> int:
        """Count users with the given role."""
