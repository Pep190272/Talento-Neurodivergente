"""Unit tests for UserProfile entity."""

import pytest

from shared.domain import NeuroVector24D, UserRole

from app.domain.entities.profile import ProfileStatus, UserProfile


class TestProfileCreation:
    def test_new_profile_is_incomplete(self):
        profile = UserProfile(user_id="user-1", role=UserRole.CANDIDATE)
        assert profile.status == ProfileStatus.INCOMPLETE
        assert not profile.onboarding_completed
        assert not profile.is_assessment_complete()

    def test_profile_has_unique_id(self):
        p1 = UserProfile(user_id="user-1")
        p2 = UserProfile(user_id="user-2")
        assert p1.id != p2.id

    def test_profile_with_different_roles(self):
        for role in UserRole:
            profile = UserProfile(user_id="user-1", role=role)
            assert profile.role == role


class TestOnboarding:
    def test_complete_onboarding(self):
        profile = UserProfile(user_id="user-1")
        profile.complete_onboarding()
        assert profile.onboarding_completed is True
        assert profile.status == ProfileStatus.ASSESSMENT_PENDING

    def test_complete_onboarding_does_not_override_active(self):
        profile = UserProfile(user_id="user-1", status=ProfileStatus.ACTIVE)
        profile.complete_onboarding()
        assert profile.onboarding_completed is True
        assert profile.status == ProfileStatus.ACTIVE


class TestNeuroVector:
    def test_set_neuro_vector_activates_profile(self):
        profile = UserProfile(user_id="user-1")
        vec = NeuroVector24D(attention=0.9, memory=0.8)
        profile.set_neuro_vector(vec)
        assert profile.neuro_vector == vec
        assert profile.is_assessment_complete()
        assert profile.status == ProfileStatus.ACTIVE

    def test_set_neuro_vector_from_assessment_pending(self):
        profile = UserProfile(
            user_id="user-1", status=ProfileStatus.ASSESSMENT_PENDING
        )
        vec = NeuroVector24D(creative_thinking=0.95)
        profile.set_neuro_vector(vec)
        assert profile.status == ProfileStatus.ACTIVE

    def test_set_neuro_vector_does_not_override_inactive(self):
        profile = UserProfile(user_id="user-1", status=ProfileStatus.INACTIVE)
        vec = NeuroVector24D()
        profile.set_neuro_vector(vec)
        assert profile.status == ProfileStatus.INACTIVE


class TestDeactivation:
    def test_deactivate_profile(self):
        profile = UserProfile(user_id="user-1", status=ProfileStatus.ACTIVE)
        profile.deactivate()
        assert profile.status == ProfileStatus.INACTIVE
        assert not profile.is_active()
