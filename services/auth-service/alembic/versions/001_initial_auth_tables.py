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

    user_role = sa.Enum("candidate", "company", "therapist", "admin",
                        name="user_role", schema="auth")
    user_status = sa.Enum("active", "inactive", "deleted",
                          name="user_status", schema="auth")

    op.create_table(
        "users",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False, server_default="candidate"),
        sa.Column("status", user_status, nullable=False, server_default="active"),
        sa.Column("display_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="auth",
    )


def downgrade() -> None:
    op.drop_table("users", schema="auth")
    op.execute("DROP TYPE IF EXISTS auth.user_role")
    op.execute("DROP TYPE IF EXISTS auth.user_status")
