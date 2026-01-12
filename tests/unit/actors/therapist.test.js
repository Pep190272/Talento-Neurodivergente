/**
 * UC-008: Registro de Terapeuta
 * UC-009: Dashboard Terapeuta con Clientes
 * Tests TDD para terapeutas y especialistas
 *
 * CORE BUSINESS: Support for both sides (candidates + companies)
 * PRIORIDAD: MUST
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createTherapist, verifyTherapist, getTherapistClients } from '@/lib/therapists'
import { addClientToTherapist, requestTherapistAccess } from '@/lib/consent'

describe('UC-008: Therapist Registration', () => {
  let mockTherapistData

  beforeEach(() => {
    mockTherapistData = {
      email: 'dr.smith@therapy.com',
      profile: {
        name: 'Dr. Jane Smith',
        certifications: [
          {
            title: 'Licensed Clinical Psychologist',
            licenseNumber: 'PSY12345',
            issuingBody: 'State Board of Psychology',
            expiryDate: '2026-12-31'
          }
        ],
        specializations: ['autism', 'ADHD', 'anxiety'],
        approach: 'cognitive-behavioral',
        experienceYears: 8,
        neurodiversityExperience: 5,
        services: ['individual_support', 'company_consulting', 'workshops'],
        rates: {
          individualSession: 80,
          companyConsulting: 150,
          currency: 'EUR'
        }
      }
    }
  })

  describe('Registration', () => {
    it('should create therapist profile with pending verification', async () => {
      const result = await createTherapist(mockTherapistData)

      expect(result.therapistId).toMatch(/^ther_/)
      expect(result.status).toBe('pending_verification')
      expect(result.profile.name).toBe('Dr. Jane Smith')
      expect(result.createdAt).toBeDefined()
    })

    it('should validate certifications are provided', async () => {
      const dataWithoutCertifications = {
        ...mockTherapistData,
        profile: {
          ...mockTherapistData.profile,
          certifications: []
        }
      }

      await expect(createTherapist(dataWithoutCertifications)).rejects.toThrow(
        'At least one certification is required'
      )
    })

    it('should require specialization in neurodiversity', async () => {
      const result = await createTherapist(mockTherapistData)

      expect(result.profile.specializations).toContain('autism')
      expect(result.profile.neurodiversityExperience).toBeGreaterThan(0)
    })

    it('should allow therapist without direct neurodiversity experience', async () => {
      const newToNDData = {
        ...mockTherapistData,
        profile: {
          ...mockTherapistData.profile,
          neurodiversityExperience: 0
        }
      }

      const result = await createTherapist(newToNDData)

      expect(result.badges).toContain('new_to_neurodiversity')
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'limited_experience',
          message: 'Limited neurodiversity experience'
        })
      )
    })
  })

  describe('Certification Validation', () => {
    it('should validate certification with OpenAI', async () => {
      const result = await createTherapist(mockTherapistData)

      expect(result.certificationValidation).toBeDefined()
      expect(result.certificationValidation.validated).toBe(true)
    })

    it('should flag expired certifications', async () => {
      const dataWithExpiredCert = {
        ...mockTherapistData,
        profile: {
          ...mockTherapistData.profile,
          certifications: [
            {
              ...mockTherapistData.profile.certifications[0],
              expiryDate: '2020-01-01' // expired
            }
          ]
        }
      }

      await expect(createTherapist(dataWithExpiredCert)).rejects.toThrow(
        'Certification has expired'
      )
    })

    it('should request additional documentation for unrecognized certification', async () => {
      const dataWithUnrecognizedCert = {
        ...mockTherapistData,
        profile: {
          ...mockTherapistData.profile,
          certifications: [
            {
              title: 'Unknown Therapy Certificate',
              licenseNumber: 'UNK123',
              issuingBody: 'Unknown Body'
            }
          ]
        }
      }

      const result = await createTherapist(dataWithUnrecognizedCert)

      expect(result.status).toBe('pending_verification')
      expect(result.additionalDocumentationRequired).toBe(true)
    })
  })

  describe('Services Configuration', () => {
    it('should define services offered', async () => {
      const result = await createTherapist(mockTherapistData)

      expect(result.profile.services).toContain('individual_support')
      expect(result.profile.services).toContain('company_consulting')
    })

    it('should allow optional rates', async () => {
      const dataWithoutRates = {
        ...mockTherapistData,
        profile: {
          ...mockTherapistData.profile,
          rates: undefined
        }
      }

      const result = await createTherapist(dataWithoutRates)

      expect(result.profile.rates).toBeUndefined()
    })
  })

  describe('Admin Verification', () => {
    it('should allow admin to verify therapist', async () => {
      const therapist = await createTherapist(mockTherapistData)

      const verified = await verifyTherapist(therapist.therapistId, {
        verifiedBy: 'admin_123',
        notes: 'Credentials verified with State Board'
      })

      expect(verified.status).toBe('active')
      expect(verified.verifiedAt).toBeDefined()
      expect(verified.verifiedBy).toBe('admin_123')
    })

    it('should send welcome email after verification', async () => {
      const therapist = await createTherapist(mockTherapistData)
      const verified = await verifyTherapist(therapist.therapistId, {})

      expect(verified.welcomeEmailSent).toBe(true)
      expect(verified.redirectTo).toBe('/dashboard/therapist')
    })

    it('should allow admin to reject therapist application', async () => {
      const therapist = await createTherapist(mockTherapistData)

      const rejected = await verifyTherapist(therapist.therapistId, {
        status: 'rejected',
        reason: 'Invalid credentials'
      })

      expect(rejected.status).toBe('rejected')
      expect(rejected.rejectionReason).toBe('Invalid credentials')
    })
  })
})

describe('UC-009: Therapist Dashboard with Clients', () => {
  let therapist, individual, company

  beforeEach(async () => {
    therapist = await createTherapist(mockTherapistData)
    await verifyTherapist(therapist.therapistId, {})

    individual = await createIndividualProfile({
      email: 'client@example.com',
      profile: { name: 'Client User' },
      privacy: { allowTherapistAccess: true }
    })

    company = await createCompany({
      email: 'company@example.com',
      name: 'TestCorp'
    })
  })

  describe('Client Management', () => {
    it('should show clients who gave consent', async () => {
      // Individual requests therapist
      await requestTherapistAccess(individual.userId, therapist.therapistId)

      const clients = await getTherapistClients(therapist.therapistId)

      expect(clients.individualClients).toHaveLength(1)
      expect(clients.individualClients[0].userId).toBe(individual.userId)
    })

    it('should NOT show clients without consent', async () => {
      const individualNoConsent = await createIndividualProfile({
        email: 'noconsent@example.com',
        profile: { name: 'No Consent User' },
        privacy: { allowTherapistAccess: false }
      })

      const clients = await getTherapistClients(therapist.therapistId)

      expect(clients.individualClients).not.toContainEqual(
        expect.objectContaining({ userId: individualNoConsent.userId })
      )
    })

    it('should block access immediately when client revokes consent', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      // Revoke consent
      await revokeTherapistAccess(individual.userId, therapist.therapistId)

      const clients = await getTherapistClients(therapist.therapistId)

      expect(clients.individualClients).toHaveLength(0)
    })
  })

  describe('Client Data Access', () => {
    it('should view client progress with consent', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const clientData = await getClientDataForTherapist(
        therapist.therapistId,
        individual.userId
      )

      expect(clientData.profile).toBeDefined()
      expect(clientData.assessment).toBeDefined()
      expect(clientData.matches).toBeDefined()
    })

    it('should return 403 when accessing data without consent', async () => {
      await expect(
        getClientDataForTherapist(therapist.therapistId, individual.userId)
      ).rejects.toThrow('Access denied: No consent from client')
    })

    it('should allow therapist to add private notes', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const notes = await addTherapistNotes(therapist.therapistId, individual.userId, {
        content: 'Client is making progress with anxiety management',
        private: true
      })

      expect(notes.therapistId).toBe(therapist.therapistId)
      expect(notes.clientId).toBe(individual.userId)
      expect(notes.private).toBe(true)

      // Notes should NOT be visible to client
      const clientView = await getIndividualById(individual.userId)
      expect(clientView.therapistNotes).toBeUndefined()
    })
  })

  describe('Company Consulting', () => {
    it('should add company as consulting client', async () => {
      await addCompanyClient(therapist.therapistId, company.companyId, {
        serviceType: 'onboarding_support',
        contractStartDate: new Date()
      })

      const clients = await getTherapistClients(therapist.therapistId)

      expect(clients.companyClients).toHaveLength(1)
      expect(clients.companyClients[0].companyId).toBe(company.companyId)
    })

    it('should access company inclusivity metrics (aggregated only)', async () => {
      await addCompanyClient(therapist.therapistId, company.companyId, {})

      const metrics = await getCompanyMetricsForTherapist(
        therapist.therapistId,
        company.companyId
      )

      // Should be aggregated data only, no individual candidate info
      expect(metrics.avgInclusivityScore).toBeDefined()
      expect(metrics.totalAccommodationsOffered).toBeDefined()
      expect(metrics.candidateData).toBeUndefined() // no individual data
    })
  })

  describe('Aggregated Metrics (Anonymous)', () => {
    it('should show aggregated metrics across all clients', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const metrics = await getTherapistAggregateMetrics(therapist.therapistId)

      expect(metrics.avgMatchRate).toBeDefined()
      expect(metrics.topStrengthIdentified).toBeDefined()
      expect(metrics.mostRequestedAccommodation).toBeDefined()
      // All metrics should be anonymous/aggregated
      expect(metrics.individualData).toBeUndefined()
    })

    it('should compare therapist client metrics vs platform average', async () => {
      const metrics = await getTherapistAggregateMetrics(therapist.therapistId)

      expect(metrics.avgMatchRate).toBeDefined()
      expect(metrics.platformAvgMatchRate).toBeDefined()
      expect(metrics.comparison).toEqual(
        expect.objectContaining({
          performanceVsPlatform: expect.any(Number)
        })
      )
    })
  })

  describe('Recommendations', () => {
    it('should recommend candidate to company with consent', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const job = await createJobPosting(company.companyId, {
        title: 'Developer',
        skills: ['JavaScript'],
        accommodations: ['Remote work']
      })

      // Request consent from client
      const consent = await requestRecommendationConsent(
        therapist.therapistId,
        individual.userId,
        company.companyId,
        job.jobId
      )

      expect(consent.consentRequested).toBe(true)
      expect(consent.pendingClientApproval).toBe(true)
    })

    it('should NOT recommend without explicit consent', async () => {
      await expect(
        recommendCandidateToCompany(
          therapist.therapistId,
          individual.userId,
          company.companyId
        )
      ).rejects.toThrow('Client consent required for recommendation')
    })
  })

  describe('Dashboard UI', () => {
    it('should show pending requests', async () => {
      // Company requests onboarding support
      await requestTherapistForOnboarding(company.companyId, therapist.therapistId)

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.pendingRequests).toHaveLength(1)
      expect(dashboard.pendingRequests[0].type).toBe('onboarding_support')
    })

    it('should show resources library links', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.resources).toBeDefined()
      expect(dashboard.resources.gamesLibrary).toBeDefined()
      expect(dashboard.resources.quizzesLibrary).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle therapist with no clients', async () => {
      const clients = await getTherapistClients(therapist.therapistId)

      expect(clients.individualClients).toHaveLength(0)
      expect(clients.companyClients).toHaveLength(0)
      expect(clients.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'get_started',
          message: 'How to get your first clients'
        })
      )
    })

    it('should detect crisis situations and alert therapist', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      // Simulate client in crisis (detected by assessment red flags)
      const alerts = await checkClientAlerts(therapist.therapistId)

      expect(alerts.urgentAlerts).toBeDefined()
    })

    it('should handle client requesting to change therapist', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const newTherapist = await createTherapist({
        ...mockTherapistData,
        email: 'newtherapist@example.com'
      })

      await changeTherapist(individual.userId, newTherapist.therapistId)

      const oldClients = await getTherapistClients(therapist.therapistId)
      const newClients = await getTherapistClients(newTherapist.therapistId)

      expect(oldClients.individualClients).toHaveLength(0)
      expect(newClients.individualClients).toHaveLength(1)
    })
  })
})
