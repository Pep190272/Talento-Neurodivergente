"""Unit tests for TalentReport entity."""

import pytest

from app.domain.entities.talent_report import (
    ReportError,
    ReportStatus,
    ReportType,
    TalentReport,
)


class TestReportCreation:
    def test_new_report_is_pending(self):
        report = TalentReport(candidate_id="c1", report_type=ReportType.CANDIDATE_SUMMARY)
        assert report.status == ReportStatus.PENDING
        assert report.content == ""

    def test_report_types(self):
        for rt in ReportType:
            report = TalentReport(candidate_id="c1", report_type=rt)
            assert report.report_type == rt


class TestReportLifecycle:
    def test_mark_generating(self):
        report = TalentReport(candidate_id="c1")
        report.mark_generating()
        assert report.status == ReportStatus.GENERATING

    def test_complete_report(self):
        report = TalentReport(candidate_id="c1")
        report.mark_generating()
        report.complete(
            content="This candidate shows strong attention to detail...",
            model_name="llama3.2",
            tokens_used=150,
        )
        assert report.is_completed()
        assert report.status == ReportStatus.COMPLETED
        assert "attention" in report.content
        assert report.model_name == "llama3.2"
        assert report.tokens_used == 150

    def test_empty_content_raises(self):
        report = TalentReport(candidate_id="c1")
        with pytest.raises(ReportError, match="empty"):
            report.complete(content="", model_name="llama3.2", tokens_used=0)

    def test_whitespace_content_raises(self):
        report = TalentReport(candidate_id="c1")
        with pytest.raises(ReportError, match="empty"):
            report.complete(content="   ", model_name="llama3.2", tokens_used=0)

    def test_fail_report(self):
        report = TalentReport(candidate_id="c1")
        report.mark_generating()
        report.fail("Ollama timeout")
        assert report.status == ReportStatus.FAILED
        assert "timeout" in report.content.lower()

    def test_fail_without_reason(self):
        report = TalentReport(candidate_id="c1")
        report.fail()
        assert report.status == ReportStatus.FAILED
        assert "failed" in report.content.lower()
