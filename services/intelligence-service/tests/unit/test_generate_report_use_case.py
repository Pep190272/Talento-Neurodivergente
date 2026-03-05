"""Unit tests for GenerateReportUseCase — mocked LLM, no IO."""

from unittest.mock import AsyncMock

import pytest

from app.application.dto.report_dto import GenerateReportDTO
from app.application.interfaces.i_llm_client import LLMResponse
from app.application.use_cases.generate_report import GenerateReportUseCase


def _mock_llm_client(content: str = "Great candidate analysis...") -> AsyncMock:
    client = AsyncMock()
    client.generate = AsyncMock(
        return_value=LLMResponse(content=content, model_name="llama3.2", tokens_used=120)
    )
    return client


def _mock_report_repo() -> AsyncMock:
    repo = AsyncMock()
    repo.create = AsyncMock(side_effect=lambda r: r)
    repo.update = AsyncMock(side_effect=lambda r: r)
    return repo


class TestGenerateReportUseCase:
    @pytest.mark.asyncio
    async def test_successful_candidate_summary(self):
        repo = _mock_report_repo()
        llm = _mock_llm_client()
        use_case = GenerateReportUseCase(repo, llm)

        dto = GenerateReportDTO(
            candidate_id="c1",
            report_type="candidate_summary",
            candidate_vector_data={"attention": 0.9, "memory": 0.7},
        )
        result = await use_case.execute(dto)

        assert result.status == "completed"
        assert result.content == "Great candidate analysis..."
        assert result.model_name == "llama3.2"
        assert result.tokens_used == 120
        llm.generate.assert_called_once()

    @pytest.mark.asyncio
    async def test_successful_match_analysis(self):
        repo = _mock_report_repo()
        llm = _mock_llm_client("Match analysis: strong alignment on attention")
        use_case = GenerateReportUseCase(repo, llm)

        dto = GenerateReportDTO(
            candidate_id="c1",
            report_type="match_analysis",
            job_id="j1",
            candidate_vector_data={"attention": 0.9},
            job_vector_data={"attention": 0.8},
            match_score=85.0,
            vector_similarity=0.95,
            accommodation_coverage=0.75,
        )
        result = await use_case.execute(dto)

        assert result.status == "completed"
        assert "alignment" in result.content.lower()

    @pytest.mark.asyncio
    async def test_llm_failure_marks_report_failed(self):
        repo = _mock_report_repo()
        llm = AsyncMock()
        llm.generate = AsyncMock(side_effect=ConnectionError("Ollama unavailable"))
        use_case = GenerateReportUseCase(repo, llm)

        dto = GenerateReportDTO(
            candidate_id="c1",
            report_type="candidate_summary",
            candidate_vector_data={"attention": 0.9},
        )
        result = await use_case.execute(dto)

        assert result.status == "failed"
        assert "unavailable" in result.content.lower()

    @pytest.mark.asyncio
    async def test_report_persisted_on_success(self):
        repo = _mock_report_repo()
        llm = _mock_llm_client()
        use_case = GenerateReportUseCase(repo, llm)

        dto = GenerateReportDTO(
            candidate_id="c1",
            report_type="candidate_summary",
            candidate_vector_data={"attention": 0.9},
        )
        await use_case.execute(dto)

        repo.create.assert_called_once()
        repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_report_persisted_on_failure(self):
        repo = _mock_report_repo()
        llm = AsyncMock()
        llm.generate = AsyncMock(side_effect=RuntimeError("boom"))
        use_case = GenerateReportUseCase(repo, llm)

        dto = GenerateReportDTO(
            candidate_id="c1",
            report_type="candidate_summary",
            candidate_vector_data={"attention": 0.9},
        )
        await use_case.execute(dto)

        # Report should still be persisted even on failure
        repo.create.assert_called_once()
        repo.update.assert_called_once()
