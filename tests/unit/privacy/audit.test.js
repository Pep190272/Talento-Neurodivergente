/**
 * UC-017: Audit Log de Acceso a Datos Sensibles
 * Tests TDD para compliance GDPR y audit logging
 *
 * CORE PRINCIPLE: Compliance & Transparency
 * PRIORIDAD: MUST (Legal Requirement)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  logDataAccess,
  getAuditLog,
  getUserAuditLog,
  exportAuditLog
} from '@/lib/audit'
import { createIndividualProfile } from '@/lib/individuals'
import { createCompany } from '@/lib/companies'

describe('UC-017: Audit Logging & GDPR Compliance', () => {
  let candidate, company

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'candidate@example.com',
      profile: {
        name: 'Test User',
        diagnoses: ['ADHD'], // sensitive
        skills: ['JavaScript']
      },
      privacy: { shareDiagnosis: false }
    })

    company = await createCompany({
      email: 'company@example.com',
      name: 'TechCorp'
    })
  })

  describe('Access Logging', () => {
    it('should log every access to sensitive data', async () => {
      const accessEvent = {
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis', 'assessment'],
        reason: 'pipeline_review',
        ipAddress: '192.168.1.1'
      }

      const log = await logDataAccess(accessEvent)

      expect(log.logId).toBeDefined()
      expect(log.accessedBy).toBe(company.companyId)
      expect(log.dataAccessed).toEqual(['diagnosis', 'assessment'])
      expect(log.timestamp).toBeInstanceOf(Date)
      expect(log.ipAddress).toBe('192.168.1.1')
    })

    it('should require reason for data access', async () => {
      const accessEventWithoutReason = {
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis']
        // missing reason
      }

      await expect(logDataAccess(accessEventWithoutReason)).rejects.toThrow(
        'Reason is required for accessing sensitive data'
      )
    })

    it('should log access to personal identifiable information (PII)', async () => {
      const accessEvent = {
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['email', 'phone', 'address'],
        reason: 'contact_candidate'
      }

      const log = await logDataAccess(accessEvent)

      expect(log.dataAccessed).toContain('email')
      expect(log.dataType).toBe('PII')
    })

    it('should classify sensitivity level', async () => {
      const diagnosisAccess = await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'evaluation'
      })

      expect(diagnosisAccess.sensitivityLevel).toBe('high')

      const skillsAccess = await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['skills'],
        reason: 'matching'
      })

      expect(skillsAccess.sensitivityLevel).toBe('low')
    })
  })

  describe('User Access to Own Audit Log', () => {
    it('should allow user to view who accessed their data', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const userLog = await getUserAuditLog(candidate.userId)

      expect(userLog.entries).toHaveLength(1)
      expect(userLog.entries[0]).toEqual(
        expect.objectContaining({
          accessedBy: company.companyId,
          dataAccessed: expect.arrayContaining(['diagnosis']),
          timestamp: expect.any(Date)
        })
      )
    })

    it('should show friendly company names in user view', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['assessment'],
        reason: 'evaluation'
      })

      const userLog = await getUserAuditLog(candidate.userId)

      expect(userLog.entries[0].accessedByName).toBe('TechCorp')
    })

    it('should allow filtering by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const userLog = await getUserAuditLog(candidate.userId, {
        startDate,
        endDate
      })

      expect(userLog.entries).toBeInstanceOf(Array)
      userLog.entries.forEach(entry => {
        expect(entry.timestamp).toBeGreaterThanOrEqual(startDate)
        expect(entry.timestamp).toBeLessThanOrEqual(endDate)
      })
    })

    it('should allow filtering by data type', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['skills'],
        reason: 'matching'
      })

      const diagnosisLog = await getUserAuditLog(candidate.userId, {
        dataType: 'diagnosis'
      })

      expect(diagnosisLog.entries).toHaveLength(1)
      expect(diagnosisLog.entries[0].dataAccessed).toContain('diagnosis')
    })
  })

  describe('Admin Audit Access', () => {
    it('should allow admin to view all audit logs', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const adminLogs = await getAuditLog('admin_123', {
        adminRole: 'compliance_officer'
      })

      expect(adminLogs.entries).toHaveLength.greaterThan(0)
    })

    it('should redact sensitive data in admin view', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const adminLogs = await getAuditLog('admin_123', {
        adminRole: 'compliance_officer'
      })

      // Admin can see that diagnosis was accessed, but not the actual diagnosis
      expect(adminLogs.entries[0].dataAccessed).toContain('diagnosis')
      expect(adminLogs.entries[0].actualDiagnosis).toBeUndefined() // redacted
    })

    it('should allow exporting logs for compliance', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const exported = await exportAuditLog('admin_123', {
        format: 'csv',
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
      })

      expect(exported.format).toBe('csv')
      expect(exported.data).toBeDefined()
      expect(exported.filename).toMatch(/audit_log_\d+\.csv/)
    })
  })

  describe('Retention Policy', () => {
    it('should retain audit logs for 7 years (GDPR)', async () => {
      const log = await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const retentionDate = new Date(log.timestamp)
      retentionDate.setFullYear(retentionDate.getFullYear() + 7)

      expect(log.retentionUntil).toEqual(retentionDate)
    })

    it('should NOT delete logs even if user deletes account', async () => {
      const log = await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      await deleteUserAccount(candidate.userId)

      const retrievedLog = await getAuditLog('admin_123', {
        userId: candidate.userId
      })

      expect(retrievedLog.entries).toContainEqual(
        expect.objectContaining({
          logId: log.logId,
          deletionNote: 'User account deleted, log retained for compliance'
        })
      )
    })
  })

  describe('Automated Logging Triggers', () => {
    it('should auto-log when company views candidate profile', async () => {
      const job = await createJobPosting(company.companyId, {
        title: 'Developer',
        skills: ['JavaScript'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      // Company views profile
      await getCandidateDataForCompany(company.companyId, candidate.userId)

      const logs = await getUserAuditLog(candidate.userId)

      expect(logs.entries).toContainEqual(
        expect.objectContaining({
          action: 'profile_viewed',
          accessedBy: company.companyId,
          reason: 'pipeline_review'
        })
      )
    })

    it('should auto-log when consent is given', async () => {
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JS'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const logs = await getUserAuditLog(candidate.userId)

      expect(logs.entries).toContainEqual(
        expect.objectContaining({
          action: 'consent_given',
          targetEntity: company.companyId,
          sharedData: expect.arrayContaining(['name', 'email', 'skills'])
        })
      )
    })

    it('should auto-log when consent is revoked', async () => {
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JS'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      const accepted = await acceptMatch(match.matchId, candidate.userId)

      await revokeConsent(accepted.connection.connectionId, candidate.userId)

      const logs = await getUserAuditLog(candidate.userId)

      expect(logs.entries).toContainEqual(
        expect.objectContaining({
          action: 'consent_revoked',
          targetEntity: company.companyId,
          revokedData: expect.any(Array)
        })
      )
    })

    it('should auto-log when therapist accesses client data', async () => {
      const therapist = await createTherapist({
        email: 'therapist@example.com',
        profile: {
          name: 'Dr. Smith',
          certifications: [{ title: 'Psychologist', licenseNumber: 'PSY123' }],
          specializations: ['ADHD']
        }
      })

      await addClientToTherapist(therapist.therapistId, candidate.userId)
      await getClientDataForTherapist(therapist.therapistId, candidate.userId)

      const logs = await getUserAuditLog(candidate.userId)

      expect(logs.entries).toContainEqual(
        expect.objectContaining({
          action: 'therapist_access',
          accessedBy: therapist.therapistId,
          reason: 'client_review'
        })
      )
    })
  })

  describe('Anomaly Detection', () => {
    it('should flag suspicious access patterns', async () => {
      // Company accesses same candidate 100 times in 1 hour (suspicious)
      for (let i = 0; i < 100; i++) {
        await logDataAccess({
          accessedBy: company.companyId,
          targetUser: candidate.userId,
          dataAccessed: ['diagnosis'],
          reason: 'review',
          timestamp: new Date(Date.now() + i * 1000) // 1 second apart
        })
      }

      const anomalies = await detectAnomalies(company.companyId)

      expect(anomalies).toContainEqual(
        expect.objectContaining({
          type: 'excessive_access',
          severity: 'high',
          description: 'Unusually high access frequency'
        })
      )
    })

    it('should alert admin of potential data breach', async () => {
      // Multiple companies access same candidate's diagnosis in short time
      const company2 = await createCompany({
        email: 'company2@example.com',
        name: 'Corp2'
      })

      const company3 = await createCompany({
        email: 'company3@example.com',
        name: 'Corp3'
      })

      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      await logDataAccess({
        accessedBy: company2.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      await logDataAccess({
        accessedBy: company3.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const alerts = await getSecurityAlerts('admin_123')

      expect(alerts).toContainEqual(
        expect.objectContaining({
          type: 'unusual_access_pattern',
          severity: 'medium',
          affectedUser: candidate.userId
        })
      )
    })
  })

  describe('Data Minimization (GDPR)', () => {
    it('should log only necessary data fields accessed', async () => {
      // Company should access only consented data
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JS'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const candidateData = await getCandidateDataForCompany(
        company.companyId,
        candidate.userId
      )

      const log = await getUserAuditLog(candidate.userId)
      const latestAccess = log.entries[log.entries.length - 1]

      // Should NOT have accessed diagnosis (not consented)
      expect(latestAccess.dataAccessed).not.toContain('diagnosis')
      // Should have accessed only shared data
      expect(latestAccess.dataAccessed).toEqual(
        expect.arrayContaining(['name', 'email', 'skills', 'assessment'])
      )
    })
  })

  describe('Storage & Performance', () => {
    it('should store logs efficiently (indexed by userId)', async () => {
      const logFile = await getLogFilePath(candidate.userId)

      expect(logFile).toMatch(/data\/audit_logs\/\w+\/\w+\.json/)
    })

    it('should handle high-volume logging without performance degradation', async () => {
      const startTime = Date.now()

      // Log 1000 accesses
      for (let i = 0; i < 1000; i++) {
        await logDataAccess({
          accessedBy: `company_${i}`,
          targetUser: candidate.userId,
          dataAccessed: ['skills'],
          reason: 'matching'
        })
      }

      const duration = Date.now() - startTime

      // Should complete in <5 seconds
      expect(duration).toBeLessThan(5000)
    })
  })

  describe('GDPR Rights', () => {
    it('should support right to data portability (export audit log)', async () => {
      await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['diagnosis'],
        reason: 'review'
      })

      const exported = await exportUserAuditLog(candidate.userId, {
        format: 'json'
      })

      expect(exported.data).toBeDefined()
      expect(exported.format).toBe('json')
      expect(JSON.parse(exported.data).entries).toHaveLength.greaterThan(0)
    })

    it('should support right to be informed (transparency)', async () => {
      const log = await logDataAccess({
        accessedBy: company.companyId,
        targetUser: candidate.userId,
        dataAccessed: ['assessment'],
        reason: 'evaluation'
      })

      expect(log.userNotified).toBe(true) // user should be notified of access
    })
  })
})
