"""Unit tests for Anonymizer — ensures PII is never leaked to LLM."""

import pytest

from shared.domain import NeuroVector24D
from shared.domain.value_objects import ALL_DIMENSIONS

from app.domain.services.anonymizer import AnonymizedMatch, AnonymizedProfile, Anonymizer


@pytest.fixture
def anonymizer() -> Anonymizer:
    return Anonymizer()


class TestAnonymizeVector:
    def test_produces_anonymized_profile(self, anonymizer: Anonymizer):
        vec = NeuroVector24D(attention=0.9, memory=0.7, creative_thinking=0.85)
        result = anonymizer.anonymize_vector(vec, "candidate")

        assert isinstance(result, AnonymizedProfile)
        assert result.dimensions["attention"] == 0.9
        assert result.dimensions["memory"] == 0.7
        assert result.role == "candidate"

    def test_all_24_dimensions_present(self, anonymizer: Anonymizer):
        vec = NeuroVector24D()
        result = anonymizer.anonymize_vector(vec)
        assert len(result.dimensions) == 24
        for dim in ALL_DIMENSIONS:
            assert dim in result.dimensions

    def test_computed_scores_match_vector(self, anonymizer: Anonymizer):
        vec = NeuroVector24D(attention=0.9, memory=0.8, processing_speed=0.7)
        result = anonymizer.anonymize_vector(vec)
        assert result.cognitive_score == vec.cognitive_score
        assert result.stress_index == vec.stress_index
        assert result.autonomy_index == vec.autonomy_index

    def test_no_pii_in_prompt_context(self, anonymizer: Anonymizer):
        vec = NeuroVector24D(attention=0.9)
        result = anonymizer.anonymize_vector(vec, "candidate")
        context = result.to_prompt_context()

        # Should contain dimension data
        assert "attention" in context
        assert "0.90" in context
        # Should NOT contain identifying info
        assert "user-" not in context
        assert "@" not in context


class TestAnonymizeMatch:
    def test_produces_anonymized_match(self, anonymizer: Anonymizer):
        c_vec = NeuroVector24D(attention=0.9)
        j_vec = NeuroVector24D(attention=0.8)
        result = anonymizer.anonymize_match(
            candidate_vector=c_vec,
            job_vector=j_vec,
            match_score=85.0,
            vector_similarity=0.95,
            accommodation_coverage=0.75,
        )

        assert isinstance(result, AnonymizedMatch)
        assert result.match_score == 85.0
        assert result.vector_similarity == 0.95
        assert result.accommodation_coverage == 0.75

    def test_match_prompt_context_format(self, anonymizer: Anonymizer):
        c_vec = NeuroVector24D(attention=0.9)
        j_vec = NeuroVector24D(attention=0.7)
        result = anonymizer.anonymize_match(
            c_vec, j_vec, 80.0, 0.9, 0.5
        )
        context = result.to_prompt_context()

        assert "CANDIDATE" in context
        assert "JOB IDEAL PROFILE" in context
        assert "Match Score" in context
        assert "80.0%" in context
