"""Unit tests for ExportDataUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.export_data import (
    ExportDataDTO,
    ExportDataUseCase,
    UnsupportedFormatError,
)
from app.domain.entities.profile import ProfileNotFoundError, ProfileStatus, UserProfile
from app.domain.entities.assessment import Assessment, AssessmentStatus, QuizAnswer
from shared.domain import NeuroVector24D, UserRole


def _profile_with_vector() -> UserProfile:
    p = UserProfile(
        user_id="user-1",
        role=UserRole.CANDIDATE,
        display_name="Ana Garcia",
        bio="Software developer",
    )
    p.status = ProfileStatus.ACTIVE
    p.neuro_vector = NeuroVector24D(attention=0.8, memory=0.7)
    return p


def _completed_assessment() -> Assessment:
    a = Assessment(user_id="user-1")
    a.status = AssessmentStatus.COMPLETED
    a.answers = [QuizAnswer(question_id="q_0", dimension="attention", value=0.8)]
    return a


@pytest.fixture
def profile_repo():
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=_profile_with_vector())
    return repo


@pytest.fixture
def assessment_repo():
    repo = AsyncMock()
    repo.find_active_by_user = AsyncMock(return_value=_completed_assessment())
    return repo


class TestExportDataUseCase:
    @pytest.mark.asyncio
    async def test_export_json(self, profile_repo, assessment_repo):
        uc = ExportDataUseCase(profile_repo, assessment_repo)
        result = await uc.execute(ExportDataDTO(user_id="user-1", format="json"))

        assert result.user_id == "user-1"
        assert result.format == "json"
        assert "profile" in result.data
        assert "neuro_vector_24d" in result.data
        assert "assessment" in result.data
        assert result.data["profile"]["display_name"] == "Ana Garcia"
        assert result.data["neuro_vector_24d"]["attention"] == 0.8
        assert "Art. 15" in result.gdpr_articles
        assert "Art. 20" in result.gdpr_articles

    @pytest.mark.asyncio
    async def test_export_without_vector(self, profile_repo, assessment_repo):
        profile = UserProfile(user_id="user-2", role=UserRole.CANDIDATE)
        profile_repo.find_by_user_id = AsyncMock(return_value=profile)
        assessment_repo.find_active_by_user = AsyncMock(return_value=None)

        uc = ExportDataUseCase(profile_repo, assessment_repo)
        result = await uc.execute(ExportDataDTO(user_id="user-2"))

        assert result.data["neuro_vector_24d"] is None
        assert result.data["assessment"] is None

    @pytest.mark.asyncio
    async def test_export_metadata_present(self, profile_repo, assessment_repo):
        uc = ExportDataUseCase(profile_repo, assessment_repo)
        result = await uc.execute(ExportDataDTO(user_id="user-1"))

        meta = result.data["export_metadata"]
        assert "exported_at" in meta
        assert "gdpr_basis" in meta
        assert "data_controller" in meta

    @pytest.mark.asyncio
    async def test_unsupported_format_raises(self, profile_repo, assessment_repo):
        uc = ExportDataUseCase(profile_repo, assessment_repo)
        with pytest.raises(UnsupportedFormatError):
            await uc.execute(ExportDataDTO(user_id="user-1", format="xml"))

    @pytest.mark.asyncio
    async def test_profile_not_found_raises(self, profile_repo, assessment_repo):
        profile_repo.find_by_user_id = AsyncMock(return_value=None)
        uc = ExportDataUseCase(profile_repo, assessment_repo)

        with pytest.raises(ProfileNotFoundError):
            await uc.execute(ExportDataDTO(user_id="ghost"))
