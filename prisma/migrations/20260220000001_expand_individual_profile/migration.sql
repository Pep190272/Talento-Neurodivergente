-- Migration: expand_individual_profile
-- DiversIA Eternals — 20 Feb 2026
-- Adds missing fields to Individual model identified in gap analysis:
-- bio, location, experience, education, preferences, therapistAssignedId,
-- privacy, assessment, metadata, lastActive, deactivatedAt, deletedAt,
-- validationStatus + performance indexes
--
-- Safe to run multiple times (IF NOT EXISTS / idempotent patterns)

-- Perfil extendido
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "location" TEXT;

-- Historial estructurado (JSON flexible)
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "experience" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "education" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "preferences" JSONB NOT NULL DEFAULT '{}';

-- Terapeuta asignado (soft reference)
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "therapistAssignedId" TEXT;

-- GDPR Art. 6 — Consentimiento granular
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "privacy" JSONB NOT NULL DEFAULT '{"visibleInSearch":true,"showRealName":true,"shareDiagnosis":false,"shareTherapistContact":false,"shareAssessmentDetails":false}';

-- Assessment neurodivergencia
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "assessment" JSONB NOT NULL DEFAULT '{"completed":false,"completedAt":null,"strengths":[],"challenges":[],"score":null,"technicalSkills":[],"softSkills":[],"workStyle":{}}';

-- Metadata de engagement
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{"lastLogin":null,"profileViews":0,"matchesReceived":0,"applicationsSubmitted":0}';

-- Lifecycle
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3);
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Individual" ADD COLUMN IF NOT EXISTS "validationStatus" TEXT DEFAULT 'pending';

-- Performance indexes
CREATE INDEX IF NOT EXISTS "Individual_validationStatus_idx" ON "Individual"("validationStatus");
CREATE INDEX IF NOT EXISTS "Individual_deletedAt_idx" ON "Individual"("deletedAt");
