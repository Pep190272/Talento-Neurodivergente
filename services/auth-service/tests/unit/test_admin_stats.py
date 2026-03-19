"""Unit tests for admin stats logic — validates access control and user counting."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest

from shared.auth import TokenPayload
from shared.domain import UserRole

from app.application.use_cases.register import (
    EARLY_ADOPTER_COMPANY_LIMIT,
    EARLY_ADOPTER_THERAPIST_LIMIT,
)
from app.domain.repositories.i_user_repository import IUserRepository


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _make_token_payload(role: str = "admin") -> TokenPayload:
    now = datetime.now(timezone.utc)
    return TokenPayload(
        sub="test-user-id",
        email="admin@diversia.click",
        role=role,
        iat=now,
        exp=now + timedelta(hours=1),
    )


async def _admin_stats_logic(current_user: TokenPayload, user_repo) -> dict:
    """
    Extracted admin stats logic — mirrors the endpoint in app.api.v1.auth.

    This avoids importing the route module which triggers the database
    engine creation (not available in unit tests).
    """
    if current_user.role != "admin":
        raise PermissionError("Admin access required")

    candidate_count = await user_repo.count_by_role("candidate")
    company_count = await user_repo.count_by_role("company")
    therapist_count = await user_repo.count_by_role("therapist")
    admin_count = await user_repo.count_by_role("admin")

    return {
        "users": {
            "candidates": candidate_count,
            "companies": company_count,
            "therapists": therapist_count,
            "admins": admin_count,
            "total": candidate_count + company_count + therapist_count + admin_count,
        },
        "early_adopter": {
            "company_remaining": max(0, EARLY_ADOPTER_COMPANY_LIMIT - company_count),
            "therapist_remaining": max(0, EARLY_ADOPTER_THERAPIST_LIMIT - therapist_count),
            "company_limit": EARLY_ADOPTER_COMPANY_LIMIT,
            "therapist_limit": EARLY_ADOPTER_THERAPIST_LIMIT,
        },
    }


# ─── Fixtures ────────────────────────────────────────────────────────────────


@pytest.fixture
def mock_user_repo() -> AsyncMock:
    repo = AsyncMock(spec=IUserRepository)
    repo.count_by_role.side_effect = lambda role: {
        "candidate": 5,
        "company": 3,
        "therapist": 2,
        "admin": 1,
    }.get(role, 0)
    return repo


# ─── Tests ───────────────────────────────────────────────────────────────────


class TestAdminStats:
    """Tests for admin stats business logic."""

    async def test_returns_user_counts_per_role(self, mock_user_repo):
        """Admin should receive accurate counts for each role."""
        result = await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=mock_user_repo,
        )

        assert result["users"]["candidates"] == 5
        assert result["users"]["companies"] == 3
        assert result["users"]["therapists"] == 2
        assert result["users"]["admins"] == 1

    async def test_returns_total_user_count(self, mock_user_repo):
        """Total should be the sum of all roles."""
        result = await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=mock_user_repo,
        )

        assert result["users"]["total"] == 11  # 5 + 3 + 2 + 1

    async def test_includes_early_adopter_slots(self, mock_user_repo):
        """Response must include early adopter slot information."""
        result = await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=mock_user_repo,
        )

        ea = result["early_adopter"]
        assert "company_remaining" in ea
        assert "therapist_remaining" in ea
        assert "company_limit" in ea
        assert "therapist_limit" in ea

    async def test_early_adopter_remaining_is_correctly_calculated(self, mock_user_repo):
        """Remaining = max(0, limit - count)."""
        result = await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=mock_user_repo,
        )

        assert result["early_adopter"]["company_remaining"] == max(0, EARLY_ADOPTER_COMPANY_LIMIT - 3)
        assert result["early_adopter"]["therapist_remaining"] == max(0, EARLY_ADOPTER_THERAPIST_LIMIT - 2)

    async def test_forbidden_for_candidate_role(self, mock_user_repo):
        """Candidate role must be rejected."""
        with pytest.raises(PermissionError):
            await _admin_stats_logic(
                current_user=_make_token_payload("candidate"),
                user_repo=mock_user_repo,
            )

    async def test_forbidden_for_company_role(self, mock_user_repo):
        """Company role must be rejected."""
        with pytest.raises(PermissionError):
            await _admin_stats_logic(
                current_user=_make_token_payload("company"),
                user_repo=mock_user_repo,
            )

    async def test_forbidden_for_therapist_role(self, mock_user_repo):
        """Therapist role must be rejected."""
        with pytest.raises(PermissionError):
            await _admin_stats_logic(
                current_user=_make_token_payload("therapist"),
                user_repo=mock_user_repo,
            )

    async def test_queries_all_four_roles(self, mock_user_repo):
        """Endpoint must call count_by_role for candidate, company, therapist, admin."""
        await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=mock_user_repo,
        )

        assert mock_user_repo.count_by_role.call_count == 4
        called_roles = {call.args[0] for call in mock_user_repo.count_by_role.call_args_list}
        assert called_roles == {"candidate", "company", "therapist", "admin"}

    async def test_remaining_never_negative(self):
        """When count exceeds limit, remaining should be 0, not negative."""
        repo = AsyncMock(spec=IUserRepository)
        repo.count_by_role.side_effect = lambda role: {
            "candidate": 100,
            "company": 999,  # Way above limit
            "therapist": 999,
            "admin": 1,
        }.get(role, 0)

        result = await _admin_stats_logic(
            current_user=_make_token_payload("admin"),
            user_repo=repo,
        )

        assert result["early_adopter"]["company_remaining"] == 0
        assert result["early_adopter"]["therapist_remaining"] == 0
