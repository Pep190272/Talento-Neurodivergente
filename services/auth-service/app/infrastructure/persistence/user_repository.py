"""SQLAlchemy implementation of IUserRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain import Email

from app.domain.entities.user import User
from app.domain.repositories.i_user_repository import IUserRepository
from app.infrastructure.persistence.models import UserModel


class SQLAlchemyUserRepository(IUserRepository):
    """Adapter: implements the user repository port using SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_email(self, email: Email) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == str(email))
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_id(self, user_id: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def create(self, user: User) -> User:
        model = UserModel.from_entity(user)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, user: User) -> User:
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"User {user.id} not found")

        model.email = str(user.email)
        model.password_hash = user.password_hash
        model.role = user.role.value
        model.status = user.status.value
        model.display_name = user.display_name
        model.updated_at = user.updated_at

        await self._session.flush()
        return model.to_entity()
