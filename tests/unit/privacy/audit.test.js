/**
 * UC-017: Audit Log de Acceso a Datos Sensibles
 * Tests for app/lib/audit.ts
 *
 * GDPR Art. 5.1.f — Integridad y confidencialidad
 * EU AI Act Art. 12 — Registro de eventos de sistemas de IA de alto riesgo
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock @prisma/client BEFORE importing modules that use it
// audit.ts imports AuditEventType enum from @prisma/client
vi.mock('@prisma/client', () => ({
  AuditEventType: {
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
    PROFILE_VIEWED: 'PROFILE_VIEWED',
    THERAPIST_ACCESS: 'THERAPIST_ACCESS',
    DATA_EXPORTED: 'DATA_EXPORTED',
    DATA_DELETED: 'DATA_DELETED',
    DATA_BREACH_NOTIFIED: 'DATA_BREACH_NOTIFIED',
    CONSENT_GIVEN: 'CONSENT_GIVEN',
    CONSENT_REVOKED: 'CONSENT_REVOKED',
    MATCHING_EXECUTED: 'MATCHING_EXECUTED',
    MATCHING_REVIEWED: 'MATCHING_REVIEWED',
    AI_DECISION_MADE: 'AI_DECISION_MADE',
    AI_DECISION_OVERRIDDEN: 'AI_DECISION_OVERRIDDEN',
    BIAS_CHECK_EXECUTED: 'BIAS_CHECK_EXECUTED',
    JOB_CREATED: 'JOB_CREATED',
  },
}))

// Mock Prisma BEFORE importing modules that use it
vi.mock('@/lib/prisma', async () => {
  const { getMockPrisma } = await import('../../helpers/prisma-mock.js')
  const mock = getMockPrisma()
  return { default: mock, prisma: mock }
})

// Mock utils.js for addYears
vi.mock('@/lib/utils.js', () => ({
  addYears: (years, date) => {
    const d = new Date(date || new Date())
    d.setFullYear(d.getFullYear() + years)
    return d
  },
}))

// Import singleton for _reset() in beforeEach
import { getMockPrisma } from '../../helpers/prisma-mock.js'
const mockPrisma = getMockPrisma()

import {
  logDataAccess,
  getUserAuditLog,
  getAuditLog,
  exportAuditLog,
  logTherapistAccess,
  logProfileView,
  getAIAuditTrailForMatching,
  logAIDecision,
  logHumanOversight,
  logDataDeletion,
} from '@/lib/audit'

describe('UC-017: Audit Logging (GDPR Art. 5.1.f)', () => {
  beforeEach(() => {
    mockPrisma._reset()
  })

  // ---------------------------------------------------------------
  // logDataAccess
  // ---------------------------------------------------------------

  it('logDataAccess - should create audit log entry', async () => {
    const result = await logDataAccess({
      action: 'profile_viewed',
      accessedBy: 'user_company_1',
      targetUser: 'user_candidate_1',
      dataAccessed: ['profile', 'skills'],
      reason: 'pipeline_review',
      ipAddress: '192.168.1.1',
    })

    expect(result).not.toBeNull()
    expect(result.id).toBeDefined()
    expect(result.userId).toBe('user_company_1')
    expect(result.eventType).toBe('PROFILE_VIEWED')
    expect(result.ipAddress).toBe('192.168.1.1')
    expect(result.timestamp).toBeInstanceOf(Date)
    expect(result.retentionUntil).toBeInstanceOf(Date)

    // Verify it was stored
    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  it('logDataAccess - should map action to correct AuditEventType', async () => {
    const actionMappings = [
      { action: 'user_login', expected: 'USER_LOGIN' },
      { action: 'therapist_access', expected: 'THERAPIST_ACCESS' },
      { action: 'data_deleted', expected: 'DATA_DELETED' },
      { action: 'ai_decision_made', expected: 'AI_DECISION_MADE' },
      { action: 'matching_executed', expected: 'MATCHING_EXECUTED' },
      { action: 'consent_given', expected: 'CONSENT_GIVEN' },
    ]

    for (const { action, expected } of actionMappings) {
      mockPrisma._reset()
      const result = await logDataAccess({ action })
      expect(result.eventType).toBe(expected)
    }

    // Unknown action should default to PROFILE_VIEWED
    mockPrisma._reset()
    const fallback = await logDataAccess({ action: 'unknown_action' })
    expect(fallback.eventType).toBe('PROFILE_VIEWED')
  })

  it('logDataAccess - should set 7-year retention period', async () => {
    const timestamp = new Date('2025-06-15T10:00:00Z')

    const result = await logDataAccess({
      action: 'profile_viewed',
      timestamp,
    })

    expect(result.retentionUntil).toBeInstanceOf(Date)
    const expectedYear = timestamp.getFullYear() + 7
    expect(result.retentionUntil.getFullYear()).toBe(expectedYear)
    expect(result.retentionUntil.getMonth()).toBe(timestamp.getMonth())
    expect(result.retentionUntil.getDate()).toBe(timestamp.getDate())
  })

  it('logDataAccess - should not throw on error (returns null)', async () => {
    // Force prisma.auditLog.create to throw by temporarily replacing it
    const originalCreate = mockPrisma.auditLog.create
    mockPrisma.auditLog.create = async () => {
      throw new Error('Database connection failed')
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await logDataAccess({
      action: 'profile_viewed',
      accessedBy: 'user_1',
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[AuditLog] Failed to write audit entry:',
      expect.any(Error)
    )

    // Restore
    consoleSpy.mockRestore()
    mockPrisma.auditLog.create = originalCreate
  })

  it('logDataAccess - should store details as JSON with all fields', async () => {
    const result = await logDataAccess({
      action: 'ai_decision_made',
      accessedBy: 'system',
      targetUser: 'user_candidate_1',
      dataAccessed: ['matching_score', 'ai_factors'],
      dataType: 'matching',
      sensitivityLevel: 'high',
      reason: 'automated_matching',
      aiSystemName: 'DiversIA-Matching',
      aiDecisionId: 'match_123',
      algorithmVersion: 'v2.1',
    })

    const details = result.details
    expect(details.targetUser).toBe('user_candidate_1')
    expect(details.dataAccessed).toEqual(['matching_score', 'ai_factors'])
    expect(details.dataType).toBe('matching')
    expect(details.sensitivityLevel).toBe('high')
    expect(details.reason).toBe('automated_matching')
    expect(details.originalAction).toBe('ai_decision_made')
    expect(details.aiSystemName).toBe('DiversIA-Matching')
    expect(details.aiDecisionId).toBe('match_123')
    expect(details.algorithmVersion).toBe('v2.1')
  })

  // ---------------------------------------------------------------
  // logTherapistAccess
  // ---------------------------------------------------------------

  it('logTherapistAccess - should log therapist accessing client data', async () => {
    const result = await logTherapistAccess('therapist_1', 'client_1', '10.0.0.1')

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('THERAPIST_ACCESS')
    expect(result.userId).toBe('therapist_1')
    expect(result.ipAddress).toBe('10.0.0.1')

    const details = result.details
    expect(details.targetUser).toBe('client_1')
    expect(details.dataAccessed).toEqual(['diagnosis', 'assessment', 'profile', 'matches'])
    expect(details.reason).toBe('client_review')
    expect(details.originalAction).toBe('therapist_access')

    // Verify stored in audit log
    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  // ---------------------------------------------------------------
  // logProfileView
  // ---------------------------------------------------------------

  it('logProfileView - should log company viewing candidate profile', async () => {
    const result = await logProfileView('company_1', 'candidate_1', '172.16.0.1')

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('PROFILE_VIEWED')
    expect(result.userId).toBe('company_1')
    expect(result.ipAddress).toBe('172.16.0.1')

    const details = result.details
    expect(details.targetUser).toBe('candidate_1')
    expect(details.dataAccessed).toEqual(['profile', 'skills', 'assessment'])
    expect(details.reason).toBe('pipeline_review')
    expect(details.originalAction).toBe('profile_viewed')

    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  // ---------------------------------------------------------------
  // logAIDecision (EU AI Act Art. 22)
  // ---------------------------------------------------------------

  it('logAIDecision - should log AI matching decision (EU AI Act Art. 22)', async () => {
    const result = await logAIDecision({
      matchingId: 'match_456',
      candidateId: 'candidate_2',
      aiScore: 0.87,
      algorithmVersion: 'v3.0',
      ipAddress: '10.0.0.5',
    })

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('AI_DECISION_MADE')
    expect(result.ipAddress).toBe('10.0.0.5')

    const details = result.details
    expect(details.targetUser).toBe('candidate_2')
    expect(details.aiDecisionId).toBe('match_456')
    expect(details.algorithmVersion).toBe('v3.0')
    expect(details.aiSystemName).toBe('DiversIA-Matching')
    expect(details.dataAccessed).toEqual(['matching_score', 'ai_factors'])
    expect(details.reason).toBe('automated_matching')

    expect(result.userNotified).toBe(true)
    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  // ---------------------------------------------------------------
  // logHumanOversight (EU AI Act Art. 14)
  // ---------------------------------------------------------------

  it('logHumanOversight - should log human review of AI decision', async () => {
    const result = await logHumanOversight({
      matchingId: 'match_789',
      reviewerId: 'reviewer_1',
      decision: 'approved',
      notes: 'Match looks appropriate',
      ipAddress: '10.0.0.10',
    })

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('MATCHING_REVIEWED')
    expect(result.userId).toBe('reviewer_1')
    expect(result.ipAddress).toBe('10.0.0.10')

    const details = result.details
    expect(details.aiDecisionId).toBe('match_789')
    expect(details.reason).toBe('human_review_approved')
    expect(details.dataAccessed).toEqual(['matching_score', 'ai_factors', 'review_notes'])

    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  it('logHumanOversight - should use ai_decision_overridden for overridden decisions', async () => {
    const result = await logHumanOversight({
      matchingId: 'match_override_1',
      reviewerId: 'reviewer_2',
      decision: 'overridden',
      ipAddress: '10.0.0.11',
    })

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('AI_DECISION_OVERRIDDEN')

    const details = result.details
    expect(details.reason).toBe('human_review_overridden')
  })

  // ---------------------------------------------------------------
  // logDataDeletion (GDPR Art. 17)
  // ---------------------------------------------------------------

  it('logDataDeletion - should log GDPR data erasure', async () => {
    const result = await logDataDeletion({
      deletedUserId: 'user_to_delete',
      requestedBy: 'user_requester',
      ipAddress: '192.168.0.100',
    })

    expect(result).not.toBeNull()
    expect(result.eventType).toBe('DATA_DELETED')
    expect(result.userId).toBe('user_requester')
    expect(result.ipAddress).toBe('192.168.0.100')
    expect(result.userNotified).toBe(true)

    const details = result.details
    expect(details.targetUser).toBe('user_to_delete')
    expect(details.reason).toBe('gdpr_right_to_erasure')
    expect(details.originalAction).toBe('data_deleted')

    expect(mockPrisma._stores.auditLog.size).toBe(1)
  })

  // ---------------------------------------------------------------
  // getUserAuditLog
  // ---------------------------------------------------------------

  it('getUserAuditLog - should return audit log structure for user', async () => {
    // The mock doesn't support Prisma JSON path filters, so getUserAuditLog
    // will return empty results — but we verify structure and no-throw behavior
    const result = await getUserAuditLog('user_123')

    expect(result).toBeDefined()
    expect(result.userId).toBe('user_123')
    expect(result.totalEntries).toBeDefined()
    expect(typeof result.totalEntries).toBe('number')
    expect(Array.isArray(result.entries)).toBe(true)
  })

  // ---------------------------------------------------------------
  // getAuditLog
  // ---------------------------------------------------------------

  it('getAuditLog - should return audit entries array', async () => {
    // Again, the mock doesn't support JSON path filters, but we verify
    // structure and that no exceptions are thrown
    const result = await getAuditLog('user_123')

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('getAuditLog - should accept actionFilter parameter without throwing', async () => {
    const result = await getAuditLog('user_123', 'profile_viewed')

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  // ---------------------------------------------------------------
  // exportAuditLog (GDPR Art. 15)
  // ---------------------------------------------------------------

  it('exportAuditLog - should return GDPR export format with metadata', async () => {
    const result = await exportAuditLog('user_456')

    expect(result).toBeDefined()
    expect(result.exportedAt).toBeInstanceOf(Date)
    expect(result.userId).toBe('user_456')
    expect(result.format).toBe('json')
    expect(typeof result.totalEntries).toBe('number')
    expect(Array.isArray(result.entries)).toBe(true)
    expect(result.metadata).toBeDefined()
    expect(result.metadata.gdprArticle).toBe('Art. 15 - Right of Access')
    expect(result.metadata.retentionPolicy).toBe('7 years')
    expect(result.metadata.exportRequestedAt).toBeInstanceOf(Date)
  })
})
