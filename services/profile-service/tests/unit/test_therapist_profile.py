"""Unit tests for TherapistProfile entity."""

import pytest

from app.domain.entities.therapist_profile import TherapistProfile, VerificationStatus


class TestTherapistCreation:
    def test_new_therapist_is_pending(self):
        therapist = TherapistProfile(user_id="user-1", specialty="ADHD")
        assert therapist.verification_status == VerificationStatus.PENDING
        assert not therapist.is_verified()

    def test_therapist_with_support_areas(self):
        therapist = TherapistProfile(
            user_id="user-1",
            specialty="Neurodiversity",
            support_areas=["autism", "adhd", "dyslexia"],
        )
        assert len(therapist.support_areas) == 3


class TestVerification:
    def test_verify_therapist(self):
        therapist = TherapistProfile(user_id="user-1", specialty="ADHD")
        therapist.verify()
        assert therapist.is_verified()
        assert therapist.verification_status == VerificationStatus.VERIFIED

    def test_reject_therapist(self):
        therapist = TherapistProfile(user_id="user-1", specialty="ADHD")
        therapist.reject()
        assert not therapist.is_verified()
        assert therapist.verification_status == VerificationStatus.REJECTED


class TestSupportAreas:
    def test_add_support_area(self):
        therapist = TherapistProfile(user_id="user-1", specialty="General")
        therapist.add_support_area("Autism")
        therapist.add_support_area("ADHD")
        assert "autism" in therapist.support_areas
        assert "adhd" in therapist.support_areas

    def test_add_duplicate_area_is_ignored(self):
        therapist = TherapistProfile(user_id="user-1", specialty="General")
        therapist.add_support_area("Autism")
        therapist.add_support_area("autism")
        therapist.add_support_area("  Autism  ")
        assert therapist.support_areas.count("autism") == 1

    def test_add_empty_area_is_ignored(self):
        therapist = TherapistProfile(user_id="user-1", specialty="General")
        therapist.add_support_area("")
        therapist.add_support_area("   ")
        assert len(therapist.support_areas) == 0
