/**
 * Matching Service — Business Logic Layer
 * Contains the scoring algorithm and matching rules.
 *
 * Sprint 3: Extracted from app/lib/matching.ts
 * Pure functions — no Prisma calls, fully testable in isolation.
 *
 * Matching Weights:
 * - Skills: 40%
 * - Accommodations: 30%
 * - Work Preferences: 20%
 * - Location: 10%
 */

// ─── Configuration ────────────────────────────────────────────────────────────

export const MATCH_THRESHOLD = 60
export const MATCH_EXPIRATION_DAYS = 7

export const WEIGHTS = {
  skills: 40,
  accommodations: 30,
  preferences: 20,
  location: 10,
}

// ─── Status Mapping ───────────────────────────────────────────────────────────

export const STATUS_TO_ENUM: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'> = {
  pending: 'PENDING',
  accepted: 'APPROVED',
  rejected: 'REJECTED',
  expired: 'WITHDRAWN',
}

export const ENUM_TO_STATUS: Record<string, string> = {
  PENDING: 'pending',
  APPROVED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'expired',
  CONTESTED: 'contested',
}

// ─── Score Breakdown Type ─────────────────────────────────────────────────────

export interface ScoreBreakdown {
  skills: number
  accommodations: number
  preferences: number
  location: number
}

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * Calculate skills match between candidate and job.
 * Uses case-insensitive substring matching.
 */
export function calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
  if (!candidateSkills || !jobSkills || jobSkills.length === 0) return 0

  const exactMatches = jobSkills.filter(jobSkill =>
    candidateSkills.some(candidateSkill =>
      candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())
    )
  )

  const matchPercentage = (exactMatches.length / jobSkills.length) * 100

  if (candidateSkills.length > jobSkills.length) {
    return Math.min(100, matchPercentage + 10)
  }

  return Math.round(matchPercentage)
}

/**
 * Calculate accommodation needs match.
 * Returns 100 if candidate has no needs.
 */
export function calculateAccommodationsMatch(needs: string[], offers: string[]): number {
  if (!needs || needs.length === 0) return 100
  if (!offers || offers.length === 0) return 0

  const metNeeds = needs.filter(need =>
    offers.some(offer =>
      offer.toLowerCase().includes(need.toLowerCase()) ||
      need.toLowerCase().includes(offer.toLowerCase())
    )
  )

  return Math.round((metNeeds.length / needs.length) * 100)
}

/**
 * Calculate work preferences match (workMode, flexibleHours, teamSize).
 */
export function calculatePreferencesMatch(
  preferences: Record<string, unknown> | undefined,
  jobDetails: Record<string, unknown>
): number {
  if (!preferences || Object.keys(preferences).length === 0) return 50

  let matchPoints = 0
  let totalPoints = 0

  if (preferences.workMode) {
    totalPoints += 40
    if (preferences.workMode === jobDetails.workMode) {
      matchPoints += 40
    } else if (preferences.workMode === 'hybrid' && jobDetails.workMode !== 'on-site') {
      matchPoints += 20
    }
  }

  if (preferences.flexibleHours !== undefined) {
    totalPoints += 30
    const accommodations = jobDetails.accommodations as string[] | undefined
    if (preferences.flexibleHours === true && accommodations?.includes('Flexible hours')) {
      matchPoints += 30
    }
  }

  if (preferences.teamSize) {
    totalPoints += 30
    if (preferences.teamSize === jobDetails.teamSize) {
      matchPoints += 30
    } else if (
      (preferences.teamSize === 'small' && jobDetails.teamSize !== 'large') ||
      (preferences.teamSize === 'large' && jobDetails.teamSize !== 'small')
    ) {
      matchPoints += 15
    }
  }

  return totalPoints > 0 ? Math.round((matchPoints / totalPoints) * 100) : 50
}

/**
 * Calculate location compatibility.
 * Remote jobs always score 100.
 */
export function calculateLocationMatch(
  candidateLocation: string | undefined | null,
  candidateWorkMode: string | undefined,
  jobLocation: string | undefined | null,
  jobWorkMode: string | undefined
): number {
  if (jobWorkMode === 'remote') return 100
  if (candidateWorkMode === 'remote' && jobWorkMode === 'on-site') return 0

  if (candidateLocation && jobLocation) {
    const candidateLower = candidateLocation.toLowerCase()
    const jobLower = jobLocation.toLowerCase()

    if (candidateLower === jobLower) return 100

    const candidateCity = candidateLower.split(',')[0].trim()
    const jobCity = jobLower.split(',')[0].trim()

    if (candidateCity === jobCity) return 100
    if (jobWorkMode === 'hybrid') return 50
    return 20
  }

  return 50
}

// ─── Score Aggregation ────────────────────────────────────────────────────────

/**
 * Calculate total weighted match score from breakdown.
 */
export function calculateTotalScore(scoreBreakdown: ScoreBreakdown): number {
  return Math.round(
    (scoreBreakdown.skills * WEIGHTS.skills +
      scoreBreakdown.accommodations * WEIGHTS.accommodations +
      scoreBreakdown.preferences * WEIGHTS.preferences +
      scoreBreakdown.location * WEIGHTS.location) / 100
  )
}

/**
 * Generate human-readable justification for a match.
 * EU AI Act Art. 13: Transparency in AI matching decisions.
 */
export function generateMatchJustification(
  _candidate: unknown,
  job: { details?: { title?: string }; title?: string },
  scoreBreakdown: ScoreBreakdown,
  totalScore: number
): string {
  const reasons: string[] = []
  const jobTitle = job.details?.title ?? job.title ?? 'this position'

  if (scoreBreakdown.skills >= 80) {
    reasons.push(`Strong skills match (${scoreBreakdown.skills}%) with ${jobTitle} requirements`)
  } else if (scoreBreakdown.skills >= 60) {
    reasons.push('Good skills alignment with core requirements')
  }

  if (scoreBreakdown.accommodations >= 80) {
    reasons.push('All accommodation needs met by this position')
  } else if (scoreBreakdown.accommodations >= 60) {
    reasons.push('Most accommodation needs are supported')
  }

  if (scoreBreakdown.preferences >= 80) {
    reasons.push('Work preferences align well with job structure')
  }

  if (scoreBreakdown.location >= 80) {
    reasons.push('Location and work mode are compatible')
  }

  if (reasons.length === 0) {
    return `This is a ${totalScore >= 70 ? 'good' : 'moderate'} match based on overall compatibility.`
  }

  return reasons.join('. ') + '.'
}

/**
 * Check if a match score meets the threshold.
 */
export function meetsThreshold(score: number): boolean {
  return score >= MATCH_THRESHOLD
}

/**
 * Calculate expiration date from now.
 */
export function calculateExpirationDate(): Date {
  return new Date(Date.now() + MATCH_EXPIRATION_DAYS * 86400000)
}
