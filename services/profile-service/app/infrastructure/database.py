"""SQLAlchemy async engine and session factory for profile-service."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import ProfileServiceSettings

_settings = ProfileServiceSettings()

_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            _settings.db.async_url,
            echo=False,
            pool_size=5,
            max_overflow=10,
        )
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            _get_engine(), class_=AsyncSession, expire_on_commit=False
        )
    return _session_factory


# Keep backward-compatible names
engine = property(lambda self: _get_engine())
async_session_factory = property(lambda self: _get_session_factory())


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    factory = _get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()
