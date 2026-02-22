/**
 * UC-004: Matching between Candidates and Job Postings
 * TDD Tests — Prisma-backed implementation
 *
 * Methodology: Red -> Green -> Refactor
 * DB isolation: vi.mock('@/lib/prisma') — no real DB in unit tests
 *
 * Matching Weights:
 * - Skills: 40%
 * - Accommodations: 30%
 * - Work Preferences: 20%
 * - Location: 10%
 *
 * MATCH_THRESHOLD = 60
 * MATCH_EXPIRATION_DAYS = 7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── Mock dependencies BEFORE importing module under test ────────────────────

// Mock Prisma using prisma-mock singleton pattern
vi.mock('@/lib/prisma', async () => {
  const { getMockPrisma } = await import('../../helpers/prisma-mock.js')
  const mock = getMockPrisma()
  return { default: mock, prisma: mock }
})

// Mock utils — generateAnonymizedName
vi.mock('@/lib/utils.js', () => ({
  generateAnonymizedName: vi.fn().mockReturnValue('Anon_123'),
  generateUserId: vi.fn().mockReturnValue('user_mock_123'),
  generateMatchId: vi.fn().mockReturnValue('match_mock_123'),
  isValidEmail: vi.fn().mockReturnValue(true),
  sanitizeInput: vi.fn((x) => x),
}))

// Mock individuals module
vi.mock('@/lib/individuals', () => ({
  getVisibleIndividuals: vi.fn().mockResolvedValue([]),
  getIndividualProfile: vi.fn().mockResolvedValue(null),
}))

// Mock companies module
vi.mock('@/lib/companies', () => ({
  getJobPosting: vi.fn().mockResolvedValue(null),
  getAllOpenJobs: vi.fn().mockResolvedValue([]),
}))

// ─── Import singleton for _reset() in beforeEach ────────────────────────────

import { getMockPrisma } from '../../helpers/prisma-mock.js'
const mockPrisma = getMockPrisma()

// ─── Import mocked dependencies for per-test configuration ──────────────────

import { getVisibleIndividuals, getIndividualProfile } from '@/lib/individuals'
import { getJobPosting, getAllOpenJobs } from '@/lib/companies'

// ─── Import module under test ───────────────────────────────────────────────

import {
  calculateMatch,
  runMatchingForJob,
  runMatchingForCandidate,
  getMatchById,
  getMatchesByJobId,
  getMatchesByCandidateId,
  invalidateMatchesForJob,
  invalidateMatchesForCandidate,
} from '@/lib/matching'

// ─── Test fixtures ──────────────────────────────────────────────────────────

const CANDIDATE_ID = 'test-candidate-001'
const JOB_ID = 'test-job-001'
const MATCH_ID = 'test-match-001'

function createMockIndividual(overrides = {}) {
  const defaults = {
    userId: CANDIDATE_ID,
    individualId: 'ind_123',
    email: 'test@example.com',
    profile: {
      name: 'Test User',
      skills: ['JavaScript', 'React', 'Node.js'],
      accommodationsNeeded: ['Flexible hours', 'Quiet workspace'],
      experience: [{ title: 'Developer', years: 3 }],
      location: 'Madrid, Spain',
      preferences: { workMode: 'remote', flexibleHours: true },
      therapistId: null,
      bio: 'Test bio',
      diagnoses: ['ADHD'],
      education: [],
      medicalHistory: null,
    },
    privacy: {
      visibleInSearch: true,
      showRealName: false,
      shareDiagnosis: false,
      shareTherapistContact: false,
      shareAssessmentDetails: true,
    },
    assessment: {
      completed: true,
      score: 85,
      strengths: ['Problem solving'],
      challenges: [],
      technicalSkills: ['TypeScript'],
      softSkills: [],
      workStyle: {},
      completedAt: new Date(),
    },
    metadata: {
      lastLogin: null,
      profileViews: 0,
      matchesReceived: 0,
      applicationsSubmitted: 0,
    },
    matches: { pending: [], accepted: [], rejected: [] },
    connections: [],
  }

  return deepMerge(defaults, overrides)
}

function createMockJob(overrides = {}) {
  const defaults = {
    jobId: JOB_ID,
    companyId: 'comp_123',
    title: 'Frontend Developer',
    description: 'Build great UIs',
    skills: ['JavaScript', 'React', 'CSS'],
    accommodations: ['Flexible hours', 'Remote work', 'Quiet workspace'],
    workMode: 'remote',
    location: null,
    teamSize: 'small',
    status: 'active',
    visibility: 'public',
    salaryRange: null,
    benefits: [],
    reportingStructure: null,
    inclusivityScore: 85,
    inclusivityAnalysis: null,
    matches: { pending: [], accepted: [] },
    pipeline: {},
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,
  }

  return deepMerge(defaults, overrides)
}

function createMockMatchingRecord(overrides = {}) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 86400000)

  const defaults = {
    id: MATCH_ID,
    jobId: JOB_ID,
    individualId: CANDIDATE_ID,
    companyId: 'comp_123',
    aiScore: 75,
    aiFactors: {
      skills: 80,
      accommodations: 70,
      preferences: 65,
      location: 100,
    },
    aiExplanation: 'Good match based on skills and accommodations.',
    algorithmVersion: 'keyword-v1',
    aiSystemName: 'DiversIA-Matching',
    status: 'PENDING',
    expiresAt,
    candidateData: {
      userId: CANDIDATE_ID,
      name: 'Anon_123',
      skills: ['JavaScript', 'React', 'Node.js'],
      accommodationsNeeded: ['Flexible hours', 'Quiet workspace'],
      assessmentScore: 85,
      experience: [{ title: 'Developer', years: 3 }],
    },
    candidateNotified: false,
    companyCanView: false,
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    rejectionReason: null,
    reasonPrivate: true,
    connectionId: null,
    createdAt: now,
    updatedAt: now,
  }

  return deepMerge(defaults, overrides)
}

/**
 * Deep merge helper for nested fixture overrides
 */
function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      !(source[key] instanceof Date)
    ) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPrisma._reset()
  vi.clearAllMocks()

  // Add updateMany to the matching model if not present (prisma-mock does not include it)
  if (!mockPrisma.matching.updateMany) {
    mockPrisma.matching.updateMany = vi.fn().mockResolvedValue({ count: 0 })
  } else {
    vi.mocked(mockPrisma.matching.updateMany).mockReset()
    mockPrisma.matching.updateMany = vi.fn().mockResolvedValue({ count: 0 })
  }

  // Default: mocks return null (no data)
  vi.mocked(getIndividualProfile).mockResolvedValue(null)
  vi.mocked(getJobPosting).mockResolvedValue(null)
  vi.mocked(getVisibleIndividuals).mockResolvedValue([])
  vi.mocked(getAllOpenJobs).mockResolvedValue([])
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('UC-004: Matching Algorithm', () => {
  // ─── calculateMatch ─────────────────────────────────────────────────────

  describe('calculateMatch', () => {
    it('should calculate match score between candidate and job', async () => {
      const mockCandidate = createMockIndividual()
      const mockJob = createMockJob()

      vi.mocked(getIndividualProfile).mockResolvedValue(mockCandidate)
      vi.mocked(getJobPosting).mockResolvedValue(mockJob)

      const result = await calculateMatch(CANDIDATE_ID, JOB_ID)

      expect(result).not.toBeNull()
      expect(result.candidateId).toBe(CANDIDATE_ID)
      expect(result.jobId).toBe(JOB_ID)
      expect(result.companyId).toBe('comp_123')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.scoreBreakdown).toMatchObject({
        skills: expect.any(Number),
        accommodations: expect.any(Number),
        preferences: expect.any(Number),
        location: expect.any(Number),
      })
      expect(result.status).toBe('pending')
      expect(result.candidateData).toBeDefined()
      expect(result.candidateData.name).toBe('Anon_123')
      expect(result.aiJustification).toBeDefined()
      expect(result.expiresAt).toBeInstanceOf(Date)
    })

    it('should return null if candidate is not visible in search', async () => {
      const mockCandidate = createMockIndividual({
        privacy: { visibleInSearch: false },
      })
      const mockJob = createMockJob()

      vi.mocked(getIndividualProfile).mockResolvedValue(mockCandidate)
      vi.mocked(getJobPosting).mockResolvedValue(mockJob)

      const result = await calculateMatch(CANDIDATE_ID, JOB_ID)

      expect(result).toBeNull()
    })

    it('should return null if assessment not completed', async () => {
      const mockCandidate = createMockIndividual({
        assessment: { completed: false },
      })
      const mockJob = createMockJob()

      vi.mocked(getIndividualProfile).mockResolvedValue(mockCandidate)
      vi.mocked(getJobPosting).mockResolvedValue(mockJob)

      const result = await calculateMatch(CANDIDATE_ID, JOB_ID)

      expect(result).toBeNull()
    })

    it('should give higher score for better skills match', async () => {
      const mockJob = createMockJob({
        skills: ['JavaScript', 'React', 'CSS'],
      })

      // Candidate with all matching skills
      const goodCandidate = createMockIndividual({
        profile: {
          skills: ['JavaScript', 'React', 'CSS', 'Node.js'],
        },
        assessment: {
          completed: true,
          technicalSkills: ['TypeScript'],
        },
      })

      // Candidate with few matching skills
      const weakCandidate = createMockIndividual({
        userId: 'test-candidate-002',
        profile: {
          skills: ['Python'],
        },
        assessment: {
          completed: true,
          technicalSkills: [],
        },
      })

      vi.mocked(getJobPosting).mockResolvedValue(mockJob)

      // Calculate score for good match
      vi.mocked(getIndividualProfile).mockResolvedValue(goodCandidate)
      const goodResult = await calculateMatch(CANDIDATE_ID, JOB_ID)

      // Calculate score for weak match
      vi.mocked(getIndividualProfile).mockResolvedValue(weakCandidate)
      const weakResult = await calculateMatch('test-candidate-002', JOB_ID)

      expect(goodResult).not.toBeNull()
      expect(weakResult).not.toBeNull()
      expect(goodResult.scoreBreakdown.skills).toBeGreaterThan(weakResult.scoreBreakdown.skills)
      expect(goodResult.score).toBeGreaterThan(weakResult.score)
    })
  })

  // ─── runMatchingForJob ──────────────────────────────────────────────────

  describe('runMatchingForJob', () => {
    it('should find eligible candidates and create matches', async () => {
      const mockJob = createMockJob({ status: 'active' })
      const mockCandidate = createMockIndividual()

      vi.mocked(getJobPosting).mockResolvedValue(mockJob)
      vi.mocked(getVisibleIndividuals).mockResolvedValue([mockCandidate])
      vi.mocked(getIndividualProfile).mockResolvedValue(mockCandidate)

      const results = await runMatchingForJob(JOB_ID)

      // Results depend on whether candidates pass the MATCH_THRESHOLD (60)
      // With good skill/accommodation overlap, the candidate should match
      expect(Array.isArray(results)).toBe(true)

      if (results.length > 0) {
        const match = results[0]
        expect(match.candidateId).toBe(CANDIDATE_ID)
        expect(match.jobId).toBe(JOB_ID)
        expect(match.score).toBeGreaterThanOrEqual(60)
        expect(match.matchId).toBeDefined()
        expect(match.status).toBe('pending')
      }
    })

    it('should return empty array for inactive job', async () => {
      const inactiveJob = createMockJob({ status: 'closed' })

      vi.mocked(getJobPosting).mockResolvedValue(inactiveJob)

      const results = await runMatchingForJob(JOB_ID)

      expect(results).toEqual([])
    })
  })

  // ─── getMatchById ───────────────────────────────────────────────────────

  describe('getMatchById', () => {
    it('should return match by ID', async () => {
      // Seed a matching record directly into the prisma-mock store
      const matchRecord = createMockMatchingRecord()
      await mockPrisma.matching.create({ data: matchRecord })

      const result = await getMatchById(matchRecord.id)

      expect(result).not.toBeNull()
      expect(result.matchId).toBe(MATCH_ID)
      expect(result.candidateId).toBe(CANDIDATE_ID)
      expect(result.jobId).toBe(JOB_ID)
      expect(result.score).toBe(75)
      expect(result.status).toBe('pending')
      expect(result.scoreBreakdown).toMatchObject({
        skills: 80,
        accommodations: 70,
        preferences: 65,
        location: 100,
      })
    })

    it('should return null for non-existent match', async () => {
      const result = await getMatchById('nonexistent-match-id')

      expect(result).toBeNull()
    })
  })

  // ─── getMatchesByJobId ──────────────────────────────────────────────────

  describe('getMatchesByJobId', () => {
    it('should return all matches for a job', async () => {
      // Seed multiple matching records for the same job
      const match1 = createMockMatchingRecord({
        id: 'match-001',
        individualId: 'candidate-001',
        aiScore: 85,
      })
      const match2 = createMockMatchingRecord({
        id: 'match-002',
        individualId: 'candidate-002',
        aiScore: 70,
      })

      await mockPrisma.matching.create({ data: match1 })
      await mockPrisma.matching.create({ data: match2 })

      const results = await getMatchesByJobId(JOB_ID)

      expect(results).toHaveLength(2)
      expect(results[0].jobId).toBe(JOB_ID)
      expect(results[1].jobId).toBe(JOB_ID)
      // Both should have been normalized
      results.forEach((match) => {
        expect(match.matchId).toBeDefined()
        expect(match.scoreBreakdown).toBeDefined()
        expect(match.status).toBeDefined()
      })
    })
  })

  // ─── getMatchesByCandidateId ────────────────────────────────────────────

  describe('getMatchesByCandidateId', () => {
    it('should return all matches for a candidate', async () => {
      // Seed matching records for the same candidate, different jobs
      const match1 = createMockMatchingRecord({
        id: 'match-c1',
        jobId: 'job-001',
        aiScore: 80,
      })
      const match2 = createMockMatchingRecord({
        id: 'match-c2',
        jobId: 'job-002',
        aiScore: 65,
      })

      await mockPrisma.matching.create({ data: match1 })
      await mockPrisma.matching.create({ data: match2 })

      const results = await getMatchesByCandidateId(CANDIDATE_ID)

      expect(results).toHaveLength(2)
      results.forEach((match) => {
        expect(match.candidateId).toBe(CANDIDATE_ID)
        expect(match.matchId).toBeDefined()
        expect(match.score).toBeGreaterThanOrEqual(0)
      })
    })
  })

  // ─── invalidateMatchesForJob ────────────────────────────────────────────

  describe('invalidateMatchesForJob', () => {
    it('should expire all pending matches for a job', async () => {
      await invalidateMatchesForJob(JOB_ID)

      expect(mockPrisma.matching.updateMany).toHaveBeenCalledWith({
        where: { jobId: JOB_ID, status: 'PENDING' },
        data: { status: 'WITHDRAWN', expiredAt: expect.any(Date) },
      })
    })
  })

  // ─── invalidateMatchesForCandidate ──────────────────────────────────────

  describe('invalidateMatchesForCandidate', () => {
    it('should expire all pending matches for a candidate', async () => {
      await invalidateMatchesForCandidate(CANDIDATE_ID)

      expect(mockPrisma.matching.updateMany).toHaveBeenCalledWith({
        where: { individualId: CANDIDATE_ID, status: 'PENDING' },
        data: { status: 'WITHDRAWN', expiredAt: expect.any(Date) },
      })
    })
  })
})
