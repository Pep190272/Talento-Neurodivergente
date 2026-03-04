"""Unit tests for Assessment entity — quiz submission and neuro-vector calculation."""

from datetime import datetime, timedelta, timezone

import pytest

from shared.domain import NeuroVector24D

from app.domain.entities.assessment import (
    Assessment,
    AssessmentError,
    AssessmentStatus,
    MIN_COMPLETION_SECONDS,
    QuizAnswer,
)


class TestQuizAnswer:
    def test_valid_answer(self):
        answer = QuizAnswer(question_id="q1", dimension="attention", value=0.8)
        assert answer.value == 0.8
        assert answer.dimension == "attention"

    def test_answer_at_boundaries(self):
        a0 = QuizAnswer(question_id="q1", dimension="memory", value=0.0)
        a1 = QuizAnswer(question_id="q2", dimension="memory", value=1.0)
        assert a0.value == 0.0
        assert a1.value == 1.0

    def test_invalid_answer_raises(self):
        with pytest.raises(ValueError):
            QuizAnswer(question_id="q1", dimension="attention", value=1.5)

    def test_negative_answer_raises(self):
        with pytest.raises(ValueError):
            QuizAnswer(question_id="q1", dimension="attention", value=-0.1)


class TestAssessmentCreation:
    def test_new_assessment_is_in_progress(self):
        assessment = Assessment(user_id="user-1")
        assert assessment.status == AssessmentStatus.IN_PROGRESS
        assert assessment.result_vector is None
        assert not assessment.answers

    def test_add_answer(self):
        assessment = Assessment(user_id="user-1")
        answer = QuizAnswer(question_id="q1", dimension="attention", value=0.8)
        assessment.add_answer(answer)
        assert len(assessment.answers) == 1

    def test_add_replaces_same_question(self):
        assessment = Assessment(user_id="user-1")
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.5))
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.9))
        assert len(assessment.answers) == 1
        assert assessment.answers[0].value == 0.9


class TestAssessmentCompletion:
    def test_complete_calculates_vector(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.9))
        assessment.add_answer(QuizAnswer(question_id="q2", dimension="memory", value=0.7))

        vector = assessment.complete()

        assert isinstance(vector, NeuroVector24D)
        assert vector.attention == 0.9
        assert vector.memory == 0.7
        assert assessment.status == AssessmentStatus.COMPLETED
        assert assessment.completed_at is not None

    def test_missing_dimensions_default_to_0_5(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.9))

        vector = assessment.complete()

        assert vector.attention == 0.9
        assert vector.memory == 0.5  # default
        assert vector.creative_thinking == 0.5  # default

    def test_multiple_answers_per_dimension_are_averaged(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.8))
        assessment.add_answer(QuizAnswer(question_id="q2", dimension="attention", value=0.6))

        vector = assessment.complete()
        assert vector.attention == pytest.approx(0.7, abs=0.01)

    def test_empty_assessment_raises(self):
        assessment = Assessment(user_id="user-1")
        with pytest.raises(AssessmentError, match="no answers"):
            assessment.complete()


class TestAssessmentFlagging:
    def test_fast_completion_is_flagged(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(seconds=3),
        )
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.5))
        assessment.complete()

        assert assessment.is_flagged()
        assert assessment.status == AssessmentStatus.FLAGGED

    def test_normal_completion_is_not_flagged(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.5))
        assessment.complete()

        assert not assessment.is_flagged()
        assert assessment.status == AssessmentStatus.COMPLETED


class TestAssessmentLifecycle:
    def test_expire_assessment(self):
        assessment = Assessment(user_id="user-1")
        assessment.expire()
        assert assessment.status == AssessmentStatus.EXPIRED

    def test_is_completed(self):
        assessment = Assessment(
            user_id="user-1",
            started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        assert not assessment.is_completed()
        assessment.add_answer(QuizAnswer(question_id="q1", dimension="attention", value=0.5))
        assessment.complete()
        assert assessment.is_completed()
