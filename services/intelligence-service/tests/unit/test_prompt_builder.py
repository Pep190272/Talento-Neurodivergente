"""Unit tests for PromptBuilder — validates prompt construction for each report type."""

import pytest

from shared.domain import NeuroVector24D

from app.domain.entities.talent_report import ReportType
from app.domain.services.anonymizer import Anonymizer
from app.domain.services.prompt_builder import PromptBuilder, SYSTEM_PROMPT


@pytest.fixture
def builder() -> PromptBuilder:
    return PromptBuilder()


@pytest.fixture
def anonymizer() -> Anonymizer:
    return Anonymizer()


@pytest.fixture
def sample_profile(anonymizer: Anonymizer):
    vec = NeuroVector24D(attention=0.9, memory=0.7, creative_thinking=0.85)
    return anonymizer.anonymize_vector(vec, "candidate")


@pytest.fixture
def sample_match(anonymizer: Anonymizer):
    c_vec = NeuroVector24D(attention=0.9, creative_thinking=0.85)
    j_vec = NeuroVector24D(attention=0.8, creative_thinking=0.7)
    return anonymizer.anonymize_match(c_vec, j_vec, 82.0, 0.92, 0.75)


class TestCandidateSummary:
    def test_builds_candidate_summary(self, builder: PromptBuilder, sample_profile):
        prompt = builder.build(ReportType.CANDIDATE_SUMMARY, profile=sample_profile)
        assert SYSTEM_PROMPT in prompt
        assert "cognitive strengths" in prompt.lower()
        assert "attention" in prompt

    def test_requires_profile(self, builder: PromptBuilder):
        with pytest.raises(ValueError, match="Profile required"):
            builder.build(ReportType.CANDIDATE_SUMMARY)


class TestMatchAnalysis:
    def test_builds_match_analysis(self, builder: PromptBuilder, sample_match):
        prompt = builder.build(ReportType.MATCH_ANALYSIS, match=sample_match)
        assert SYSTEM_PROMPT in prompt
        assert "alignment" in prompt.lower()
        assert "CANDIDATE" in prompt
        assert "JOB IDEAL PROFILE" in prompt

    def test_requires_match(self, builder: PromptBuilder):
        with pytest.raises(ValueError, match="Match context required"):
            builder.build(ReportType.MATCH_ANALYSIS)


class TestAccommodationGuide:
    def test_builds_accommodation_guide(self, builder: PromptBuilder, sample_profile):
        prompt = builder.build(ReportType.ACCOMMODATION_GUIDE, profile=sample_profile)
        assert "accommodation" in prompt.lower()
        assert "NICE" in prompt
        assert "environmental" in prompt.lower()

    def test_requires_profile(self, builder: PromptBuilder):
        with pytest.raises(ValueError):
            builder.build(ReportType.ACCOMMODATION_GUIDE)


class TestTeamFit:
    def test_builds_team_fit(self, builder: PromptBuilder, sample_match):
        prompt = builder.build(ReportType.TEAM_FIT, match=sample_match)
        assert "team" in prompt.lower()
        assert "dynamic" in prompt.lower()


class TestSystemPromptRules:
    def test_system_prompt_enforces_anonymity(self):
        assert "NEVER attempt to identify" in SYSTEM_PROMPT

    def test_system_prompt_enforces_strengths_focus(self):
        assert "strengths" in SYSTEM_PROMPT.lower()

    def test_system_prompt_references_clinical_frameworks(self):
        assert "DSM-5" in SYSTEM_PROMPT or "NICE" in SYSTEM_PROMPT
