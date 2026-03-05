"""Use case: Submit neurocognitive quiz answers and calculate neuro-vector."""

from __future__ import annotations

from ..dto.profile_dto import AssessmentResultDTO, SubmitQuizDTO
from ...domain.entities.assessment import Assessment, AssessmentError, QuizAnswer
from ...domain.entities.profile import ProfileNotFoundError
from ...domain.repositories.i_assessment_repository import IAssessmentRepository
from ...domain.repositories.i_profile_repository import IProfileRepository


class SubmitQuizUseCase:
    """Receive quiz answers, calculate NeuroVector24D, update profile."""

    def __init__(
        self,
        assessment_repo: IAssessmentRepository,
        profile_repo: IProfileRepository,
    ) -> None:
        self._assessment_repo = assessment_repo
        self._profile_repo = profile_repo

    async def execute(self, dto: SubmitQuizDTO) -> AssessmentResultDTO:
        # Validate profile exists
        profile = await self._profile_repo.find_by_user_id(dto.user_id)
        if profile is None:
            raise ProfileNotFoundError(f"Profile not found for user '{dto.user_id}'")

        # Create or resume assessment
        assessment = await self._assessment_repo.find_active_by_user(dto.user_id)
        if assessment is None:
            assessment = Assessment(user_id=dto.user_id)
            assessment = await self._assessment_repo.create(assessment)

        # Add all answers
        for answer_dto in dto.answers:
            answer = QuizAnswer(
                question_id=answer_dto.question_id,
                dimension=answer_dto.dimension,
                value=answer_dto.value,
            )
            assessment.add_answer(answer)

        # Complete assessment → calculates neuro-vector
        vector = assessment.complete()
        await self._assessment_repo.update(assessment)

        # Update profile with the calculated vector
        profile.set_neuro_vector(vector)
        await self._profile_repo.update(profile)

        vector_dims = None
        if assessment.result_vector:
            from shared.domain.value_objects import ALL_DIMENSIONS
            vector_dims = {
                dim: getattr(assessment.result_vector, dim)
                for dim in ALL_DIMENSIONS
            }

        return AssessmentResultDTO(
            assessment_id=assessment.id,
            user_id=assessment.user_id,
            status=assessment.status.value,
            is_flagged=assessment.is_flagged(),
            vector_dimensions=vector_dims,
        )
