"""Intelligence API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..schemas import GenerateReportRequest, ReportResponse

router = APIRouter(prefix="/api/v1/ai", tags=["intelligence"])


@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(request: GenerateReportRequest) -> ReportResponse:
    """Generate an AI talent report from anonymized data."""
    # TODO: Wire to GenerateReportUseCase with DI
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Report generation endpoint — awaiting LLM integration",
    )


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str) -> ReportResponse:
    """Get a previously generated report."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get report endpoint — awaiting persistence layer",
    )


@router.get("/reports/candidate/{candidate_id}", response_model=list[ReportResponse])
async def get_candidate_reports(candidate_id: str) -> list[ReportResponse]:
    """Get all reports for a candidate."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Candidate reports endpoint — awaiting persistence layer",
    )
