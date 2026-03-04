"""User domain entity with authentication behavior."""

from __future__ import annotations

from dataclasses import dataclass, field

import bcrypt

from shared.domain import BaseEntity, Email, UserRole, UserStatus


@dataclass(eq=False)
class User(BaseEntity):
    """
    User entity — the core identity in the auth bounded context.

    Contains authentication-related behavior:
    - Password hashing and verification
    - Status management (active, inactive, deleted)
    - Role-based identity
    """

    email: Email = field(default_factory=lambda: Email("placeholder@example.com"))
    password_hash: str = ""
    role: UserRole = UserRole.CANDIDATE
    status: UserStatus = UserStatus.ACTIVE
    display_name: str = ""

    @classmethod
    def create(
        cls,
        *,
        email: Email,
        password: str,
        role: UserRole,
        display_name: str = "",
    ) -> User:
        """Factory method to create a new user with hashed password."""
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(rounds=12),
        ).decode("utf-8")

        return cls(
            email=email,
            password_hash=password_hash,
            role=role,
            status=UserStatus.ACTIVE,
            display_name=display_name or str(email),
        )

    def verify_password(self, plain_password: str) -> bool:
        """Verify a plain password against the stored hash."""
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            self.password_hash.encode("utf-8"),
        )

    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

    def deactivate(self) -> None:
        if self.status == UserStatus.DELETED:
            raise DomainError("Cannot deactivate a deleted user")
        self.status = UserStatus.INACTIVE
        self.touch()

    def delete(self) -> None:
        self.status = UserStatus.DELETED
        self.touch()


class DomainError(Exception):
    """Base exception for domain errors."""


class UserNotFoundError(DomainError):
    """User does not exist."""


class DuplicateEmailError(DomainError):
    """Email is already registered."""


class InvalidCredentialsError(DomainError):
    """Email or password is incorrect."""


class InactiveUserError(DomainError):
    """User account is not active."""
