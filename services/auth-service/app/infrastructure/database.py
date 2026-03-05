"""SQLAlchemy async engine and session factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# Async engine — shared connection pool
engine = create_async_engine(
    settings.db.async_url,
    echo=settings.ENV == "development",
    pool_size=5,
    max_overflow=10,
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session with automatic cleanup."""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
