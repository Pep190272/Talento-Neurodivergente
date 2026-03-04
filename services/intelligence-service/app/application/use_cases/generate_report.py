"""Use case: Generate an AI talent report using anonymized data."""

from __future__ import annotations

from shared.domain import NeuroVector24D

from ..dto.report_dto import GenerateReportDTO, ReportResultDTO
from ..interfaces.i_llm_client import ILLMClient
from ...domain.entities.talent_report import ReportError, ReportType, TalentReport
from ...domain.repositories.i_report_repository import IReportRepository
from ...domain.services.anonymizer import Anonymizer
from ...domain.services.prompt_builder import PromptBuilder


class GenerateReportUseCase:
    """Orchestrates report generation: anonymize → prompt → LLM → persist."""

    def __init__(
        self,
        report_repo: IReportRepository,
        llm_client: ILLMClient,
        anonymizer: Anonymizer | None = None,
        prompt_builder: PromptBuilder | None = None,
    ) -> None:
        self._report_repo = report_repo
        self._llm_client = llm_client
        self._anonymizer = anonymizer or Anonymizer()
        self._prompt_builder = prompt_builder or PromptBuilder()

    async def execute(self, dto: GenerateReportDTO) -> ReportResultDTO:
        report_type = ReportType(dto.report_type)

        # Create report entity
        report = TalentReport(
            report_type=report_type,
            candidate_id=dto.candidate_id,
            job_id=dto.job_id,
        )
        report = await self._report_repo.create(report)
        report.mark_generating()

        try:
            # Build anonymized context
            profile = None
            match_ctx = None

            if dto.candidate_vector_data:
                candidate_vector = NeuroVector24D(**dto.candidate_vector_data)
                profile = self._anonymizer.anonymize_vector(candidate_vector, "candidate")

                if dto.job_vector_data and dto.match_score is not None:
                    job_vector = NeuroVector24D(**dto.job_vector_data)
                    match_ctx = self._anonymizer.anonymize_match(
                        candidate_vector=candidate_vector,
                        job_vector=job_vector,
                        match_score=dto.match_score,
                        vector_similarity=dto.vector_similarity or 0.0,
                        accommodation_coverage=dto.accommodation_coverage or 0.0,
                    )

            # Build prompt
            prompt = self._prompt_builder.build(report_type, profile=profile, match=match_ctx)
            report.prompt_used = prompt

            # Call LLM
            llm_response = await self._llm_client.generate(prompt)

            # Complete report
            report.complete(
                content=llm_response.content,
                model_name=llm_response.model_name,
                tokens_used=llm_response.tokens_used,
            )

        except Exception as e:
            report.fail(str(e))

        await self._report_repo.update(report)

        return ReportResultDTO(
            report_id=report.id,
            report_type=report.report_type.value,
            status=report.status.value,
            content=report.content,
            model_name=report.model_name,
            tokens_used=report.tokens_used,
        )
