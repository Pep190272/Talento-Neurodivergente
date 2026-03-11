"""Alembic environment — placeholder for future SQL migrations."""

from alembic import context


def run_migrations_online() -> None:
    """Placeholder — will be configured when PostgreSQL persistence is added."""
    pass


if context.is_offline_mode():
    pass
else:
    run_migrations_online()
