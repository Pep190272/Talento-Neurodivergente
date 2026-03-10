"""Initial auth tables.

Revision ID: 001
Revises: None
Create Date: 2026-03-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")

    # Create enums idempotently — survives partial migration retries
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE auth.user_role AS ENUM ('candidate', 'company', 'therapist', 'admin');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE auth.user_status AS ENUM ('active', 'inactive', 'deleted');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS auth.users (
            id VARCHAR(25) PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role auth.user_role NOT NULL DEFAULT 'candidate',
            status auth.user_status NOT NULL DEFAULT 'active',
            display_name VARCHAR(255) NOT NULL DEFAULT '',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_auth_users_email ON auth.users (email)")


def downgrade() -> None:
    op.drop_table("users", schema="auth")
    op.execute("DROP TYPE IF EXISTS auth.user_role")
    op.execute("DROP TYPE IF EXISTS auth.user_status")
