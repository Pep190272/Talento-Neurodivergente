"""Unit tests for TrilateralScorer — the core matching algorithm.

No IO, no DB, no framework. Pure domain logic.
"""

import pytest

from shared.domain import NeuroVector24D, Score

from app.domain.entities.candidate_profile import CandidateProfile
from app.domain.entities.job import Accommodation, Job, JobStatus, Preferences, WorkMode
from app.domain.entities.match import MatchBreakdown
from app.domain.services.trilateral_scorer import TherapistAssessment, TrilateralScorer


@pytest.fixture
def scorer() -> TrilateralScorer:
    return TrilateralScorer()


def _make_candidate(
    vector: NeuroVector24D | None = None,
    accommodations: list[str] | None = None,
    prefs: Preferences | None = None,
    assessment_completed: bool = True,
) -> CandidateProfile:
    return CandidateProfile(
        user_id="candidate-1",
        neuro_vector=vector or NeuroVector24D(),
        accommodations_needed=[
            Accommodation(name=a) for a in (accommodations or [])
        ],
        preferences=prefs or Preferences(),
        assessment_completed=assessment_completed,
    )


def _make_job(
    vector: NeuroVector24D | None = None,
    accommodations: list[str] | None = None,
    prefs: Preferences | None = None,
    status: JobStatus = JobStatus.ACTIVE,
) -> Job:
    return Job(
        company_id="company-1",
        title="Test Job",
        status=status,
        ideal_vector=vector or NeuroVector24D(),
        accommodations_offered=[
            Accommodation(name=a) for a in (accommodations or [])
        ],
        preferences=prefs or Preferences(),
    )


class TestVectorScore:
    def test_identical_vectors_score_1(self, scorer: TrilateralScorer):
        vec = NeuroVector24D(attention=0.8, memory=0.6, processing_speed=0.7)
        score = scorer.calculate_vector_score(vec, vec)
        assert score == pytest.approx(1.0, abs=0.001)

    def test_different_vectors_score_less_than_1(self, scorer: TrilateralScorer):
        v1 = NeuroVector24D(attention=1.0, memory=0.0, processing_speed=0.0)
        v2 = NeuroVector24D(attention=0.0, memory=1.0, processing_speed=0.0)
        score = scorer.calculate_vector_score(v1, v2)
        assert score < 1.0

    def test_similar_vectors_score_high(self, scorer: TrilateralScorer):
        v1 = NeuroVector24D(attention=0.8, memory=0.7, creative_thinking=0.9)
        v2 = NeuroVector24D(attention=0.75, memory=0.65, creative_thinking=0.85)
        score = scorer.calculate_vector_score(v1, v2)
        assert score > 0.9

    def test_default_vectors_are_identical(self, scorer: TrilateralScorer):
        v1 = NeuroVector24D()  # All 0.5 defaults
        v2 = NeuroVector24D()
        score = scorer.calculate_vector_score(v1, v2)
        assert score == pytest.approx(1.0, abs=0.001)


class TestAccommodationScore:
    def test_no_needs_returns_1(self, scorer: TrilateralScorer):
        score = scorer.calculate_accommodation_score(set(), {"quiet room"})
        assert score == 1.0

    def test_all_needs_met_returns_1(self, scorer: TrilateralScorer):
        needs = {"quiet room", "flexible hours"}
        offers = {"quiet room", "flexible hours", "standing desk"}
        score = scorer.calculate_accommodation_score(needs, offers)
        assert score == 1.0

    def test_partial_needs_met(self, scorer: TrilateralScorer):
        needs = {"quiet room", "flexible hours", "screen reader"}
        offers = {"quiet room", "standing desk"}
        score = scorer.calculate_accommodation_score(needs, offers)
        assert score == pytest.approx(1 / 3, abs=0.01)

    def test_no_offers_returns_0(self, scorer: TrilateralScorer):
        needs = {"quiet room"}
        score = scorer.calculate_accommodation_score(needs, set())
        assert score == 0.0

    def test_case_insensitive(self, scorer: TrilateralScorer):
        """Accommodation names are lowered in the entity."""
        needs = {"quiet room"}
        offers = {"quiet room"}
        score = scorer.calculate_accommodation_score(needs, offers)
        assert score == 1.0


class TestTherapistScore:
    def test_no_therapist_returns_sentinel(self, scorer: TrilateralScorer):
        score = scorer.calculate_therapist_score(None)
        assert score == -1.0

    def test_therapist_score_passed_through(self, scorer: TrilateralScorer):
        assessment = TherapistAssessment(
            candidate_id="c1", job_id="j1", therapist_id="t1", score=0.85
        )
        score = scorer.calculate_therapist_score(assessment)
        assert score == 0.85

    def test_invalid_therapist_score_raises(self):
        with pytest.raises(ValueError):
            TherapistAssessment(
                candidate_id="c1", job_id="j1", therapist_id="t1", score=1.5
            )


class TestPreferencesScore:
    def test_identical_preferences_score_1(self, scorer: TrilateralScorer):
        prefs = Preferences(work_mode=WorkMode.REMOTE, max_hours_per_week=40)
        score = scorer.calculate_preferences_score(prefs, prefs)
        assert score == pytest.approx(1.0, abs=0.01)

    def test_different_work_mode_reduces_score(self, scorer: TrilateralScorer):
        p1 = Preferences(work_mode=WorkMode.REMOTE)
        p2 = Preferences(work_mode=WorkMode.ONSITE)
        score = scorer.calculate_preferences_score(p1, p2)
        # work_mode=0.0, hours=1.0, team=1.0 → ~0.67
        assert score < 1.0
        assert score > 0.5

    def test_hybrid_partially_matches(self, scorer: TrilateralScorer):
        p1 = Preferences(work_mode=WorkMode.REMOTE)
        p2 = Preferences(work_mode=WorkMode.HYBRID)
        score_hybrid = scorer.calculate_preferences_score(p1, p2)
        p3 = Preferences(work_mode=WorkMode.ONSITE)
        score_onsite = scorer.calculate_preferences_score(p1, p3)
        assert score_hybrid > score_onsite

    def test_non_overlapping_hours_reduces_score(self, scorer: TrilateralScorer):
        p1 = Preferences(min_hours_per_week=10, max_hours_per_week=20)
        p2 = Preferences(min_hours_per_week=30, max_hours_per_week=40)
        score = scorer.calculate_preferences_score(p1, p2)
        # hours=0.0, but work_mode and team overlap → > 0
        assert score < 0.8


class TestMatchBreakdown:
    def test_total_with_therapist(self):
        bd = MatchBreakdown(
            vector_score=0.8,
            accommodation_score=0.6,
            therapist_score=0.9,
            preferences_score=0.7,
        )
        expected = 0.8 * 0.5 + 0.6 * 0.25 + 0.9 * 0.15 + 0.7 * 0.10
        assert bd.total == pytest.approx(expected, abs=0.001)

    def test_total_without_therapist_redistributes(self):
        bd = MatchBreakdown(
            vector_score=0.8,
            accommodation_score=0.6,
            therapist_score=-1.0,  # sentinel
            preferences_score=0.7,
        )
        # Redistributed: vec gets 60.05%, acc gets 29.95%
        w_vec = 0.50 + 0.15 * 0.67  # ≈ 0.6005
        w_acc = 0.25 + 0.15 * 0.33  # ≈ 0.2995
        expected = 0.8 * w_vec + 0.6 * w_acc + 0.7 * 0.10
        assert bd.total == pytest.approx(expected, abs=0.001)

    def test_total_score_is_score_object(self):
        bd = MatchBreakdown(vector_score=1.0, accommodation_score=1.0, therapist_score=1.0, preferences_score=1.0)
        assert isinstance(bd.total_score, Score)
        assert bd.total_score.value == 100.0

    def test_zero_breakdown(self):
        bd = MatchBreakdown()
        assert bd.total == 0.0


class TestFullMatchCalculation:
    def test_perfect_match_with_therapist(self, scorer: TrilateralScorer):
        vec = NeuroVector24D(
            attention=0.8, memory=0.7, processing_speed=0.6,
            pattern_recognition=0.5, creative_thinking=0.9,
        )
        candidate = _make_candidate(
            vector=vec,
            accommodations=["quiet room", "flexible hours"],
        )
        job = _make_job(
            vector=vec,
            accommodations=["quiet room", "flexible hours"],
        )
        assessment = TherapistAssessment(
            candidate_id="candidate-1", job_id=job.id,
            therapist_id="therapist-1", score=0.95,
        )
        match = scorer.calculate_match(candidate, job, assessment)

        assert match.score.value > 90
        assert match.breakdown.vector_score == pytest.approx(1.0, abs=0.01)
        assert match.breakdown.accommodation_score == 1.0
        assert match.breakdown.therapist_score == 0.95
        assert match.candidate_id == "candidate-1"
        assert match.therapist_id == "therapist-1"

    def test_match_without_therapist(self, scorer: TrilateralScorer):
        candidate = _make_candidate(
            vector=NeuroVector24D(attention=0.8, creative_thinking=0.9),
        )
        job = _make_job(
            vector=NeuroVector24D(attention=0.8, creative_thinking=0.9),
        )
        match = scorer.calculate_match(candidate, job)

        assert match.therapist_id is None
        assert match.breakdown.therapist_score == -1.0
        assert match.score.value > 0

    def test_poor_match_scores_low(self, scorer: TrilateralScorer):
        candidate = _make_candidate(
            vector=NeuroVector24D(attention=1.0, memory=0.0),
            accommodations=["screen reader", "braille display"],
            prefs=Preferences(work_mode=WorkMode.REMOTE, min_hours_per_week=10, max_hours_per_week=15),
        )
        job = _make_job(
            vector=NeuroVector24D(attention=0.0, memory=1.0),
            accommodations=["standing desk"],
            prefs=Preferences(work_mode=WorkMode.ONSITE, min_hours_per_week=35, max_hours_per_week=40),
        )
        match = scorer.calculate_match(candidate, job)
        assert match.score.value < 60

    def test_match_returns_valid_entity(self, scorer: TrilateralScorer):
        candidate = _make_candidate()
        job = _make_job()
        match = scorer.calculate_match(candidate, job)

        assert match.id  # Has an ID
        assert match.candidate_id == "candidate-1"
        assert match.job_id == job.id
        assert 0 <= match.score.value <= 100


class TestMatchEntity:
    def test_accept_active_match(self):
        from app.domain.entities.match import Match, MatchStatus
        match = Match(candidate_id="c1", job_id="j1", status=MatchStatus.ACTIVE)
        match.accept()
        assert match.status == MatchStatus.ACCEPTED

    def test_reject_active_match(self):
        from app.domain.entities.match import Match, MatchStatus
        match = Match(candidate_id="c1", job_id="j1", status=MatchStatus.ACTIVE)
        match.reject()
        assert match.status == MatchStatus.REJECTED

    def test_cannot_accept_pending_match(self):
        from app.domain.entities.match import Match, MatchError, MatchStatus
        match = Match(candidate_id="c1", job_id="j1", status=MatchStatus.PENDING)
        with pytest.raises(MatchError):
            match.accept()

    def test_expire_match(self):
        from app.domain.entities.match import Match, MatchStatus
        match = Match(candidate_id="c1", job_id="j1")
        match.expire()
        assert match.status == MatchStatus.EXPIRED

    def test_is_strong_match(self):
        from app.domain.entities.match import Match
        match = Match(candidate_id="c1", job_id="j1", score=Score(85))
        assert match.is_strong_match() is True
        match2 = Match(candidate_id="c1", job_id="j1", score=Score(50))
        assert match2.is_strong_match() is False


class TestJobEntity:
    def test_activate_job(self):
        job = Job(title="Developer", status=JobStatus.DRAFT)
        job.activate()
        assert job.is_active()

    def test_cannot_activate_without_title(self):
        from app.domain.entities.job import JobError
        job = Job(status=JobStatus.DRAFT)
        with pytest.raises(JobError):
            job.activate()

    def test_close_job(self):
        job = Job(title="Developer", status=JobStatus.ACTIVE)
        job.close()
        assert job.status == JobStatus.CLOSED
        assert not job.is_active()

    def test_accommodation_names_lowercase(self):
        job = Job(
            title="Dev",
            accommodations_offered=[
                Accommodation(name="Quiet Room"),
                Accommodation(name="Flexible Hours"),
            ],
        )
        assert job.accommodation_names() == {"quiet room", "flexible hours"}


class TestCandidateProfile:
    def test_not_matchable_without_assessment(self):
        candidate = _make_candidate(assessment_completed=False)
        assert candidate.is_matchable() is False

    def test_matchable_with_assessment(self):
        candidate = _make_candidate(assessment_completed=True)
        assert candidate.is_matchable() is True
