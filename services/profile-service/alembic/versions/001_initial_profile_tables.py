"""Initial profile tables.

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
    op.execute("CREATE SCHEMA IF NOT EXISTS profiles")

    user_role = sa.Enum("candidate", "company", "therapist", "admin",
                        name="user_role", schema="profiles")
    profile_status = sa.Enum("incomplete", "assessment_pending", "active", "inactive",
                             name="profile_status", schema="profiles")
    verification_status = sa.Enum("pending", "verified", "rejected",
                                  name="verification_status", schema="profiles")
    assessment_status = sa.Enum("in_progress", "completed", "flagged", "expired",
                                name="assessment_status", schema="profiles")

    # Profiles table with 24 NeuroVector dimensions as individual columns
    op.create_table(
        "profiles",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("user_id", sa.String(25), unique=True, nullable=False, index=True),
        sa.Column("role", user_role, nullable=False),
        sa.Column("display_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("bio", sa.Text, nullable=False, server_default=""),
        sa.Column("status", profile_status, nullable=False, server_default="incomplete"),
        sa.Column("onboarding_completed", sa.Boolean, nullable=False, server_default="false"),
        # Cognitive (8)
        sa.Column("attention", sa.Float, nullable=True),
        sa.Column("memory", sa.Float, nullable=True),
        sa.Column("processing_speed", sa.Float, nullable=True),
        sa.Column("pattern_recognition", sa.Float, nullable=True),
        sa.Column("creative_thinking", sa.Float, nullable=True),
        sa.Column("analytical_thinking", sa.Float, nullable=True),
        sa.Column("verbal_reasoning", sa.Float, nullable=True),
        sa.Column("spatial_reasoning", sa.Float, nullable=True),
        # Social (4)
        sa.Column("communication_style", sa.Float, nullable=True),
        sa.Column("teamwork", sa.Float, nullable=True),
        sa.Column("leadership", sa.Float, nullable=True),
        sa.Column("conflict_resolution", sa.Float, nullable=True),
        # Work (6)
        sa.Column("task_switching", sa.Float, nullable=True),
        sa.Column("deadline_management", sa.Float, nullable=True),
        sa.Column("autonomy", sa.Float, nullable=True),
        sa.Column("structure_need", sa.Float, nullable=True),
        sa.Column("sensory_sensitivity", sa.Float, nullable=True),
        sa.Column("stress_tolerance", sa.Float, nullable=True),
        # Technical (6)
        sa.Column("domain_expertise", sa.Float, nullable=True),
        sa.Column("learning_speed", sa.Float, nullable=True),
        sa.Column("problem_solving", sa.Float, nullable=True),
        sa.Column("detail_orientation", sa.Float, nullable=True),
        sa.Column("abstract_thinking", sa.Float, nullable=True),
        sa.Column("technical_depth", sa.Float, nullable=True),
        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="profiles",
    )

    # Therapists table
    op.create_table(
        "therapists",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("user_id", sa.String(25), unique=True, nullable=False, index=True),
        sa.Column("specialty", sa.String(255), nullable=False, server_default=""),
        sa.Column("bio", sa.Text, nullable=False, server_default=""),
        sa.Column("support_areas", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("license_number", sa.String(100), nullable=False, server_default=""),
        sa.Column("verification_status", verification_status, nullable=False,
                  server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="profiles",
    )

    # Assessments table
    op.create_table(
        "assessments",
        sa.Column("id", sa.String(25), primary_key=True),
        sa.Column("user_id", sa.String(25), nullable=False, index=True),
        sa.Column("status", assessment_status, nullable=False, server_default="in_progress"),
        sa.Column("answers", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("result_vector", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        schema="profiles",
    )


def downgrade() -> None:
    op.drop_table("assessments", schema="profiles")
    op.drop_table("therapists", schema="profiles")
    op.drop_table("profiles", schema="profiles")
    op.execute("DROP TYPE IF EXISTS profiles.assessment_status")
    op.execute("DROP TYPE IF EXISTS profiles.verification_status")
    op.execute("DROP TYPE IF EXISTS profiles.profile_status")
    op.execute("DROP TYPE IF EXISTS profiles.user_role")
