-- Migration: EU AI Act Compliance + GDPR Enhancements
-- Date: 2026-02-20
-- Author: DiversIA Eternals
--
-- Changes vs. previous migration (20260126163651):
-- 1. AuditEventType: +8 new event types (GDPR + EU AI Act Art. 12)
-- 2. MatchingStatus: +CONTESTED (EU AI Act Art. 22 - right to contest)
-- 3. Matching: +6 fields (human oversight + AI transparency + right to contest)
-- 4. AuditLog: +userNotified column + retentionUntil index
-- 5. New indexes on Matching for query performance

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTEND AuditEventType enum — GDPR Art. 7 + EU AI Act Art. 12
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'ACCOUNT_DEACTIVATED';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'DATA_DELETED';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'DATA_BREACH_NOTIFIED';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'CONSENT_GIVEN';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'CONSENT_REVOKED';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'AI_DECISION_MADE';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'AI_DECISION_OVERRIDDEN';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'BIAS_CHECK_EXECUTED';
ALTER TYPE "AuditEventType" ADD VALUE IF NOT EXISTS 'THERAPIST_ACCESS';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. EXTEND MatchingStatus enum — EU AI Act Art. 22 (right to contest)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE "MatchingStatus" ADD VALUE IF NOT EXISTS 'CONTESTED';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MATCHING — EU AI Act Art. 13 (transparency) + Art. 14 (human oversight)
--              + Art. 22 (right to contest automated decisions)
-- ─────────────────────────────────────────────────────────────────────────────

-- AI System traceability (EU AI Act Art. 13)
ALTER TABLE "Matching"
  ADD COLUMN IF NOT EXISTS "algorithmVersion"  TEXT NOT NULL DEFAULT 'keyword-v1',
  ADD COLUMN IF NOT EXISTS "aiSystemName"       TEXT NOT NULL DEFAULT 'DiversIA-Matching';

-- Human oversight (EU AI Act Art. 14 — high-risk AI: employment Annex III)
ALTER TABLE "Matching"
  ADD COLUMN IF NOT EXISTS "humanOversightRequired" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "reviewNotes"             TEXT;

-- Right to contest (EU AI Act Art. 22 / GDPR Art. 22)
ALTER TABLE "Matching"
  ADD COLUMN IF NOT EXISTS "contestedAt"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "contestReason"      TEXT,
  ADD COLUMN IF NOT EXISTS "contestResolvedAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "contestResolution"  TEXT;

-- Performance indexes for new query patterns
CREATE INDEX IF NOT EXISTS "Matching_status_idx"       ON "Matching"("status");
CREATE INDEX IF NOT EXISTS "Matching_individualId_idx" ON "Matching"("individualId");
CREATE INDEX IF NOT EXISTS "Matching_jobId_idx"        ON "Matching"("jobId");

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. AUDIT LOG — Add userNotified + retentionUntil index
-- ─────────────────────────────────────────────────────────────────────────────

-- Track if user was notified about this data access event (GDPR transparency)
ALTER TABLE "AuditLog"
  ADD COLUMN IF NOT EXISTS "userNotified" BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for automated data purge jobs (GDPR Art. 5.1.e — storage limitation)
CREATE INDEX IF NOT EXISTS "AuditLog_retentionUntil_idx" ON "AuditLog"("retentionUntil");
