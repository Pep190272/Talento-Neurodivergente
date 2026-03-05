"""Security tests for intelligence-service input validation."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.api.schemas import GenerateReportRequest


class TestReportInputValidation:
    def test_valid_request(self):
        req = GenerateReportRequest(
            candidate_id="abc123",
            report_type="candidate_summary",
        )
        assert req.candidate_id == "abc123"

    def test_empty_candidate_id(self):
        with pytest.raises(ValidationError):
            GenerateReportRequest(candidate_id="", report_type="candidate_summary")

    def test_candidate_id_too_long(self):
        with pytest.raises(ValidationError):
            GenerateReportRequest(
                candidate_id="a" * 26,
                report_type="candidate_summary",
            )

    def test_invalid_report_type(self):
        with pytest.raises(ValidationError):
            GenerateReportRequest(
                candidate_id="abc",
                report_type="malicious_type",
            )

    def test_match_score_bounds(self):
        with pytest.raises(ValidationError):
            GenerateReportRequest(
                candidate_id="abc",
                report_type="match_analysis",
                match_score=101.0,
            )

    def test_vector_similarity_bounds(self):
        with pytest.raises(ValidationError):
            GenerateReportRequest(
                candidate_id="abc",
                report_type="match_analysis",
                vector_similarity=1.5,
            )

    def test_all_valid_report_types(self):
        for report_type in ["candidate_summary", "match_analysis", "accommodation_guide", "team_fit"]:
            req = GenerateReportRequest(
                candidate_id="abc",
                report_type=report_type,
            )
            assert req.report_type == report_type
