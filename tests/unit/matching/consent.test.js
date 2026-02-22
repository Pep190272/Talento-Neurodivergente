/**
 * Tests for app/lib/consent.ts
 *
 * UC-005: Match Consent (Accept/Reject)
 * UC-016: Connection Management
 * Therapist Consent
 *
 * Privacy-first, GDPR compliance tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── Mock Prisma BEFORE importing modules that use it ────────────────────────
vi.mock('@/lib/prisma', async () => {
  const { getMockPrisma } = await import('../../helpers/prisma-mock.js')
  const mock = getMockPrisma()
  return { default: mock, prisma: mock }
})

import { getMockPrisma } from '../../helpers/prisma-mock.js'
const mockPrisma = getMockPrisma()

// ─── Mock matching module ────────────────────────────────────────────────────
vi.mock('@/lib/matching', () => ({
  getMatchById: vi.fn(),
}))

// ─── Mock individuals module ─────────────────────────────────────────────────
vi.mock('@/lib/individuals', () => ({
  getIndividualProfile: vi.fn(),
}))

// ─── Mock companies module ───────────────────────────────────────────────────
vi.mock('@/lib/companies', () => ({
  getCompany: vi.fn(),
  getJobPosting: vi.fn(),
}))

// ─── Mock therapists module ──────────────────────────────────────────────────
vi.mock('@/lib/therapists', () => ({
  getTherapist: vi.fn(),
  addClientToTherapist: vi.fn(),
  removeClientFromTherapist: vi.fn(),
}))

// ─── Import mocks for per-test configuration ────────────────────────────────
import { getMatchById } from '@/lib/matching'
import { getIndividualProfile } from '@/lib/individuals'
import { getCompany, getJobPosting } from '@/lib/companies'
import { getTherapist, addClientToTherapist, removeClientFromTherapist } from '@/lib/therapists'

// ─── Import module under test ────────────────────────────────────────────────
import {
  acceptMatch,
  rejectMatch,
  customizeMatchPrivacy,
  revokeConsent,
  revokeDataPermission,
  createConnection,
  getConnection,
  getActiveConnection,
  updateConnectionStage,
  requestTherapistAccess,
  revokeTherapistAccess,
  recommendCandidateToCompany,
} from '@/lib/consent'

// ─── Shared mock data factories ──────────────────────────────────────────────

function makeMockMatch(matchId, overrides = {}) {
  return {
    matchId,
    candidateId: 'user_123',
    jobId: 'job_123',
    companyId: 'comp_123',
    score: 85,
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 86400000),
    createdAt: new Date(),
    scoreBreakdown: { skills: 80, accommodations: 90, preferences: 70, location: 100 },
    ...overrides,
  }
}

function makeMockCandidate(overrides = {}) {
  return {
    userId: 'user_123',
    individualId: 'ind_123',
    email: 'test@example.com',
    profile: {
      name: 'Test User',
      skills: ['JavaScript'],
      therapistId: null,
      accommodationsNeeded: [],
      preferences: {},
      location: null,
      bio: '',
      diagnoses: [],
      experience: [],
      education: [],
      medicalHistory: null,
    },
    privacy: {
      visibleInSearch: true,
      showRealName: true,
      shareDiagnosis: false,
      shareTherapistContact: false,
      shareAssessmentDetails: true,
      allowTherapistAccess: true,
    },
    assessment: {
      completed: true,
      score: 85,
      strengths: [],
      challenges: [],
      technicalSkills: [],
      softSkills: [],
      workStyle: {},
    },
    metadata: {
      lastLogin: null,
      profileViews: 0,
      matchesReceived: 0,
      applicationsSubmitted: 0,
    },
    ...overrides,
  }
}

function makeMockCompany(companyId = 'comp_123') {
  return {
    companyId,
    userId: companyId,
    name: 'Test Company',
    email: 'company@example.com',
    status: 'active',
  }
}

function makeMockJob(jobId = 'job_123') {
  return {
    jobId,
    title: 'Frontend Developer',
    status: 'active',
    details: { title: 'Frontend Developer' },
  }
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPrisma._reset()
  vi.clearAllMocks()
})

// =============================================================================
// UC-005: Match Consent
// =============================================================================

describe('UC-005: Match Consent', () => {
  const matchId = 'match_001'

  // ── acceptMatch ──────────────────────────────────────────────────────────

  it('acceptMatch - should create connection when accepting valid match', async () => {
    const mockMatch = makeMockMatch(matchId)
    getMatchById.mockResolvedValue(mockMatch)
    getIndividualProfile.mockResolvedValue(makeMockCandidate())
    getJobPosting.mockResolvedValue(makeMockJob())
    getCompany.mockResolvedValue(makeMockCompany())

    // Seed a matching record so the $transaction update succeeds
    await mockPrisma.matching.create({
      data: { id: matchId, status: 'PENDING', individualId: 'user_123', jobId: 'job_123', companyId: 'comp_123' },
    })

    const result = await acceptMatch(matchId, 'user_123')

    expect(result.connection).toBeDefined()
    expect(result.connection.status).toBe('active')
    expect(result.connection.candidateId).toBe('user_123')
    expect(result.connection.companyId).toBe('comp_123')
    expect(result.connection.jobId).toBe('job_123')
    expect(result.connection.pipelineStage).toBe('newMatches')
    expect(result.connection.consentGivenAt).toBeDefined()
    expect(result.connection.sharedData).toContain('name')
    expect(result.connection.sharedData).toContain('skills')
    expect(result.connection.sharedData).toContain('assessment')
    // shareDiagnosis is false by default, so diagnosis should NOT be shared
    expect(result.connection.sharedData).not.toContain('diagnosis')
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0].type).toBe('new_candidate_match')
  })

  it('acceptMatch - should throw if match not found', async () => {
    getMatchById.mockResolvedValue(null)

    await expect(acceptMatch('nonexistent', 'user_123')).rejects.toThrow('Match not found')
  })

  it('acceptMatch - should throw if unauthorized user tries to accept', async () => {
    const mockMatch = makeMockMatch(matchId)
    getMatchById.mockResolvedValue(mockMatch)

    await expect(acceptMatch(matchId, 'wrong_user')).rejects.toThrow(
      'Unauthorized: Only candidate can accept match'
    )
  })

  it('acceptMatch - should throw if match already accepted', async () => {
    const mockMatch = makeMockMatch(matchId, { status: 'accepted' })
    getMatchById.mockResolvedValue(mockMatch)

    await expect(acceptMatch(matchId, 'user_123')).rejects.toThrow(
      'Cannot accept match with status: accepted'
    )
  })

  // ── rejectMatch ──────────────────────────────────────────────────────────

  it('rejectMatch - should reject match privately', async () => {
    const mockMatch = makeMockMatch(matchId)
    getMatchById.mockResolvedValue(mockMatch)

    // Seed matching record for the update
    await mockPrisma.matching.create({
      data: { id: matchId, status: 'PENDING', individualId: 'user_123', jobId: 'job_123', companyId: 'comp_123' },
    })

    const result = await rejectMatch(matchId, 'user_123', { reason: 'Not interested' })

    expect(result.status).toBe('rejected')
    expect(result.rejectedAt).toBeDefined()
    expect(result.reasonPrivate).toBe(true)
    expect(result.companyNotified).toBe(false)
    expect(result.rejectionReason).toBe('Not interested')
  })

  it('rejectMatch - should throw if unauthorized', async () => {
    const mockMatch = makeMockMatch(matchId)
    getMatchById.mockResolvedValue(mockMatch)

    await expect(rejectMatch(matchId, 'wrong_user')).rejects.toThrow(
      'Unauthorized: Only candidate can reject match'
    )
  })

  // ── customizeMatchPrivacy ────────────────────────────────────────────────

  it('customizeMatchPrivacy - should update privacy settings for connection', async () => {
    // Seed a connection
    const conn = await mockPrisma.connection.create({
      data: {
        id: 'conn_001',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name', 'email', 'skills', 'assessment', 'accommodations'],
        customPrivacy: { showRealName: true, shareDiagnosis: false, shareTherapistContact: false },
        pipelineStage: 'newMatches',
        metadata: { lastInteraction: new Date().toISOString() },
      },
    })

    const result = await customizeMatchPrivacy('conn_001', { showRealName: false })

    expect(result.connectionId).toBe('conn_001')
    expect(result.customPrivacy.showRealName).toBe(false)
    expect(result.customPrivacy.shareDiagnosis).toBe(false)
  })

  it('customizeMatchPrivacy - should remove diagnosis from shared data', async () => {
    // Seed a connection that currently shares diagnosis
    await mockPrisma.connection.create({
      data: {
        id: 'conn_diag',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name', 'email', 'skills', 'assessment', 'diagnosis'],
        customPrivacy: { showRealName: true, shareDiagnosis: true },
        pipelineStage: 'newMatches',
        metadata: {},
      },
    })

    const result = await customizeMatchPrivacy('conn_diag', { shareDiagnosis: false })

    expect(result.sharedData).not.toContain('diagnosis')
    expect(result.customPrivacy.shareDiagnosis).toBe(false)
  })

  // ── revokeConsent ────────────────────────────────────────────────────────

  it('revokeConsent - should revoke connection', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_revoke',
        type: 'JOB_MATCH',
        individualId: 'user_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name', 'email'],
        pipelineStage: 'underReview',
        metadata: {},
      },
    })

    const result = await revokeConsent('conn_revoke', 'user_123', { reason: 'Changed my mind' })

    expect(result.status).toBe('revoked')
    expect(result.revokedAt).toBeDefined()
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0].type).toBe('candidate_withdrew')
  })

  it('revokeConsent - should throw if already revoked', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_already_revoked',
        type: 'JOB_MATCH',
        individualId: 'user_123',
        companyId: 'comp_123',
        status: 'revoked',
        sharedData: [],
        pipelineStage: 'underReview',
        metadata: {},
      },
    })

    await expect(revokeConsent('conn_already_revoked', 'user_123')).rejects.toThrow(
      'Connection already revoked'
    )
  })

  it('revokeConsent - should throw if candidate already hired', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_hired',
        type: 'JOB_MATCH',
        individualId: 'user_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name', 'email'],
        pipelineStage: 'hired',
        metadata: {},
      },
    })

    await expect(revokeConsent('conn_hired', 'user_123')).rejects.toThrow(
      'Cannot revoke after hiring is complete'
    )
  })

  // ── revokeDataPermission ─────────────────────────────────────────────────

  it('revokeDataPermission - should remove specific data fields', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_data',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name', 'email', 'skills', 'diagnosis', 'assessment'],
        customPrivacy: { showRealName: true, shareDiagnosis: true },
        pipelineStage: 'newMatches',
        metadata: {},
      },
    })

    const result = await revokeDataPermission('conn_data', ['diagnosis'])

    expect(result.sharedData).not.toContain('diagnosis')
    expect(result.sharedData).toContain('name')
    expect(result.sharedData).toContain('skills')
    expect(result.customPrivacy.shareDiagnosis).toBe(false)
  })
})

// =============================================================================
// UC-016: Connection Management
// =============================================================================

describe('UC-016: Connection Management', () => {
  it('createConnection - should create basic connection', async () => {
    const result = await createConnection({
      candidateId: 'ind_123',
      companyId: 'comp_123',
      type: 'JOB_MATCH',
      sharedData: ['name', 'email'],
      matchId: 'match_abc',
      jobId: 'job_123',
    })

    expect(result.connectionId).toBeDefined()
    expect(result.status).toBe('active')
    expect(result.candidateId).toBe('ind_123')
    expect(result.companyId).toBe('comp_123')
    expect(result.consentGivenAt).toBeDefined()
  })

  it('getConnection - should return connection by ID', async () => {
    const created = await mockPrisma.connection.create({
      data: {
        id: 'conn_get',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        matchId: 'match_abc',
        jobId: 'job_123',
        status: 'active',
        sharedData: ['name', 'email', 'skills'],
        customPrivacy: { showRealName: true },
        consentGivenAt: new Date(),
        pipelineStage: 'newMatches',
        metadata: { lastInteraction: new Date().toISOString() },
      },
    })

    const result = await getConnection('conn_get')

    expect(result).not.toBeNull()
    expect(result.connectionId).toBe('conn_get')
    expect(result.candidateId).toBe('ind_123')
    expect(result.companyId).toBe('comp_123')
    expect(result.status).toBe('active')
    expect(result.sharedData).toContain('name')
  })

  it('getActiveConnection - should find active connection between parties', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_active',
        type: 'JOB_MATCH',
        individualId: 'ind_abc',
        companyId: 'comp_xyz',
        status: 'active',
        sharedData: ['name'],
        customPrivacy: {},
        pipelineStage: 'underReview',
        metadata: {},
      },
    })

    const result = await getActiveConnection('ind_abc', 'comp_xyz')

    expect(result).not.toBeNull()
    expect(result.connectionId).toBe('conn_active')
    expect(result.candidateId).toBe('ind_abc')
    expect(result.companyId).toBe('comp_xyz')
    expect(result.status).toBe('active')
  })

  it('updateConnectionStage - should update pipeline stage', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_stage',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: ['name'],
        pipelineStage: 'newMatches',
        metadata: {},
      },
    })

    const result = await updateConnectionStage('conn_stage', 'interviewing')

    expect(result.connectionId).toBe('conn_stage')
    expect(result.pipelineStage).toBe('interviewing')
    expect(result.updatedAt).toBeDefined()
  })

  it('updateConnectionStage - should reject invalid stage', async () => {
    await mockPrisma.connection.create({
      data: {
        id: 'conn_invalid_stage',
        type: 'JOB_MATCH',
        individualId: 'ind_123',
        companyId: 'comp_123',
        status: 'active',
        sharedData: [],
        pipelineStage: 'newMatches',
        metadata: {},
      },
    })

    await expect(updateConnectionStage('conn_invalid_stage', 'nonexistent_stage')).rejects.toThrow(
      'Invalid pipeline stage: nonexistent_stage'
    )
  })
})

// =============================================================================
// Therapist Consent
// =============================================================================

describe('Therapist Consent', () => {
  it('requestTherapistAccess - should grant access if privacy allows', async () => {
    const candidate = makeMockCandidate({
      privacy: {
        visibleInSearch: true,
        showRealName: true,
        shareDiagnosis: false,
        shareTherapistContact: false,
        shareAssessmentDetails: true,
        allowTherapistAccess: true,
      },
    })
    getIndividualProfile.mockResolvedValue(candidate)

    getTherapist.mockResolvedValue({
      therapistId: 'ther_001',
      status: 'active',
      verificationStatus: 'verified',
      clients: [],
    })
    addClientToTherapist.mockResolvedValue({})

    const result = await requestTherapistAccess('user_123', 'ther_001')

    expect(result.success).toBe(true)
    expect(result.therapistId).toBe('ther_001')
    expect(result.individualId).toBe('user_123')
    expect(result.consentGivenAt).toBeDefined()
    expect(result.accessLevel).toBe('full')
    expect(addClientToTherapist).toHaveBeenCalledWith('ther_001', 'user_123')
  })

  it('revokeTherapistAccess - should revoke therapist access', async () => {
    const candidate = makeMockCandidate()
    getIndividualProfile.mockResolvedValue(candidate)

    getTherapist.mockResolvedValue({
      therapistId: 'ther_001',
      status: 'active',
      verificationStatus: 'verified',
      clients: ['user_123'],
    })
    removeClientFromTherapist.mockResolvedValue({})

    const result = await revokeTherapistAccess('user_123', 'ther_001')

    expect(result.success).toBe(true)
    expect(result.therapistId).toBe('ther_001')
    expect(result.individualId).toBe('user_123')
    expect(result.revokedAt).toBeDefined()
    expect(result.accessRevoked).toBe(true)
    expect(removeClientFromTherapist).toHaveBeenCalledWith('ther_001', 'user_123')
  })

  it('recommendCandidateToCompany - should always throw (requires consent)', async () => {
    await expect(
      recommendCandidateToCompany('ther_001', 'user_123', 'comp_123')
    ).rejects.toThrow('Client consent required for recommendation')
  })
})
