"""Database engine and session factory for matching-service."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from shared.config import DatabaseSettings

_settings = DatabaseSettings()
_engine = create_async_engine(_settings.async_url, echo=False, pool_size=5)
_session_factory = async_sessionmaker(_engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with _session_factory() as session:
        yield session
