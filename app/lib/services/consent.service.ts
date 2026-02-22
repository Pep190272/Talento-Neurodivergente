/**
 * Consent Service — Business Logic Layer
 * Contains consent validation rules and privacy logic.
 *
 * Sprint 3: Extracted from app/lib/consent.ts
 * Pure functions — no Prisma calls, fully testable in isolation.
 *
 * CRITICAL: Privacy-First, GDPR Compliance
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const VALID_PIPELINE_STAGES = [
  'newMatches',
  'underReview',
  'interviewing',
  'offered',
  'hired',
  'rejected',
] as const

export type PipelineStage = typeof VALID_PIPELINE_STAGES[number]

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrivacySettings {
  showRealName?: boolean
  shareDiagnosis?: boolean
  shareTherapistContact?: boolean
  shareAssessmentDetails?: boolean
}

export interface MatchData {
  matchId: string
  candidateId: string
  jobId: string
  companyId: string
  score: number
  status: string
  expiresAt: Date
}

export interface CandidateData {
  individualId: string
  email: string
  profile: {
    name: string
    skills: string[]
    therapistId: string | null
    accommodationsNeeded: string[]
    preferences: Record<string, unknown>
    location: string | null
    bio: string
    diagnoses: string[]
    experience: unknown[]
    education: unknown[]
    medicalHistory: string | null
  }
  privacy: PrivacySettings & { visibleInSearch?: boolean }
}

// ─── Validation Functions ─────────────────────────────────────────────────────

/**
 * Validate that a match can be accepted by the given user.
 * Returns null if valid, error message string if invalid.
 */
export function validateAcceptMatch(match: MatchData, userId: string): string | null {
  if (match.candidateId !== userId) {
    return 'Unauthorized: Only candidate can accept match'
  }
  if (match.status !== 'pending') {
    return `Cannot accept match with status: ${match.status}`
  }
  if (new Date() > new Date(match.expiresAt)) {
    return 'Match has expired'
  }
  return null
}

/**
 * Validate that a match can be rejected by the given user.
 */
export function validateRejectMatch(match: MatchData, userId: string): string | null {
  if (match.candidateId !== userId) {
    return 'Unauthorized: Only candidate can reject match'
  }
  if (match.status !== 'pending') {
    return `Cannot reject match with status: ${match.status}`
  }
  return null
}

/**
 * Validate that a connection can be revoked.
 */
export function validateRevocation(
  connection: { individualId: string | null; status: string; pipelineStage: string },
  userId: string
): string | null {
  if (connection.individualId !== userId) {
    return 'Unauthorized: Only candidate can revoke consent'
  }
  if (connection.status === 'revoked') {
    return 'Connection already revoked'
  }
  if (connection.pipelineStage === 'hired') {
    return 'Cannot revoke after hiring is complete'
  }
  return null
}

/**
 * Validate pipeline stage transition.
 */
export function isValidPipelineStage(stage: string): stage is PipelineStage {
  return (VALID_PIPELINE_STAGES as readonly string[]).includes(stage)
}

// ─── Privacy Logic ────────────────────────────────────────────────────────────

/**
 * Build effective privacy settings by merging custom overrides with candidate defaults.
 */
export function buildEffectivePrivacy(
  customPrivacy: PrivacySettings,
  candidatePrivacy: PrivacySettings
): Required<PrivacySettings> {
  return {
    showRealName: customPrivacy.showRealName ?? candidatePrivacy.showRealName ?? false,
    shareDiagnosis: customPrivacy.shareDiagnosis ?? candidatePrivacy.shareDiagnosis ?? false,
    shareTherapistContact: customPrivacy.shareTherapistContact ?? candidatePrivacy.shareTherapistContact ?? false,
    shareAssessmentDetails: customPrivacy.shareAssessmentDetails ?? candidatePrivacy.shareAssessmentDetails ?? true,
  }
}

/**
 * Determine which data fields will be shared based on privacy settings.
 */
export function determineSharedData(
  effectivePrivacy: Required<PrivacySettings>,
  hasTherapist: boolean
): string[] {
  const sharedData = ['name', 'email', 'skills', 'assessment']

  if (effectivePrivacy.shareDiagnosis) {
    sharedData.push('diagnosis')
  }
  if (effectivePrivacy.shareTherapistContact && hasTherapist) {
    sharedData.push('therapist')
  }

  sharedData.push('accommodations', 'experience', 'education')

  return sharedData
}

/**
 * Get candidate display name based on privacy settings.
 */
export function getCandidateDisplayName(
  showRealName: boolean,
  realName: string
): string {
  return showRealName ? realName : 'Anonymous Candidate'
}

/**
 * Build privacy preview for a match (before accepting).
 * Shows what data the company will and will not see.
 */
export function buildPrivacyPreview(privacy: PrivacySettings & { visibleInSearch?: boolean }, hasTherapist: boolean) {
  const companyWillSee = ['name', 'email', 'skills', 'assessment', 'accommodations', 'experience']
  const companyWillNotSee = ['Real name', 'Diagnosis', 'Therapist contact']

  if (privacy.showRealName) {
    const idx = companyWillNotSee.indexOf('Real name')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  if (privacy.shareDiagnosis) {
    companyWillSee.push('diagnosis')
    const idx = companyWillNotSee.indexOf('Diagnosis')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  if (privacy.shareTherapistContact && hasTherapist) {
    companyWillSee.push('therapist')
    const idx = companyWillNotSee.indexOf('Therapist contact')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  return {
    companyWillSee,
    companyWillNotSee,
    canCustomize: true,
    message: 'You can customize these settings for this specific connection when accepting the match',
  }
}

/**
 * Update shared data array based on privacy changes.
 */
export function updateSharedDataFromPrivacy(
  currentSharedData: string[],
  privacyUpdates: Record<string, boolean>
): string[] {
  let sharedData = [...currentSharedData]

  if (privacyUpdates.shareDiagnosis === false) {
    sharedData = sharedData.filter(f => f !== 'diagnosis')
  } else if (privacyUpdates.shareDiagnosis === true && !sharedData.includes('diagnosis')) {
    sharedData.push('diagnosis')
  }

  if (privacyUpdates.shareTherapistContact === false) {
    sharedData = sharedData.filter(f => f !== 'therapist')
  } else if (privacyUpdates.shareTherapistContact === true && !sharedData.includes('therapist')) {
    sharedData.push('therapist')
  }

  return sharedData
}
