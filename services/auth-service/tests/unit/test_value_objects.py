"""Unit tests for shared value objects — Email, Score, NeuroVector24D."""

import pytest

from shared.domain import Email, Score, NeuroVector24D


class TestEmail:
    def test_valid_email(self):
        email = Email("User@Example.COM")
        assert str(email) == "user@example.com"

    def test_invalid_email_raises(self):
        with pytest.raises(ValueError, match="Invalid email"):
            Email("not-an-email")

    def test_empty_email_raises(self):
        with pytest.raises(ValueError):
            Email("")

    def test_email_equality(self):
        assert Email("a@b.com") == Email("A@B.COM")

    def test_email_is_immutable(self):
        email = Email("test@example.com")
        with pytest.raises(AttributeError):
            email.value = "other@example.com"


class TestScore:
    def test_valid_score(self):
        score = Score(85.5)
        assert float(score) == 85.5

    def test_zero_score(self):
        score = Score(0.0)
        assert float(score) == 0.0

    def test_max_score(self):
        score = Score(100.0)
        assert float(score) == 100.0

    def test_negative_score_raises(self):
        with pytest.raises(ValueError):
            Score(-1.0)

    def test_over_100_raises(self):
        with pytest.raises(ValueError):
            Score(100.1)

    def test_meets_threshold(self):
        assert Score(75.0).meets_threshold(60.0) is True
        assert Score(50.0).meets_threshold(60.0) is False


class TestNeuroVector24D:
    def test_default_vector_has_24_dimensions(self):
        vec = NeuroVector24D()
        assert len(vec.to_list()) == 24
        assert all(v == 0.5 for v in vec.to_list())

    def test_custom_dimensions(self):
        vec = NeuroVector24D(attention=0.9, memory=0.1)
        assert vec.attention == 0.9
        assert vec.memory == 0.1
        assert vec.processing_speed == 0.5  # default

    def test_invalid_dimension_raises(self):
        with pytest.raises(ValueError, match="must be 0.0-1.0"):
            NeuroVector24D(attention=1.5)

    def test_negative_dimension_raises(self):
        with pytest.raises(ValueError, match="must be 0.0-1.0"):
            NeuroVector24D(memory=-0.1)

    def test_from_list(self):
        values = [round(i / 23.0, 4) for i in range(24)]  # 0.0 to 1.0
        vec = NeuroVector24D.from_list(values)
        assert len(vec.to_list()) == 24
        assert vec.attention == values[0]
        assert vec.technical_depth == values[23]

    def test_from_list_wrong_length_raises(self):
        with pytest.raises(ValueError, match="Expected 24"):
            NeuroVector24D.from_list([0.5] * 10)

    def test_from_dict(self):
        vec = NeuroVector24D.from_dict({"attention": 0.8, "memory": 0.3})
        assert vec.attention == 0.8
        assert vec.memory == 0.3

    def test_cosine_similarity_identical(self):
        vec = NeuroVector24D(attention=0.9, memory=0.1)
        assert vec.cosine_similarity(vec) == pytest.approx(1.0, abs=1e-6)

    def test_cosine_similarity_different(self):
        vec1 = NeuroVector24D(attention=1.0, memory=0.0, processing_speed=0.0)
        vec2 = NeuroVector24D(attention=0.0, memory=1.0, processing_speed=0.0)
        sim = vec1.cosine_similarity(vec2)
        assert 0.0 < sim < 1.0

    def test_cosine_similarity_zero_vector(self):
        zero = NeuroVector24D.from_list([0.0] * 24)
        other = NeuroVector24D()
        assert zero.cosine_similarity(other) == 0.0

    def test_euclidean_distance_same_vector(self):
        vec = NeuroVector24D()
        assert vec.euclidean_distance(vec) == pytest.approx(0.0)

    def test_cognitive_score(self):
        vec = NeuroVector24D(
            attention=0.8, memory=0.6, processing_speed=0.7,
            pattern_recognition=0.9, creative_thinking=0.5,
            analytical_thinking=0.4, verbal_reasoning=0.3, spatial_reasoning=0.8
        )
        expected = (0.8 + 0.6 + 0.7 + 0.9 + 0.5 + 0.4 + 0.3 + 0.8) / 8
        assert vec.cognitive_score == pytest.approx(expected)

    def test_stress_index(self):
        vec = NeuroVector24D(
            stress_tolerance=0.8,
            deadline_management=0.6,
            sensory_sensitivity=0.2,
        )
        expected = (0.8 + 0.6 + (1.0 - 0.2)) / 3.0
        assert vec.stress_index == pytest.approx(expected)

    def test_autonomy_index(self):
        vec = NeuroVector24D(autonomy=0.9, structure_need=0.1)
        expected = (0.9 + (1.0 - 0.1)) / 2.0
        assert vec.autonomy_index == pytest.approx(expected)

    def test_is_immutable(self):
        vec = NeuroVector24D()
        with pytest.raises(AttributeError):
            vec.attention = 0.9
