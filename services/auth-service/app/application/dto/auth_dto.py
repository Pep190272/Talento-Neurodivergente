"""Data Transfer Objects for auth use cases."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from app.domain.entities.user import User


@dataclass(frozen=True)
class RegisterDTO:
    """Input for the Register use case."""

    email: str
    password: str
    name: str
    role: str = "candidate"


@dataclass(frozen=True)
class LoginDTO:
    """Input for the Login use case."""

    email: str
    password: str


@dataclass(frozen=True)
class UserResponseDTO:
    """Output representing a user (no sensitive data)."""

    id: str
    email: str
    role: str
    display_name: str
    status: str
    created_at: datetime

    @classmethod
    def from_entity(cls, user: User) -> UserResponseDTO:
        return cls(
            id=user.id,
            email=str(user.email),
            role=user.role.value,
            display_name=user.display_name,
            status=user.status.value,
            created_at=user.created_at,
        )


@dataclass(frozen=True)
class AuthResponseDTO:
    """Output for login/register — includes token."""

    user: UserResponseDTO
    access_token: str
    token_type: str = "bearer"
