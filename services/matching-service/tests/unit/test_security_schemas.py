"""Security tests for input validation schemas."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.api.schemas import CalculateMatchRequest


class TestInputValidation:
    def test_valid_request(self):
        req = CalculateMatchRequest(candidate_id="abc", job_id="xyz")
        assert req.candidate_id == "abc"

    def test_empty_candidate_id_rejected(self):
        with pytest.raises(ValidationError):
            CalculateMatchRequest(candidate_id="", job_id="xyz")

    def test_candidate_id_too_long(self):
        with pytest.raises(ValidationError):
            CalculateMatchRequest(candidate_id="a" * 26, job_id="xyz")

    def test_therapist_notes_max_length(self):
        with pytest.raises(ValidationError):
            CalculateMatchRequest(
                candidate_id="abc",
                job_id="xyz",
                therapist_notes="x" * 2001,
            )

    def test_therapist_score_range(self):
        with pytest.raises(ValidationError):
            CalculateMatchRequest(
                candidate_id="abc",
                job_id="xyz",
                therapist_score=1.5,
            )

    def test_therapist_score_negative(self):
        with pytest.raises(ValidationError):
            CalculateMatchRequest(
                candidate_id="abc",
                job_id="xyz",
                therapist_score=-0.1,
            )
