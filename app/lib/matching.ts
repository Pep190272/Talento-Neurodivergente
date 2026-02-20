/**
 * AI-Powered Matching Algorithm — Prisma implementation
 * UC-004: Matching between Candidates and Job Postings
 *
 * Migrated from matching.js → matching.ts (Prisma 7 / PostgreSQL)
 * Maintains same public API for backward compatibility.
 *
 * Decisión de migración (2026-02-20):
 * - storage.js O(n) file scans → Prisma indexed queries
 * - Match status strings → MatchingStatus enum (PENDING, APPROVED, REJECTED, WITHDRAWN)
 * - candidateData snapshot almacenado como JSON para audit trail
 *
 * Matching Weights:
 * - Skills: 40%
 * - Accommodations: 30%
 * - Work Preferences: 20%
 * - Location: 10%
 */

import prisma from './prisma'
import type { Matching, Prisma } from '@prisma/client'
import {
  generateAnonymizedName,
} from './utils.js'

import { getVisibleIndividuals } from './individuals'
import { getJobPosting, getAllOpenJobs } from './companies'

// ─── Configuration ────────────────────────────────────────────────────────────

const MATCH_THRESHOLD = 60
const MATCH_EXPIRATION_DAYS = 7

const WEIGHTS = {
  skills: 40,
  accommodations: 30,
  preferences: 20,
  location: 10,
}

// ─── Status Mapping ───────────────────────────────────────────────────────────
// Legacy status strings → Prisma enum
const STATUS_TO_ENUM: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'> = {
  pending: 'PENDING',
  accepted: 'APPROVED',
  rejected: 'REJECTED',
  expired: 'WITHDRAWN',
}

const ENUM_TO_STATUS: Record<string, string> = {
  PENDING: 'pending',
  APPROVED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'expired',
  CONTESTED: 'contested',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchResult {
  matchId: string
  candidateId: string
  jobId: string
  companyId: string
  score: number
  scoreBreakdown: {
    skills: number
    accommodations: number
    preferences: number
    location: number
  }
  aiJustification: string
  status: string
  createdAt: Date
  expiresAt: Date
  acceptedAt: Date | null
  rejectedAt: Date | null
  expiredAt: Date | null
  rejectionReason: string | null
  reasonPrivate: boolean
  connectionId: string | null
  candidateNotified: boolean
  companyCanView: boolean
  candidateData: {
    userId: string
    name: string
    skills: string[]
    accommodationsNeeded: string[]
    assessmentScore: number | null
    experience: Array<{ title: string; years?: number }>
  }
  matchingMethod: string
  needsRecalculation: boolean
  updatedAt: Date | null
  warnings?: Array<{ type: string; suggestion: string }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeMatching(matching: Matching): MatchResult {
  const factors = (matching.aiFactors as unknown as Record<string, number>) ?? {}
  const candidateData = (matching.candidateData as unknown as MatchResult['candidateData']) ?? {
    userId: matching.individualId,
    name: 'Unknown',
    skills: [],
    accommodationsNeeded: [],
    assessmentScore: null,
    experience: [],
  }

  return {
    matchId: matching.id,
    candidateId: matching.individualId,
    jobId: matching.jobId,
    companyId: matching.companyId ?? '',
    score: matching.aiScore,
    scoreBreakdown: {
      skills: factors.skills ?? 0,
      accommodations: factors.accommodations ?? 0,
      preferences: factors.preferences ?? 0,
      location: factors.location ?? 0,
    },
    aiJustification: matching.aiExplanation ?? '',
    status: ENUM_TO_STATUS[matching.status] ?? 'pending',
    createdAt: matching.createdAt,
    expiresAt: matching.expiresAt ?? new Date(matching.createdAt.getTime() + MATCH_EXPIRATION_DAYS * 86400000),
    acceptedAt: matching.acceptedAt,
    rejectedAt: matching.rejectedAt,
    expiredAt: matching.expiredAt,
    rejectionReason: matching.rejectionReason,
    reasonPrivate: matching.reasonPrivate,
    connectionId: matching.connectionId,
    candidateNotified: matching.candidateNotified,
    companyCanView: matching.companyCanView,
    candidateData,
    matchingMethod: matching.algorithmVersion === 'keyword-v1' ? 'keyword' : matching.algorithmVersion,
    needsRecalculation: false,
    updatedAt: matching.updatedAt,
  }
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 86400000)
}

// ─── Scoring Functions ────────────────────────────────────────────────────────

function calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
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

function calculateAccommodationsMatch(needs: string[], offers: string[]): number {
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

function calculatePreferencesMatch(
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

function calculateLocationMatch(
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

function generateMatchJustification(
  _candidate: unknown,
  job: { details?: { title?: string }; title?: string },
  scoreBreakdown: { skills: number; accommodations: number; preferences: number; location: number },
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

// ─── Core Operations ──────────────────────────────────────────────────────────

/**
 * Calculate match score between candidate and job
 */
export async function calculateMatch(candidateId: string, jobId: string): Promise<MatchResult | null> {
  const { getIndividualProfile } = await import('./individuals')
  const candidate = await getIndividualProfile(candidateId)
  const job = await getJobPosting(jobId)

  if (!candidate || !job) throw new Error('Candidate or job not found')

  // Privacy check
  if (!candidate.privacy.visibleInSearch) return null
  if (!candidate.assessment.completed) return null

  // Calculate score breakdown
  const candidateSkills = [
    ...candidate.profile.skills,
    ...(candidate.assessment.technicalSkills || []),
  ]

  // Job data: companies.ts normalizes with details.skills or top-level skills
  const jobSkills = (job as Record<string, unknown>).skills as string[] ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.skills as string[] ?? []
  const jobAccommodations = (job as Record<string, unknown>).accommodations as string[] ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.accommodations as string[] ?? []
  const jobWorkMode = (job as Record<string, unknown>).workMode as string ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.workMode as string ?? 'remote'
  const jobLocation = (job as Record<string, unknown>).location as string ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.location as string ?? null
  const jobTeamSize = (job as Record<string, unknown>).teamSize as string ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.teamSize as string ?? null

  const scoreBreakdown = {
    skills: calculateSkillsMatch(candidateSkills, jobSkills),
    accommodations: calculateAccommodationsMatch(
      candidate.profile.accommodationsNeeded || [],
      jobAccommodations
    ),
    preferences: calculatePreferencesMatch(
      candidate.profile.preferences as Record<string, unknown>,
      { workMode: jobWorkMode, accommodations: jobAccommodations, teamSize: jobTeamSize }
    ),
    location: calculateLocationMatch(
      candidate.profile.location,
      (candidate.profile.preferences as Record<string, unknown>)?.workMode as string,
      jobLocation,
      jobWorkMode
    ),
  }

  const totalScore = Math.round(
    (scoreBreakdown.skills * WEIGHTS.skills +
      scoreBreakdown.accommodations * WEIGHTS.accommodations +
      scoreBreakdown.preferences * WEIGHTS.preferences +
      scoreBreakdown.location * WEIGHTS.location) / 100
  )

  const aiJustification = generateMatchJustification(candidate, job as Record<string, unknown>, scoreBreakdown, totalScore)

  // Build anonymized candidate snapshot
  const candidateData = {
    userId: candidateId,
    name: candidate.privacy.showRealName
      ? candidate.profile.name
      : generateAnonymizedName(candidateId),
    skills: candidate.profile.skills,
    accommodationsNeeded: candidate.profile.accommodationsNeeded || [],
    assessmentScore: candidate.assessment.score,
    experience: (candidate.profile.experience || []).map((exp: { title?: string; years?: number }) => ({
      title: exp.title,
      years: exp.years,
    })),
  }

  return {
    matchId: '', // Will be set by Prisma on create
    candidateId,
    jobId,
    companyId: job.companyId,
    score: totalScore,
    scoreBreakdown,
    aiJustification,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: addDays(MATCH_EXPIRATION_DAYS),
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    rejectionReason: null,
    reasonPrivate: true,
    connectionId: null,
    candidateNotified: false,
    companyCanView: false,
    candidateData,
    matchingMethod: 'keyword',
    needsRecalculation: false,
    updatedAt: null,
  }
}

/**
 * Run matching for a specific job (all eligible candidates)
 */
export async function runMatchingForJob(jobId: string): Promise<MatchResult[]> {
  const job = await getJobPosting(jobId)
  if (!job || (job as Record<string, unknown>).status !== 'active') return []

  const candidates = await getVisibleIndividuals()
  const matches: MatchResult[] = []

  for (const candidate of candidates) {
    try {
      const match = await calculateMatch(candidate.userId, jobId)

      if (match && match.score >= MATCH_THRESHOLD) {
        // Save to Prisma
        const created = await prisma.matching.create({
          data: {
            jobId,
            individualId: candidate.userId,
            companyId: job.companyId,
            aiScore: match.score,
            aiFactors: match.scoreBreakdown as Prisma.InputJsonValue,
            aiExplanation: match.aiJustification,
            algorithmVersion: 'keyword-v1',
            aiSystemName: 'DiversIA-Matching',
            status: 'PENDING',
            expiresAt: match.expiresAt,
            candidateData: match.candidateData as Prisma.InputJsonValue,
            candidateNotified: false,
            companyCanView: false,
          },
        })

        match.matchId = created.id
        matches.push(match)
      }
    } catch (error) {
      console.error(`Error matching candidate ${candidate.userId} with job ${jobId}:`, error)
    }
  }

  return matches
}

/**
 * Run matching for a specific candidate (all open jobs)
 */
export async function runMatchingForCandidate(candidateId: string): Promise<MatchResult[]> {
  const { getIndividualProfile } = await import('./individuals')
  const candidate = await getIndividualProfile(candidateId)

  if (!candidate || !candidate.assessment.completed) return []

  const jobs = await getAllOpenJobs()
  const matches: MatchResult[] = []

  for (const job of jobs) {
    try {
      const jobId = (job as Record<string, unknown>).jobId as string
      const match = await calculateMatch(candidateId, jobId)

      if (match && match.score >= MATCH_THRESHOLD) {
        const created = await prisma.matching.create({
          data: {
            jobId,
            individualId: candidateId,
            companyId: job.companyId,
            aiScore: match.score,
            aiFactors: match.scoreBreakdown as Prisma.InputJsonValue,
            aiExplanation: match.aiJustification,
            algorithmVersion: 'keyword-v1',
            aiSystemName: 'DiversIA-Matching',
            status: 'PENDING',
            expiresAt: match.expiresAt,
            candidateData: match.candidateData as Prisma.InputJsonValue,
            candidateNotified: false,
            companyCanView: false,
          },
        })

        match.matchId = created.id
        matches.push(match)
      }
    } catch (error) {
      console.error(`Error matching candidate ${candidateId} with job ${(job as Record<string, unknown>).jobId}:`, error)
    }
  }

  return matches
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId: string): Promise<MatchResult | null> {
  const matching = await prisma.matching.findUnique({ where: { id: matchId } })
  if (!matching) return null
  return normalizeMatching(matching)
}

/**
 * Get matches by job ID
 */
export async function getMatchesByJobId(jobId: string): Promise<MatchResult[]> {
  const matchings = await prisma.matching.findMany({
    where: { jobId },
    orderBy: { aiScore: 'desc' },
  })
  return matchings.map(normalizeMatching)
}

/**
 * Get matches by candidate ID
 */
export async function getMatchesByCandidateId(candidateId: string): Promise<MatchResult[]> {
  const matchings = await prisma.matching.findMany({
    where: { individualId: candidateId },
    orderBy: { createdAt: 'desc' },
  })
  return matchings.map(normalizeMatching)
}

/**
 * Recalculate matches for a candidate (after profile update)
 */
export async function recalculateMatches(candidateId: string): Promise<MatchResult[]> {
  const existingMatches = await prisma.matching.findMany({
    where: { individualId: candidateId, status: 'PENDING' },
  })

  const recalculated: MatchResult[] = []

  for (const existing of existingMatches) {
    const newMatch = await calculateMatch(candidateId, existing.jobId)

    if (newMatch && newMatch.score >= MATCH_THRESHOLD) {
      await prisma.matching.update({
        where: { id: existing.id },
        data: {
          aiScore: newMatch.score,
          aiFactors: newMatch.scoreBreakdown as Prisma.InputJsonValue,
          aiExplanation: newMatch.aiJustification,
          candidateData: newMatch.candidateData as Prisma.InputJsonValue,
        },
      })
      newMatch.matchId = existing.id
      recalculated.push(newMatch)
    } else {
      await expireMatch(existing.id)
    }
  }

  return recalculated
}

/**
 * Expire a match
 */
async function expireMatch(matchId: string): Promise<void> {
  await prisma.matching.update({
    where: { id: matchId },
    data: {
      status: 'WITHDRAWN',
      expiredAt: new Date(),
    },
  })
}

/**
 * Check and expire matches that are past expiration date
 */
export async function checkMatchExpiration(matchId: string): Promise<MatchResult> {
  const matching = await prisma.matching.findUnique({ where: { id: matchId } })
  if (!matching) throw new Error('Match not found')

  if (matching.status === 'PENDING' && matching.expiresAt && new Date() > matching.expiresAt) {
    await expireMatch(matchId)
    return { ...normalizeMatching(matching), status: 'expired' }
  }

  return normalizeMatching(matching)
}

/**
 * Process all expired matches (batch job)
 */
export async function processExpiredMatches(): Promise<void> {
  const expired = await prisma.matching.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
  })

  for (const match of expired) {
    await expireMatch(match.id)
  }
}

/**
 * Invalidate all matches for a job (when job is closed)
 */
export async function invalidateMatchesForJob(jobId: string): Promise<void> {
  await prisma.matching.updateMany({
    where: { jobId, status: 'PENDING' },
    data: { status: 'WITHDRAWN', expiredAt: new Date() },
  })
}

/**
 * Invalidate all matches for a candidate (when account deactivated)
 */
export async function invalidateMatchesForCandidate(candidateId: string): Promise<void> {
  await prisma.matching.updateMany({
    where: { individualId: candidateId, status: 'PENDING' },
    data: { status: 'WITHDRAWN', expiredAt: new Date() },
  })
}

// Alias exports for API route compatibility
export { getMatchesByCandidateId as findMatchesForCandidate }
export { getMatchesByJobId as findMatchesForJob }
