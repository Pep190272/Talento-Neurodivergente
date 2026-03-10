"""Add job_offers and game_scores tables.

Revision ID: 002
Revises: 001
Create Date: 2026-03-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    job_status = sa.Enum("active", "closed", "draft",
                         name="job_status", schema="profiles")

    op.create_table(
        "job_offers",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("company_user_id", sa.String(25), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False, server_default=""),
        sa.Column("location", sa.String(255), nullable=False, server_default=""),
        sa.Column("modality", sa.String(50), nullable=False, server_default="remote"),
        sa.Column("required_skills", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("adaptations", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("salary_range", sa.String(100), nullable=False, server_default=""),
        sa.Column("status", job_status, nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="profiles",
    )

    op.create_table(
        "game_scores",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("user_id", sa.String(25), nullable=False, index=True),
        sa.Column("game", sa.String(100), nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("details", sa.JSON, nullable=False, server_default="{}"),
        sa.Column("played_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="profiles",
    )


def downgrade() -> None:
    op.drop_table("game_scores", schema="profiles")
    op.drop_table("job_offers", schema="profiles")
    op.execute("DROP TYPE IF EXISTS profiles.job_status")
