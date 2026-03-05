"""Initial matching tables.

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
    op.execute("CREATE SCHEMA IF NOT EXISTS matching")

    job_status = sa.Enum("draft", "active", "paused", "closed",
                         name="job_status", schema="matching")
    match_status = sa.Enum("pending", "active", "expired", "rejected", "accepted",
                           name="match_status", schema="matching")

    # Jobs table
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("company_id", sa.String(25), nullable=False, index=True),
        sa.Column("title", sa.String(500), nullable=False, server_default=""),
        sa.Column("description", sa.Text, nullable=False, server_default=""),
        sa.Column("status", job_status, nullable=False, server_default="draft"),
        sa.Column("ideal_vector", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("accommodations", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("preferences", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="matching",
    )

    # Candidates (read model — synced from profile-service)
    op.create_table(
        "candidates",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("user_id", sa.String(25), unique=True, nullable=False, index=True),
        sa.Column("neuro_vector", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("accommodations", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("preferences", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("assessment_completed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="matching",
    )

    # Matches table
    op.create_table(
        "matches",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("candidate_id", sa.String(25), nullable=False, index=True),
        sa.Column("job_id", sa.String(25), nullable=False, index=True),
        sa.Column("therapist_id", sa.String(25), nullable=True),
        sa.Column("score", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("breakdown", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("status", match_status, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="matching",
    )


def downgrade() -> None:
    op.drop_table("matches", schema="matching")
    op.drop_table("candidates", schema="matching")
    op.drop_table("jobs", schema="matching")
    op.execute("DROP TYPE IF EXISTS matching.match_status")
    op.execute("DROP TYPE IF EXISTS matching.job_status")
