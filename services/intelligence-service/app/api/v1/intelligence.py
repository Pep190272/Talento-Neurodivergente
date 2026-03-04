"""Intelligence API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_generate_report_use_case, get_report_repo
from app.application.dto.report_dto import GenerateReportDTO
from app.application.use_cases.generate_report import GenerateReportUseCase
from app.infrastructure.persistence.report_repository import SQLAlchemyReportRepository
from shared.auth import TokenPayload

from ..schemas import GenerateReportRequest, ReportResponse

router = APIRouter(prefix="/api/v1/ai", tags=["intelligence"])


@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    request: GenerateReportRequest,
    _user: TokenPayload = Depends(get_current_user),
    use_case: GenerateReportUseCase = Depends(get_generate_report_use_case),
) -> ReportResponse:
    """Generate an AI talent report from anonymized data."""
    dto = GenerateReportDTO(
        candidate_id=request.candidate_id,
        report_type=request.report_type,
        job_id=request.job_id,
        candidate_vector_data=request.candidate_vector,
        job_vector_data=request.job_vector,
        match_score=request.match_score,
        vector_similarity=request.vector_similarity,
        accommodation_coverage=request.accommodation_coverage,
    )
    result = await use_case.execute(dto)
    return ReportResponse(
        report_id=result.report_id,
        report_type=result.report_type,
        status=result.status,
        content=result.content,
        model_name=result.model_name,
        tokens_used=result.tokens_used,
    )


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    _user: TokenPayload = Depends(get_current_user),
    report_repo: SQLAlchemyReportRepository = Depends(get_report_repo),
) -> ReportResponse:
    """Get a previously generated report."""
    report = await report_repo.find_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse(
        report_id=report.id,
        report_type=report.report_type.value,
        status=report.status.value,
        content=report.content,
        model_name=report.model_name,
        tokens_used=report.tokens_used,
    )


@router.get("/reports/candidate/{candidate_id}", response_model=list[ReportResponse])
async def get_candidate_reports(
    candidate_id: str,
    _user: TokenPayload = Depends(get_current_user),
    report_repo: SQLAlchemyReportRepository = Depends(get_report_repo),
) -> list[ReportResponse]:
    """Get all reports for a candidate."""
    reports = await report_repo.find_by_candidate(candidate_id)
    return [
        ReportResponse(
            report_id=r.id,
            report_type=r.report_type.value,
            status=r.status.value,
            content=r.content,
            model_name=r.model_name,
            tokens_used=r.tokens_used,
        )
        for r in reports
    ]
