-- Expand Therapist model with full profile fields
-- Required for therapists.js → therapists.ts migration (JSON → PostgreSQL)

ALTER TABLE "Therapist" ADD COLUMN "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "certifications" JSONB DEFAULT '[]';
ALTER TABLE "Therapist" ADD COLUMN "certificationValidation" JSONB;
ALTER TABLE "Therapist" ADD COLUMN "additionalDocRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Therapist" ADD COLUMN "neurodiversityExperience" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Therapist" ADD COLUMN "experienceYears" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Therapist" ADD COLUMN "approach" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "services" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "location" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "bio" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "acceptingNewClients" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Therapist" ADD COLUMN "clients" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "companyPartners" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "companyContracts" JSONB DEFAULT '{}';
ALTER TABLE "Therapist" ADD COLUMN "pendingRequests" JSONB DEFAULT '[]';
ALTER TABLE "Therapist" ADD COLUMN "maxClients" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "Therapist" ADD COLUMN "currentClients" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Therapist" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Therapist" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Therapist" ADD COLUMN "verifiedBy" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "verificationNotes" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "Therapist" ADD COLUMN "badges" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Therapist" ADD COLUMN "warnings" JSONB DEFAULT '[]';
ALTER TABLE "Therapist" ADD COLUMN "metadata" JSONB DEFAULT '{"lastLogin":null,"sessionsCompleted":0,"clientSatisfactionScore":null,"averageResponseTime":null,"lastSessionDate":null}';

CREATE INDEX "Therapist_verificationStatus_idx" ON "Therapist"("verificationStatus");

-- Expand Connection model with consent/pipeline fields
-- Required for consent.js → consent.ts migration

ALTER TABLE "Connection" ADD COLUMN "matchId" TEXT;
ALTER TABLE "Connection" ADD COLUMN "jobId" TEXT;
ALTER TABLE "Connection" ADD COLUMN "customPrivacy" JSONB;
ALTER TABLE "Connection" ADD COLUMN "consentGivenAt" TIMESTAMP(3);
ALTER TABLE "Connection" ADD COLUMN "revokedAt" TIMESTAMP(3);
ALTER TABLE "Connection" ADD COLUMN "revokedReason" TEXT;
ALTER TABLE "Connection" ADD COLUMN "pipelineStage" TEXT NOT NULL DEFAULT 'newMatches';
ALTER TABLE "Connection" ADD COLUMN "metadata" JSONB DEFAULT '{"lastInteraction":null,"messagesSent":0,"lastPrivacyUpdate":null,"lastStageUpdate":null,"lastDataRevocation":null}';

CREATE INDEX "Connection_individualId_idx" ON "Connection"("individualId");
CREATE INDEX "Connection_companyId_idx" ON "Connection"("companyId");
CREATE INDEX "Connection_status_idx" ON "Connection"("status");

-- Expand Matching model with consent/expiration fields
-- Required for matching.js → matching.ts migration

ALTER TABLE "Matching" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Matching" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "Matching" ADD COLUMN "expiredAt" TIMESTAMP(3);
ALTER TABLE "Matching" ADD COLUMN "acceptedAt" TIMESTAMP(3);
ALTER TABLE "Matching" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "Matching" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Matching" ADD COLUMN "reasonPrivate" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Matching" ADD COLUMN "candidateData" JSONB;
ALTER TABLE "Matching" ADD COLUMN "connectionId" TEXT;
ALTER TABLE "Matching" ADD COLUMN "candidateNotified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Matching" ADD COLUMN "companyCanView" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Matching_companyId_idx" ON "Matching"("companyId");
