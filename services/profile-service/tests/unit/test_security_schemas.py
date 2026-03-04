"""Security tests for profile-service input validation."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.api.schemas import (
    CreateProfileRequest,
    QuizAnswerRequest,
    SubmitQuizRequest,
    TherapistRegisterRequest,
)


class TestProfileInputValidation:
    def test_valid_profile(self):
        req = CreateProfileRequest(role="candidate", display_name="Ana")
        assert req.role == "candidate"

    def test_invalid_role_rejected(self):
        with pytest.raises(ValidationError):
            CreateProfileRequest(role="hacker")

    def test_display_name_max_length(self):
        with pytest.raises(ValidationError):
            CreateProfileRequest(role="candidate", display_name="x" * 256)

    def test_bio_max_length(self):
        with pytest.raises(ValidationError):
            CreateProfileRequest(role="candidate", bio="x" * 5001)


class TestQuizInputValidation:
    def test_valid_answer(self):
        ans = QuizAnswerRequest(question_id="q1", dimension="attention", value=0.5)
        assert ans.value == 0.5

    def test_value_too_high(self):
        with pytest.raises(ValidationError):
            QuizAnswerRequest(question_id="q1", dimension="attention", value=1.1)

    def test_value_too_low(self):
        with pytest.raises(ValidationError):
            QuizAnswerRequest(question_id="q1", dimension="attention", value=-0.1)

    def test_empty_question_id(self):
        with pytest.raises(ValidationError):
            QuizAnswerRequest(question_id="", dimension="attention", value=0.5)

    def test_empty_answers_rejected(self):
        with pytest.raises(ValidationError):
            SubmitQuizRequest(answers=[])


class TestTherapistInputValidation:
    def test_valid_therapist(self):
        req = TherapistRegisterRequest(specialty="Neuropsychology")
        assert req.specialty == "Neuropsychology"

    def test_specialty_too_short(self):
        with pytest.raises(ValidationError):
            TherapistRegisterRequest(specialty="X")

    def test_specialty_too_long(self):
        with pytest.raises(ValidationError):
            TherapistRegisterRequest(specialty="x" * 256)

    def test_bio_max_length(self):
        with pytest.raises(ValidationError):
            TherapistRegisterRequest(specialty="Neuro", bio="x" * 5001)

    def test_too_many_support_areas(self):
        with pytest.raises(ValidationError):
            TherapistRegisterRequest(
                specialty="Neuro",
                support_areas=[f"area-{i}" for i in range(21)],
            )
