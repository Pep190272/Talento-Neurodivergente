"""Unit tests for SubmitQuizUseCase."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest

from shared.domain import NeuroVector24D

from app.application.dto.profile_dto import QuizAnswerDTO, SubmitQuizDTO
from app.application.use_cases.submit_quiz import SubmitQuizUseCase
from app.domain.entities.assessment import Assessment
from app.domain.entities.profile import ProfileNotFoundError, ProfileStatus, UserProfile


def _mock_profile(user_id: str = "user-1") -> UserProfile:
    return UserProfile(
        user_id=user_id,
        status=ProfileStatus.ASSESSMENT_PENDING,
        onboarding_completed=True,
    )


def _make_answers() -> list[QuizAnswerDTO]:
    return [
        QuizAnswerDTO(question_id="q1", dimension="attention", value=0.9),
        QuizAnswerDTO(question_id="q2", dimension="memory", value=0.7),
        QuizAnswerDTO(question_id="q3", dimension="creative_thinking", value=0.85),
    ]


@pytest.fixture
def repos():
    assessment_repo = AsyncMock()
    profile_repo = AsyncMock()
    profile_repo.find_by_user_id = AsyncMock(return_value=_mock_profile())

    # Return assessment with early start time (so it's not flagged)
    def create_assessment(a: Assessment) -> Assessment:
        a.started_at = datetime.now(timezone.utc) - timedelta(minutes=5)
        return a

    assessment_repo.find_active_by_user = AsyncMock(return_value=None)
    assessment_repo.create = AsyncMock(side_effect=create_assessment)
    assessment_repo.update = AsyncMock(side_effect=lambda a: a)
    profile_repo.update = AsyncMock(side_effect=lambda p: p)
    return assessment_repo, profile_repo


class TestSubmitQuizUseCase:
    @pytest.mark.asyncio
    async def test_successful_quiz_submission(self, repos):
        assessment_repo, profile_repo = repos
        use_case = SubmitQuizUseCase(assessment_repo, profile_repo)

        dto = SubmitQuizDTO(user_id="user-1", answers=_make_answers())
        result = await use_case.execute(dto)

        assert result.user_id == "user-1"
        assert result.status == "completed"
        assert not result.is_flagged
        assert result.vector_dimensions is not None
        assert result.vector_dimensions["attention"] == 0.9
        assert result.vector_dimensions["memory"] == 0.7

    @pytest.mark.asyncio
    async def test_profile_not_found_raises(self, repos):
        assessment_repo, profile_repo = repos
        profile_repo.find_by_user_id = AsyncMock(return_value=None)

        use_case = SubmitQuizUseCase(assessment_repo, profile_repo)
        dto = SubmitQuizDTO(user_id="nonexistent", answers=_make_answers())

        with pytest.raises(ProfileNotFoundError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_updates_profile_with_vector(self, repos):
        assessment_repo, profile_repo = repos
        use_case = SubmitQuizUseCase(assessment_repo, profile_repo)

        dto = SubmitQuizDTO(user_id="user-1", answers=_make_answers())
        await use_case.execute(dto)

        # Profile should have been updated with the neuro-vector
        profile_repo.update.assert_called_once()
        updated_profile = profile_repo.update.call_args[0][0]
        assert updated_profile.neuro_vector is not None
        assert updated_profile.status == ProfileStatus.ACTIVE

    @pytest.mark.asyncio
    async def test_resumes_existing_assessment(self, repos):
        assessment_repo, profile_repo = repos
        existing = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        )
        assessment_repo.find_active_by_user = AsyncMock(return_value=existing)

        use_case = SubmitQuizUseCase(assessment_repo, profile_repo)
        dto = SubmitQuizDTO(user_id="user-1", answers=_make_answers())
        result = await use_case.execute(dto)

        assessment_repo.create.assert_not_called()
        assert result.status == "completed"
