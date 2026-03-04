"""Initial AI tables.

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
    op.execute("CREATE SCHEMA IF NOT EXISTS ai")

    report_type = sa.Enum("candidate_summary", "match_analysis",
                          "accommodation_guide", "team_fit",
                          name="report_type", schema="ai")
    report_status = sa.Enum("pending", "generating", "completed", "failed",
                            name="report_status", schema="ai")

    # Reports table
    op.create_table(
        "reports",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("report_type", report_type, nullable=False),
        sa.Column("status", report_status, nullable=False, server_default="pending"),
        sa.Column("candidate_id", sa.String(25), nullable=False, index=True),
        sa.Column("job_id", sa.String(25), nullable=True),
        sa.Column("content", sa.Text, nullable=False, server_default=""),
        sa.Column("prompt_used", sa.Text, nullable=False, server_default=""),
        sa.Column("model_name", sa.String(100), nullable=False, server_default=""),
        sa.Column("tokens_used", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="ai",
    )


def downgrade() -> None:
    op.drop_table("reports", schema="ai")
    op.execute("DROP TYPE IF EXISTS ai.report_status")
    op.execute("DROP TYPE IF EXISTS ai.report_type")
