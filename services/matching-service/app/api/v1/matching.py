"""Matching API routes — wired to use cases via DI."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from shared.auth import TokenPayload

from ..deps import (
    get_calculate_match_use_case,
    get_current_user,
    get_match_repo,
)
from ..schemas import CalculateMatchRequest, MatchBreakdownResponse, MatchResponse
from app.application.dto.matching_dto import CalculateMatchDTO
from app.application.use_cases.calculate_match import (
    CalculateMatchUseCase,
    CandidateNotFoundError,
    CandidateNotMatchableError,
    JobNotActiveError,
    JobNotFoundError,
)
from app.infrastructure.persistence.match_repository import SQLAlchemyMatchRepository

router = APIRouter(prefix="/api/v1/matching", tags=["matching"])


def _match_to_response(r) -> MatchResponse:
    return MatchResponse(
        match_id=r.match_id,
        candidate_id=r.candidate_id,
        job_id=r.job_id,
        therapist_id=r.therapist_id,
        total_score=r.total_score,
        breakdown=MatchBreakdownResponse(
            vector_score=r.vector_score,
            accommodation_score=r.accommodation_score,
            therapist_score=r.therapist_score,
            preferences_score=r.preferences_score,
        ),
        status=r.status,
    )


@router.post("/calculate", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def calculate_match(
    body: CalculateMatchRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: CalculateMatchUseCase = Depends(get_calculate_match_use_case),
) -> MatchResponse:
    """Calculate match between a candidate and a job."""
    try:
        result = await use_case.execute(
            CalculateMatchDTO(
                candidate_id=body.candidate_id,
                job_id=body.job_id,
                therapist_id=body.therapist_id,
                therapist_score=body.therapist_score,
                therapist_notes=body.therapist_notes,
            )
        )
    except CandidateNotFoundError:
        raise HTTPException(status_code=404, detail="Candidate not found")
    except CandidateNotMatchableError:
        raise HTTPException(status_code=400, detail="Candidate has not completed assessment")
    except JobNotFoundError:
        raise HTTPException(status_code=404, detail="Job not found")
    except JobNotActiveError:
        raise HTTPException(status_code=400, detail="Job is not active")

    return _match_to_response(result)


@router.get("/candidates/{candidate_id}/matches", response_model=list[MatchResponse])
async def get_candidate_matches(
    candidate_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    match_repo: SQLAlchemyMatchRepository = Depends(get_match_repo),
) -> list[MatchResponse]:
    """Get all matches for a candidate, sorted by score descending."""
    matches = await match_repo.find_by_candidate(candidate_id)
    return [
        MatchResponse(
            match_id=m.id,
            candidate_id=m.candidate_id,
            job_id=m.job_id,
            therapist_id=m.therapist_id,
            total_score=m.score.value,
            breakdown=MatchBreakdownResponse(
                vector_score=m.breakdown.vector_score,
                accommodation_score=m.breakdown.accommodation_score,
                therapist_score=m.breakdown.therapist_score,
                preferences_score=m.breakdown.preferences_score,
            ),
            status=m.status.value,
        )
        for m in matches
    ]


@router.get("/jobs/{job_id}/matches", response_model=list[MatchResponse])
async def get_job_matches(
    job_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    match_repo: SQLAlchemyMatchRepository = Depends(get_match_repo),
) -> list[MatchResponse]:
    """Get all matches for a job, sorted by score descending."""
    matches = await match_repo.find_by_job(job_id)
    return [
        MatchResponse(
            match_id=m.id,
            candidate_id=m.candidate_id,
            job_id=m.job_id,
            therapist_id=m.therapist_id,
            total_score=m.score.value,
            breakdown=MatchBreakdownResponse(
                vector_score=m.breakdown.vector_score,
                accommodation_score=m.breakdown.accommodation_score,
                therapist_score=m.breakdown.therapist_score,
                preferences_score=m.breakdown.preferences_score,
            ),
            status=m.status.value,
        )
        for m in matches
    ]
