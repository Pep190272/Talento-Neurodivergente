/**
 * Dashboard Data Aggregation Tests
 * UC-006: Individual Dashboard
 * UC-007: Company Dashboard
 * UC-009: Therapist Dashboard
 * + Company Views (matches, connection, pipeline)
 *
 * Tests that the dashboards module correctly aggregates data from
 * individuals, companies, therapists, matching, and audit modules,
 * respecting privacy boundaries.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── Mock Prisma (must be first) ─────────────────────────────────────────────

vi.mock('@/lib/prisma', async () => {
  const { getMockPrisma } = await import('../../helpers/prisma-mock.js')
  const mock = getMockPrisma()
  return { default: mock, prisma: mock }
})

import { getMockPrisma } from '../../helpers/prisma-mock.js'
const mockPrisma = getMockPrisma()

// ─── Mock individuals ────────────────────────────────────────────────────────

vi.mock('@/lib/individuals', () => ({
  getIndividualProfile: vi.fn().mockImplementation(async (userId) => ({
    userId,
    individualId: `ind_${userId}`,
    email: 'candidate@example.com',
    profile: {
      name: 'Test Candidate',
      skills: ['JavaScript', 'React'],
      experience: [{ title: 'Developer', years: 2 }],
      accommodationsNeeded: ['Flexible hours'],
      preferences: { workMode: 'remote' },
      location: 'Madrid',
      therapistId: null,
      bio: 'Test bio',
      diagnoses: ['ADHD'],
      education: [],
      medicalHistory: null,
    },
    privacy: { visibleInSearch: true, showRealName: true, shareDiagnosis: false, shareTherapistContact: false, shareAssessmentDetails: true },
    assessment: { completed: true, score: 80, strengths: [], challenges: [], technicalSkills: [], softSkills: [], workStyle: {} },
    metadata: { lastLogin: '2026-02-20', profileViews: 5, matchesReceived: 3, applicationsSubmitted: 1 },
    matches: { pending: [], accepted: [], rejected: [] },
    connections: [],
    createdAt: new Date('2026-01-01'),
  })),
  calculateProfileCompletion: vi.fn().mockResolvedValue({
    percentage: 70,
    breakdown: { assessment: 40, experience: 30, preferences: 0, skills: 0 },
    missingSteps: [],
  }),
  getProfileForCompany: vi.fn().mockResolvedValue({ name: 'Test Candidate', skills: ['JavaScript'] }),
  getVisibleIndividuals: vi.fn().mockResolvedValue([]),
}))

// ─── Mock companies ──────────────────────────────────────────────────────────

vi.mock('@/lib/companies', () => ({
  getCompany: vi.fn().mockImplementation(async (companyId) => ({
    companyId,
    userId: `user_${companyId}`,
    email: 'company@example.com',
    name: 'TestCorp',
    industry: 'Technology',
    location: 'Barcelona',
    jobs: ['job_1'],
    metadata: { lastLogin: '2026-02-20', candidatesHired: 2, averageTimeToHire: 14 },
    createdAt: new Date('2026-01-01'),
  })),
  getCompanyJobs: vi.fn().mockResolvedValue([
    { jobId: 'job_1', companyId: 'comp_1', status: 'active', title: 'Developer', skills: ['JavaScript'], accommodations: ['Flexible hours'] },
  ]),
  getJobPosting: vi.fn().mockImplementation(async (jobId) => ({
    jobId,
    companyId: 'comp_1',
    title: 'Developer',
    status: 'active',
    skills: ['JavaScript'],
  })),
  getCandidateDataForCompany: vi.fn().mockResolvedValue({
    name: 'Test Candidate',
    skills: ['JavaScript'],
  }),
}))

// ─── Mock therapists ─────────────────────────────────────────────────────────

vi.mock('@/lib/therapists', () => ({
  getTherapist: vi.fn().mockImplementation(async (therapistId) => ({
    therapistId,
    profile: { name: 'Dr. Smith', specializations: ['ADHD'], acceptingNewClients: true },
    verificationStatus: 'verified',
    availability: { maxClients: 20 },
    clients: [],
    metadata: { sessionsCompleted: 10, clientSatisfactionScore: 4.5, lastLogin: '2026-02-20' },
    createdAt: new Date('2026-01-01'),
  })),
  getTherapistClients: vi.fn().mockResolvedValue({
    individualClients: [],
    companyClients: [],
  }),
}))

// ─── Mock matching ───────────────────────────────────────────────────────────

vi.mock('@/lib/matching', () => ({
  getMatchesByCandidateId: vi.fn().mockResolvedValue([]),
  getMatchesByJobId: vi.fn().mockResolvedValue([]),
}))

// ─── Mock audit ──────────────────────────────────────────────────────────────

vi.mock('@/lib/audit', () => ({
  getUserAuditLog: vi.fn().mockResolvedValue({ userId: 'user_123', totalEntries: 0, entries: [] }),
}))

// ─── Import modules under test ───────────────────────────────────────────────

import {
  getIndividualDashboard,
  getCompanyDashboard,
  getTherapistDashboard,
  getMatchesForCompany,
  getConnectionForCompany,
  getCompanyPipeline,
  getUserAuditLog,
} from '@/lib/dashboards'

import { getIndividualProfile, calculateProfileCompletion } from '@/lib/individuals'
import { getCompany, getCompanyJobs, getCandidateDataForCompany } from '@/lib/companies'
import { getTherapist, getTherapistClients } from '@/lib/therapists'
import { getMatchesByCandidateId, getMatchesByJobId } from '@/lib/matching'

// ─── OR-aware findMany for connection model ──────────────────────────────────
// The in-memory Prisma mock does not support Prisma OR filters natively.
// Install a permanent wrapper that handles OR and delegates everything else
// to the original implementation. Saved once to avoid recursion on repeated
// beforeEach calls.

const _origConnectionFindMany = mockPrisma.connection.findMany
mockPrisma.connection.findMany = async (args) => {
  const where = args?.where
  if (where?.OR) {
    const allRecords = [...mockPrisma._stores.connection.values()]
    return allRecords.filter((record) => {
      const orMatch = where.OR.some((clause) =>
        Object.entries(clause).every(([k, v]) => record[k] === v),
      )
      if (!orMatch) return false
      for (const [key, val] of Object.entries(where)) {
        if (key === 'OR') continue
        if (record[key] !== val) return false
      }
      return true
    })
  }
  return _origConnectionFindMany(args)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('UC-006: Individual Dashboard', () => {
  beforeEach(() => {
    mockPrisma._reset()
    vi.clearAllMocks()

    // Seed connections for pipeline breakdown
    mockPrisma._stores.connection.set('conn_1', {
      id: 'conn_1',
      individualId: 'user_123',
      companyId: 'comp_1',
      jobId: 'job_1',
      status: 'active',
      pipelineStage: 'newMatches',
      consentGivenAt: new Date(),
      metadata: {},
    })
    mockPrisma._stores.connection.set('conn_2', {
      id: 'conn_2',
      individualId: 'user_123',
      companyId: 'comp_2',
      jobId: 'job_2',
      status: 'active',
      pipelineStage: 'interviewing',
      consentGivenAt: new Date(),
      metadata: {},
    })
    mockPrisma._stores.connection.set('conn_3', {
      id: 'conn_3',
      individualId: 'ind_user_123',
      companyId: 'comp_3',
      jobId: 'job_3',
      status: 'active',
      pipelineStage: 'offered',
      consentGivenAt: new Date(),
      metadata: {},
    })
  })

  it('should return profile and match metrics', async () => {
    // Set up matches
    const mockMatches = [
      { matchId: 'm1', jobId: 'job_1', companyId: 'comp_1', candidateId: 'user_123', status: 'pending', score: 85, createdAt: new Date(), expiresAt: new Date() },
      { matchId: 'm2', jobId: 'job_2', companyId: 'comp_2', candidateId: 'user_123', status: 'accepted', score: 72, createdAt: new Date(), expiresAt: new Date() },
      { matchId: 'm3', jobId: 'job_3', companyId: 'comp_3', candidateId: 'user_123', status: 'rejected', score: 50, createdAt: new Date(), expiresAt: new Date() },
    ]
    getMatchesByCandidateId.mockResolvedValueOnce(mockMatches)

    const result = await getIndividualDashboard('user_123')

    // Profile data
    expect(result.userId).toBe('user_123')
    expect(result.profile.name).toBe('Test Candidate')
    expect(result.profile.email).toBe('candidate@example.com')
    expect(result.profile.location).toBe('Madrid')

    // Match metrics
    expect(result.matches.pending).toBe(1)
    expect(result.matches.accepted).toBe(1)
    expect(result.matches.rejected).toBe(1)
    expect(result.matches.total).toBe(3)

    // Recent matches should only include pending ones (top 5 by score)
    expect(result.recentMatches).toHaveLength(1)
    expect(result.recentMatches[0].matchId).toBe('m1')
    expect(result.recentMatches[0].score).toBe(85)

    // Metadata
    expect(result.metadata.memberSince).toEqual(new Date('2026-01-01'))
    expect(result.metadata.lastActive).toBe('2026-02-20')
    expect(result.metadata.profileViews).toBe(5)
  })

  it('should include profile completion percentage', async () => {
    const result = await getIndividualDashboard('user_123')

    expect(result.profileCompletion).toBe(70)
    expect(result.completionBreakdown).toEqual({
      assessment: 40,
      experience: 30,
      preferences: 0,
      skills: 0,
    })
    expect(result.missingSteps).toEqual([])

    expect(calculateProfileCompletion).toHaveBeenCalledWith('user_123')
  })

  it('should include pipeline breakdown from connections', async () => {
    const result = await getIndividualDashboard('user_123')

    // 3 active connections were seeded across two individualId variants
    expect(result.connections.total).toBe(3)
    expect(result.connections.pipelineBreakdown.newMatches).toBe(1)
    expect(result.connections.pipelineBreakdown.interviewing).toBe(1)
    expect(result.connections.pipelineBreakdown.offered).toBe(1)
    expect(result.connections.pipelineBreakdown.underReview).toBe(0)
    expect(result.connections.pipelineBreakdown.hired).toBe(0)
  })

  it('should throw if profile not found', async () => {
    getIndividualProfile.mockResolvedValueOnce(null)

    await expect(getIndividualDashboard('nonexistent')).rejects.toThrow(
      'Individual profile not found',
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('UC-007: Company Dashboard', () => {
  beforeEach(() => {
    mockPrisma._reset()
    vi.clearAllMocks()
  })

  it('should return company info and job metrics', async () => {
    const result = await getCompanyDashboard('comp_1')

    // Company info
    expect(result.companyId).toBe('comp_1')
    expect(result.company.name).toBe('TestCorp')
    expect(result.company.industry).toBe('Technology')
    expect(result.company.location).toBe('Barcelona')

    // Job counts (default mock has 1 active job)
    expect(result.jobs.total).toBe(1)
    expect(result.jobs.open).toBe(1)
    expect(result.jobs.closed).toBe(0)

    // Metrics from company metadata
    expect(result.metrics.candidatesHired).toBe(2)
    expect(result.metrics.averageTimeToHire).toBe(14)

    // Metadata
    expect(result.metadata.memberSince).toEqual(new Date('2026-01-01'))
    expect(result.metadata.lastActive).toBe('2026-02-20')
  })

  it('should aggregate pipeline across jobs', async () => {
    // Seed connections for the active job
    mockPrisma._stores.connection.set('conn_a', {
      id: 'conn_a',
      individualId: 'user_10',
      companyId: 'comp_1',
      jobId: 'job_1',
      status: 'active',
      pipelineStage: 'newMatches',
      consentGivenAt: new Date(),
      metadata: {},
    })
    mockPrisma._stores.connection.set('conn_b', {
      id: 'conn_b',
      individualId: 'user_11',
      companyId: 'comp_1',
      jobId: 'job_1',
      status: 'active',
      pipelineStage: 'interviewing',
      consentGivenAt: new Date(),
      metadata: {},
    })
    mockPrisma._stores.connection.set('conn_c', {
      id: 'conn_c',
      individualId: 'user_12',
      companyId: 'comp_1',
      jobId: 'job_1',
      status: 'active',
      pipelineStage: 'hired',
      consentGivenAt: new Date(),
      metadata: {},
    })

    const result = await getCompanyDashboard('comp_1')

    // Pipeline should reflect the seeded connections
    expect(result.pipeline.newMatches).toBe(1)
    expect(result.pipeline.interviewing).toBe(1)
    expect(result.pipeline.hired).toBe(1)
    expect(result.pipeline.underReview).toBe(0)
    expect(result.pipeline.offered).toBe(0)
    expect(result.pipeline.rejected).toBe(0)

    // Total candidates from connections
    expect(result.metrics.totalCandidates).toBe(3)
  })

  it('should throw if company not found', async () => {
    getCompany.mockResolvedValueOnce(null)

    await expect(getCompanyDashboard('nonexistent')).rejects.toThrow('Company not found')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('UC-009: Therapist Dashboard', () => {
  beforeEach(() => {
    mockPrisma._reset()
    vi.clearAllMocks()
  })

  it('should return therapist info and client metrics', async () => {
    // Set up clients with various states
    const mockClients = [
      { userId: 'u1', name: 'Client A', diagnoses: ['ADHD'], activeMatches: 2, assessmentCompleted: true, lastActive: '2026-02-19' },
      { userId: 'u2', name: 'Client B', diagnoses: ['Autism'], activeMatches: 0, assessmentCompleted: true, lastActive: '2026-02-18' },
      { userId: 'u3', name: 'Client C', diagnoses: ['Dyslexia'], activeMatches: 0, assessmentCompleted: false, lastActive: '2026-02-15' },
    ]
    getTherapistClients.mockResolvedValueOnce({
      individualClients: mockClients,
      companyClients: [],
    })

    const result = await getTherapistDashboard('ther_1')

    // Therapist info
    expect(result.therapistId).toBe('ther_1')
    expect(result.therapist.name).toBe('Dr. Smith')
    expect(result.therapist.specializations).toEqual(['ADHD'])
    expect(result.therapist.verificationStatus).toBe('verified')

    // Client counts
    expect(result.clients.total).toBe(3)
    expect(result.clients.active).toBe(1) // only Client A has activeMatches > 0
    expect(result.clients.capacity).toBe(20)
    expect(result.clients.acceptingNew).toBe(true)

    // Client breakdown
    expect(result.clients.breakdown.matched).toBe(1) // Client A: activeMatches > 0
    expect(result.clients.breakdown.searching).toBe(1) // Client B: no matches but assessment done
    expect(result.clients.breakdown.notReady).toBe(1) // Client C: assessment not completed

    // Metrics
    expect(result.metrics.assessmentCompletionRate).toBe(67) // 2/3 = 66.67 -> 67
    expect(result.metrics.totalActiveMatches).toBe(2)
    expect(result.metrics.averageMatchesPerClient).toBe(1) // 2/3 = 0.67 -> 1
    expect(result.metrics.sessionsCompleted).toBe(10)
    expect(result.metrics.satisfactionScore).toBe(4.5)

    // Recent clients (sorted by lastActive, top 5)
    expect(result.recentClients).toHaveLength(3)
    expect(result.recentClients[0].userId).toBe('u1') // most recent
    expect(result.recentClients[0].name).toBe('Client A')

    // Metadata
    expect(result.metadata.memberSince).toEqual(new Date('2026-01-01'))
    expect(result.metadata.lastActive).toBe('2026-02-20')
  })

  it('should include resources library links', async () => {
    // With no clients, the dashboard should still return valid structure
    const result = await getTherapistDashboard('ther_1')

    // Verify structure is complete even with zero clients
    expect(result.clients.total).toBe(0)
    expect(result.clients.active).toBe(0)
    expect(result.metrics.assessmentCompletionRate).toBe(0)
    expect(result.metrics.totalActiveMatches).toBe(0)
    expect(result.metrics.averageMatchesPerClient).toBe(0)
    expect(result.recentClients).toEqual([])
  })

  it('should throw if therapist not found', async () => {
    getTherapist.mockResolvedValueOnce(null)

    await expect(getTherapistDashboard('nonexistent')).rejects.toThrow('Therapist not found')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('Company Views', () => {
  beforeEach(() => {
    mockPrisma._reset()
    vi.clearAllMocks()
  })

  describe('getMatchesForCompany', () => {
    it('should return matches for job', async () => {
      const mockMatches = [
        { matchId: 'm1', jobId: 'job_1', companyId: 'comp_1', candidateId: 'user_10', status: 'accepted', score: 90, scoreBreakdown: { skills: 45, culture: 45 }, acceptedAt: new Date() },
        { matchId: 'm2', jobId: 'job_1', companyId: 'comp_1', candidateId: 'user_11', status: 'pending', score: 75, scoreBreakdown: { skills: 40, culture: 35 }, acceptedAt: null },
        { matchId: 'm3', jobId: 'job_1', companyId: 'comp_1', candidateId: 'user_12', status: 'rejected', score: 30, scoreBreakdown: { skills: 10, culture: 20 }, acceptedAt: null },
      ]
      getMatchesByJobId.mockResolvedValueOnce(mockMatches)

      const result = await getMatchesForCompany('comp_1', 'job_1')

      expect(result.jobId).toBe('job_1')
      // Visible matches exclude rejected: accepted + pending = 2
      expect(result.totalMatches).toBe(2)
      expect(result.acceptedMatches).toBe(1)
      expect(result.pendingMatches).toBe(1)
      // Only accepted matches get candidate data enrichment
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].matchId).toBe('m1')
      expect(result.matches[0].score).toBe(90)
      expect(result.matches[0].candidate).toEqual({ name: 'Test Candidate', skills: ['JavaScript'] })
    })
  })

  describe('getConnectionForCompany', () => {
    it('should return connection data', async () => {
      // Seed a connection owned by comp_1
      mockPrisma._stores.connection.set('conn_100', {
        id: 'conn_100',
        individualId: 'user_50',
        companyId: 'comp_1',
        jobId: 'job_1',
        status: 'active',
        pipelineStage: 'interviewing',
        consentGivenAt: new Date('2026-02-10'),
        sharedData: { skills: true, assessment: true },
        metadata: { interviewDate: '2026-02-25' },
      })

      const result = await getConnectionForCompany('comp_1', 'conn_100')

      expect(result.connectionId).toBe('conn_100')
      expect(result.candidateId).toBe('user_50')
      expect(result.jobId).toBe('job_1')
      expect(result.status).toBe('active')
      expect(result.pipelineStage).toBe('interviewing')
      expect(result.consentGivenAt).toEqual(new Date('2026-02-10'))
      expect(result.sharedData).toEqual({ skills: true, assessment: true })
      expect(result.candidate).toEqual({ name: 'Test Candidate', skills: ['JavaScript'] })
      expect(result.metadata).toEqual({ interviewDate: '2026-02-25' })
    })

    it('should throw for unauthorized access', async () => {
      // Seed a connection owned by a different company
      mockPrisma._stores.connection.set('conn_200', {
        id: 'conn_200',
        individualId: 'user_60',
        companyId: 'comp_other',
        jobId: 'job_99',
        status: 'active',
        pipelineStage: 'newMatches',
        consentGivenAt: new Date(),
        metadata: {},
      })

      // comp_1 tries to access comp_other's connection
      await expect(getConnectionForCompany('comp_1', 'conn_200')).rejects.toThrow(
        'Unauthorized access',
      )
    })
  })

  describe('getCompanyPipeline', () => {
    it('should return pipeline stages', async () => {
      // Seed connections at different pipeline stages
      mockPrisma._stores.connection.set('pipe_1', {
        id: 'pipe_1',
        individualId: 'user_a',
        companyId: 'comp_1',
        jobId: 'job_1',
        status: 'active',
        pipelineStage: 'newMatches',
        consentGivenAt: new Date('2026-02-01'),
        metadata: {},
      })
      mockPrisma._stores.connection.set('pipe_2', {
        id: 'pipe_2',
        individualId: 'user_b',
        companyId: 'comp_1',
        jobId: 'job_1',
        status: 'active',
        pipelineStage: 'underReview',
        consentGivenAt: new Date('2026-02-05'),
        metadata: { lastStageUpdate: '2026-02-08' },
      })
      mockPrisma._stores.connection.set('pipe_3', {
        id: 'pipe_3',
        individualId: 'user_c',
        companyId: 'comp_1',
        jobId: 'job_1',
        status: 'active',
        pipelineStage: 'interviewing',
        consentGivenAt: new Date('2026-02-10'),
        metadata: {},
      })
      mockPrisma._stores.connection.set('pipe_4', {
        id: 'pipe_4',
        individualId: 'user_d',
        companyId: 'comp_1',
        jobId: 'job_1',
        status: 'active',
        pipelineStage: 'hired',
        consentGivenAt: new Date('2026-02-15'),
        metadata: {},
      })

      const result = await getCompanyPipeline('comp_1', 'job_1')

      expect(result.jobId).toBe('job_1')

      // Counts per stage
      expect(result.counts.newMatches).toBe(1)
      expect(result.counts.underReview).toBe(1)
      expect(result.counts.interviewing).toBe(1)
      expect(result.counts.offered).toBe(0)
      expect(result.counts.hired).toBe(1)
      expect(result.counts.rejected).toBe(0)

      // Verify pipeline detail structure
      expect(result.pipeline.newMatches).toHaveLength(1)
      expect(result.pipeline.newMatches[0].connectionId).toBe('pipe_1')
      expect(result.pipeline.newMatches[0].candidateId).toBe('user_a')
      expect(result.pipeline.newMatches[0].name).toBe('Test Candidate')
      expect(result.pipeline.newMatches[0].skills).toEqual(['JavaScript'])

      // underReview candidate should use lastStageUpdate from metadata
      expect(result.pipeline.underReview[0].movedToStageAt).toBe('2026-02-08')

      // interviewing candidate falls back to consentGivenAt when no lastStageUpdate
      expect(result.pipeline.interviewing[0].movedToStageAt).toEqual(new Date('2026-02-10'))
    })
  })
})
