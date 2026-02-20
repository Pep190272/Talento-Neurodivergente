-- Migration: expand_company_job
-- DiversIA Eternals — 20 Feb 2026
-- Adds missing fields to Company and Job models identified in gap analysis:
-- Company: contact, diversityCommitment, neurodiversityPrograms, metadata, name_index
-- Job: location, benefits, teamSize, reportingStructure
--
-- Safe to run multiple times (IF NOT EXISTS / idempotent patterns)

-- ─── Company: Contacto y compromiso D&I ──────────────────────────────────────

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "contact" JSONB;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "diversityCommitment" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "neurodiversityPrograms" JSONB NOT NULL DEFAULT '[]';

-- Metadata de engagement
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{"lastLogin":null,"jobsPosted":0,"candidatesHired":0,"averageTimeToHire":null}';

-- Performance index
CREATE INDEX IF NOT EXISTS "Company_name_idx" ON "Company"("name");

-- ─── Job: Detalles adicionales ────────────────────────────────────────────────

ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "benefits" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "teamSize" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "reportingStructure" TEXT;
