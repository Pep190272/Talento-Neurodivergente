"""SQLAlchemy ORM models for the auth schema.

These models map to the database tables and provide conversion
to/from domain entities. The domain entities remain pure.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from shared.domain import Email, UserRole, UserStatus

from app.domain.entities.user import User


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models in auth-service."""
    pass


class UserModel(Base):
    """SQLAlchemy model for the users table in the auth schema."""

    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("candidate", "company", "therapist", "admin", name="user_role", schema="auth"),
        nullable=False,
        default="candidate",
    )
    status: Mapped[str] = mapped_column(
        Enum("active", "inactive", "deleted", name="user_status", schema="auth"),
        nullable=False,
        default="active",
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> User:
        """Convert ORM model to domain entity."""
        return User(
            id=self.id,
            email=Email(self.email),
            password_hash=self.password_hash,
            role=UserRole(self.role),
            status=UserStatus(self.status),
            display_name=self.display_name,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, user: User) -> UserModel:
        """Convert domain entity to ORM model."""
        return cls(
            id=user.id,
            email=str(user.email),
            password_hash=user.password_hash,
            role=user.role.value,
            status=user.status.value,
            display_name=user.display_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
