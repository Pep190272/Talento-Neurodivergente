/**
 * UC-005: Consentimiento de Match (Privacy-First)
 * UC-016: Revocar Consentimiento
 * Tests TDD para gestión de consentimiento y privacidad
 *
 * CORE PRINCIPLE: Privacy-First Marketplace
 * PRIORIDAD: MUST (Legal/GDPR Critical)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  acceptMatch,
  rejectMatch,
  customizeMatchPrivacy,
  revokeConsent,
  createConnection
} from '@/lib/consent'
import { calculateMatch } from '@/lib/matching'
import { createIndividualProfile } from '@/lib/individuals'
import { createCompany, createJobPosting } from '@/lib/companies'

describe('UC-005: Match Consent Management', () => {
  let candidate, company, job, match

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'candidate@example.com',
      profile: {
        name: 'Test Candidate',
        diagnoses: ['ADHD'],
        skills: ['JavaScript', 'React']
      },
      privacy: {
        visibleInSearch: true,
        showRealName: false,
        shareDiagnosis: false
      },
      assessment: {
        completed: true,
        strengths: ['Problem solving']
      }
    })

    company = await createCompany({
      email: 'company@example.com',
      name: 'TechCorp'
    })

    job = await createJobPosting(company.companyId, {
      title: 'Developer',
      skills: ['JavaScript', 'React'],
      accommodations: ['Remote work']
    })

    match = await calculateMatch(candidate.userId, job.jobId)
  })

  describe('Accept Match', () => {
    it('should change match status to "accepted"', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId)

      expect(result.match.status).toBe('accepted')
      expect(result.match.acceptedAt).toBeInstanceOf(Date)
    })

    it('should create connection with consent documented', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId)

      expect(result.connection).toBeDefined()
      expect(result.connection.connectionId).toMatch(/^conn_/)
      expect(result.connection.consentGivenAt).toBeInstanceOf(Date)
      expect(result.connection.status).toBe('active')
    })

    it('should document what data is shared', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId)

      expect(result.connection.sharedData).toBeInstanceOf(Array)
      expect(result.connection.sharedData).toContain('name')
      expect(result.connection.sharedData).toContain('email')
      expect(result.connection.sharedData).toContain('skills')
      expect(result.connection.sharedData).toContain('assessment')
      // Diagnosis NOT shared by default
      expect(result.connection.sharedData).not.toContain('diagnosis')
    })

    it('should respect default privacy settings', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId)

      // showRealName = false → should use anonymized name
      expect(result.connection.customPrivacy.showRealName).toBe(false)
      // shareDiagnosis = false → should NOT share
      expect(result.connection.sharedData).not.toContain('diagnosis')
    })

    it('should notify company of new match', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId)

      expect(result.notifications).toContainEqual(
        expect.objectContaining({
          recipientId: company.companyId,
          type: 'new_candidate_match',
          matchId: match.matchId
        })
      )
    })

    it('should update company dashboard with new candidate', async () => {
      await acceptMatch(match.matchId, candidate.userId)

      const companyDashboard = await getCompanyDashboard(company.companyId)

      expect(companyDashboard.pipeline.newMatches).toHaveLength(1)
      expect(companyDashboard.pipeline.newMatches[0].candidateId).toBe(candidate.userId)
    })

    it('should allow candidate to send initial message', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId, {
        message: 'Hi, I am interested in this position!'
      })

      expect(result.initialMessage).toBeDefined()
      expect(result.initialMessage.content).toBe('Hi, I am interested in this position!')
      expect(result.initialMessage.senderId).toBe(candidate.userId)
    })
  })

  describe('Reject Match', () => {
    it('should change match status to "rejected"', async () => {
      const result = await rejectMatch(match.matchId, candidate.userId)

      expect(result.status).toBe('rejected')
      expect(result.rejectedAt).toBeInstanceOf(Date)
    })

    it('should NOT notify company', async () => {
      const result = await rejectMatch(match.matchId, candidate.userId)

      expect(result.companyNotified).toBe(false)
    })

    it('should archive match (not visible to company)', async () => {
      await rejectMatch(match.matchId, candidate.userId)

      const companyView = await getMatchesForCompany(company.companyId, job.jobId)

      expect(companyView).not.toContainEqual(
        expect.objectContaining({ matchId: match.matchId })
      )
    })

    it('should NOT create connection', async () => {
      const result = await rejectMatch(match.matchId, candidate.userId)

      expect(result.connection).toBeUndefined()
    })

    it('should allow optional rejection reason (private)', async () => {
      const result = await rejectMatch(match.matchId, candidate.userId, {
        reason: 'Not interested in location'
      })

      expect(result.rejectionReason).toBe('Not interested in location')
      expect(result.reasonPrivate).toBe(true) // never shown to company
    })
  })

  describe('Customize Privacy for Specific Match', () => {
    it('should override default privacy for this connection only', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId, {
        customPrivacy: {
          shareDiagnosis: true, // override default (false)
          shareTherapistContact: true
        }
      })

      expect(result.connection.customPrivacy.shareDiagnosis).toBe(true)
      expect(result.connection.sharedData).toContain('diagnosis')
      // Other matches should still use default privacy
      expect(candidate.privacy.shareDiagnosis).toBe(false) // default unchanged
    })

    it('should allow showing real name for specific company', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId, {
        customPrivacy: {
          showRealName: true // override default
        }
      })

      expect(result.connection.customPrivacy.showRealName).toBe(true)

      const companyView = await getConnectionForCompany(
        company.companyId,
        result.connection.connectionId
      )

      expect(companyView.candidateName).toBe('Test Candidate') // real name
    })

    it('should allow revoking specific permissions later', async () => {
      const result = await acceptMatch(match.matchId, candidate.userId, {
        customPrivacy: { shareDiagnosis: true }
      })

      // Later, revoke diagnosis sharing
      const updated = await customizeMatchPrivacy(result.connection.connectionId, {
        shareDiagnosis: false
      })

      expect(updated.sharedData).not.toContain('diagnosis')
    })
  })

  describe('Privacy Preview', () => {
    it('should show preview of what company will see', async () => {
      const preview = await getMatchPrivacyPreview(match.matchId, candidate.userId)

      expect(preview.companyWillSee).toBeDefined()
      expect(preview.companyWillSee).toContain('name') // anonymized
      expect(preview.companyWillSee).toContain('skills')
      expect(preview.companyWillSee).not.toContain('diagnosis') // private

      expect(preview.companyWillNotSee).toBeDefined()
      expect(preview.companyWillNotSee).toContain('Real name')
      expect(preview.companyWillNotSee).toContain('Diagnosis')
    })
  })

  describe('Match Expiration', () => {
    it('should expire match if ignored for 7 days', async () => {
      // Simulate 8 days passing
      match.createdAt = new Date(Date.now() - 8 * 86400000)

      const expired = await checkMatchExpiration(match.matchId)

      expect(expired.status).toBe('expired')
    })

    it('should not allow accepting expired match', async () => {
      match.status = 'expired'

      await expect(acceptMatch(match.matchId, candidate.userId)).rejects.toThrow(
        'Match has expired'
      )
    })

    it('should auto-expire and free slot after 7 days', async () => {
      const expiredMatch = { ...match, expiresAt: new Date(Date.now() - 1000) }

      await processExpiredMatches()

      const result = await getMatchById(expiredMatch.matchId)
      expect(result.status).toBe('expired')
    })
  })
})

describe('UC-016: Revoke Consent', () => {
  let candidate, company, job, connection

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'candidate@example.com',
      profile: { name: 'Test Candidate', skills: ['React'] },
      assessment: { completed: true }
    })

    company = await createCompany({ email: 'company@example.com', name: 'TechCorp' })

    job = await createJobPosting(company.companyId, {
      title: 'Developer',
      skills: ['React'],
      accommodations: ['Remote work']
    })

    const match = await calculateMatch(candidate.userId, job.jobId)
    const accepted = await acceptMatch(match.matchId, candidate.userId)
    connection = accepted.connection
  })

  describe('Revoke Connection', () => {
    it('should change connection status to "revoked"', async () => {
      const result = await revokeConsent(connection.connectionId, candidate.userId)

      expect(result.status).toBe('revoked')
      expect(result.revokedAt).toBeInstanceOf(Date)
    })

    it('should remove candidate from company pipeline immediately', async () => {
      await revokeConsent(connection.connectionId, candidate.userId)

      const pipeline = await getCompanyPipeline(company.companyId, job.jobId)

      expect(pipeline.candidates).not.toContainEqual(
        expect.objectContaining({ candidateId: candidate.userId })
      )
    })

    it('should revoke company access to candidate data', async () => {
      await revokeConsent(connection.connectionId, candidate.userId)

      await expect(
        getConnectionForCompany(company.companyId, connection.connectionId)
      ).rejects.toThrow('Access revoked by candidate')
    })

    it('should notify company of withdrawal', async () => {
      const result = await revokeConsent(connection.connectionId, candidate.userId)

      expect(result.notifications).toContainEqual(
        expect.objectContaining({
          recipientId: company.companyId,
          type: 'candidate_withdrew',
          message: 'Candidate withdrew from process'
        })
      )
    })

    it('should NOT reveal reason to company (privacy)', async () => {
      const result = await revokeConsent(connection.connectionId, candidate.userId, {
        reason: 'Found another job' // private reason
      })

      expect(result.revokedReason).toBe('Found another job')

      // Company should NOT see reason
      const companyNotification = result.notifications.find(
        n => n.recipientId === company.companyId
      )
      expect(companyNotification.reason).toBeUndefined()
    })

    it('should log revocation for audit (GDPR compliance)', async () => {
      const result = await revokeConsent(connection.connectionId, candidate.userId)

      const auditLog = await getAuditLog(candidate.userId, 'consent_revoked')

      expect(auditLog).toContainEqual(
        expect.objectContaining({
          action: 'consent_revoked',
          connectionId: connection.connectionId,
          timestamp: result.revokedAt
        })
      )
    })
  })

  describe('Partial Data Revocation', () => {
    it('should allow revoking specific data without ending connection', async () => {
      // Connection with diagnosis shared
      const connectionWithDiagnosis = await acceptMatch(match.matchId, candidate.userId, {
        customPrivacy: { shareDiagnosis: true }
      })

      // Revoke only diagnosis, keep connection active
      const updated = await revokeDataPermission(
        connectionWithDiagnosis.connection.connectionId,
        ['diagnosis']
      )

      expect(updated.status).toBe('active') // still active
      expect(updated.sharedData).not.toContain('diagnosis') // removed
      expect(updated.sharedData).toContain('skills') // still shared
    })
  })

  describe('Cannot Revoke After Hiring', () => {
    it('should prevent revocation after candidate is hired', async () => {
      // Move to hired status
      await updatePipelineStage(connection.connectionId, 'hired')

      await expect(revokeConsent(connection.connectionId, candidate.userId)).rejects.toThrow(
        'Cannot revoke after hiring is complete'
      )
    })

    it('should allow revocation during interviewing', async () => {
      await updatePipelineStage(connection.connectionId, 'interviewing')

      const result = await revokeConsent(connection.connectionId, candidate.userId)

      expect(result.status).toBe('revoked')
    })
  })

  describe('Bulk Revocation', () => {
    it('should allow revoking all active connections at once', async () => {
      // Create multiple connections
      const job2 = await createJobPosting(company.companyId, {
        title: 'Senior Developer',
        skills: ['React'],
        accommodations: ['Remote work']
      })

      const match2 = await calculateMatch(candidate.userId, job2.jobId)
      await acceptMatch(match2.matchId, candidate.userId)

      // Revoke all
      const result = await revokeAllConsents(candidate.userId)

      expect(result.revokedConnections).toHaveLength(2)
      result.revokedConnections.forEach(conn => {
        expect(conn.status).toBe('revoked')
      })
    })
  })

  describe('Re-consent After Revocation', () => {
    it('should allow candidate to re-apply after revocation', async () => {
      await revokeConsent(connection.connectionId, candidate.userId)

      // New match created later
      const newMatch = await calculateMatch(candidate.userId, job.jobId)

      expect(newMatch).toBeDefined()
      expect(newMatch.matchId).not.toBe(connection.matchId) // new match
    })

    it('should warn company if candidate re-applies after revocation', async () => {
      await revokeConsent(connection.connectionId, candidate.userId)

      const newMatch = await calculateMatch(candidate.userId, job.jobId)
      const reApplied = await acceptMatch(newMatch.matchId, candidate.userId)

      expect(reApplied.warnings).toContainEqual(
        expect.objectContaining({
          type: 'previous_withdrawal',
          message: 'Candidate previously withdrew from this role'
        })
      )
    })
  })
})

describe('Privacy Enforcement', () => {
  let candidate, company

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'private@example.com',
      profile: {
        name: 'Private User',
        diagnoses: ['Autism', 'ADHD'],
        skills: ['JavaScript']
      },
      privacy: {
        shareDiagnosis: false,
        showRealName: false
      },
      assessment: { completed: true }
    })

    company = await createCompany({ email: 'company@example.com', name: 'Corp' })
  })

  describe('Access Control', () => {
    it('should block company from viewing candidate without connection', async () => {
      await expect(
        getCandidateDataForCompany(company.companyId, candidate.userId)
      ).rejects.toThrow('No active connection exists')
    })

    it('should only show data specified in sharedData array', async () => {
      const job = await createJobPosting(company.companyId, {
        title: 'Developer',
        skills: ['JavaScript'],
        accommodations: ['Remote']
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      const accepted = await acceptMatch(match.matchId, candidate.userId)

      const companyView = await getCandidateDataForCompany(
        company.companyId,
        candidate.userId
      )

      // Can see what's in sharedData
      expect(companyView.skills).toBeDefined()
      // Cannot see what's not in sharedData
      expect(companyView.diagnoses).toBeUndefined()
      expect(companyView.profile.realName).toBeUndefined()
    })

    it('should log every access to sensitive data', async () => {
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JS'],
        accommodations: ['Remote']
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      await getCandidateDataForCompany(company.companyId, candidate.userId)

      const auditLog = await getAuditLog(candidate.userId, 'data_accessed')

      expect(auditLog).toContainEqual(
        expect.objectContaining({
          action: 'data_accessed',
          accessedBy: company.companyId,
          dataAccessed: expect.arrayContaining(['skills', 'assessment'])
        })
      )
    })
  })
})
