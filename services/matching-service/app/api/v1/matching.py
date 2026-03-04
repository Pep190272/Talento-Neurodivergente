"""Matching API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..schemas import CalculateMatchRequest, MatchBreakdownResponse, MatchResponse

router = APIRouter(prefix="/api/v1/matching", tags=["matching"])


@router.post("/calculate", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def calculate_match(request: CalculateMatchRequest) -> MatchResponse:
    """Calculate match between a candidate and a job.

    This endpoint will be wired to the CalculateMatchUseCase
    once the persistence layer is connected.
    """
    # TODO: Wire to use case with DI when persistence is ready
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Matching calculation endpoint — awaiting persistence layer",
    )


@router.get("/candidates/{candidate_id}/matches", response_model=list[MatchResponse])
async def get_candidate_matches(candidate_id: str) -> list[MatchResponse]:
    """Get all matches for a candidate, sorted by score descending."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Candidate matches endpoint — awaiting persistence layer",
    )


@router.get("/jobs/{job_id}/matches", response_model=list[MatchResponse])
async def get_job_matches(job_id: str) -> list[MatchResponse]:
    """Get all matches for a job, sorted by score descending."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Job matches endpoint — awaiting persistence layer",
    )
