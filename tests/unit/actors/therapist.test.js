/**
 * UC-008: Registro de Terapeuta
 * UC-009: Dashboard Terapeuta con Clientes
 * Tests TDD para terapeutas y especialistas
 *
 * CORE BUSINESS: Support for both sides (candidates + companies)
 * PRIORIDAD: MUST
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createTherapist,
  verifyTherapist,
  getTherapistClients,
  getTherapistDashboard
} from '@/lib/therapists'

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
    it('should validate certification with recognized body', async () => {
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

  describe('Dashboard and Client Structure', () => {
    it('should handle therapist with no clients', async () => {
      const therapist = await createTherapist(mockTherapistData)
      await verifyTherapist(therapist.therapistId, {})

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

    it('should show resources library links in dashboard', async () => {
      const therapist = await createTherapist(mockTherapistData)
      await verifyTherapist(therapist.therapistId, {})

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.resources).toBeDefined()
      expect(dashboard.resources.gamesLibrary).toBeDefined()
      expect(dashboard.resources.quizzesLibrary).toBeDefined()
    })
  })
})

// ============================================================
// UC-009: Therapist Dashboard with Clients
// TODO: Implementar funciones de consent y client management
// Estos tests requieren: requestTherapistAccess, revokeTherapistAccess,
// addTherapistNotes, addCompanyClient, getCompanyMetricsForTherapist,
// getTherapistAggregateMetrics, requestRecommendationConsent,
// recommendCandidateToCompany, requestTherapistForOnboarding,
// checkClientAlerts, changeTherapist
// ============================================================

describe('UC-009: Therapist Dashboard with Clients', () => {
  // TODO: Implementar en consent.js las funciones necesarias
  it.skip('should show clients who gave consent', () => {})
  it.skip('should NOT show clients without consent', () => {})
  it.skip('should block access immediately when client revokes consent', () => {})
  it.skip('should view client progress with consent', () => {})
  it.skip('should return 403 when accessing data without consent', () => {})
  it.skip('should allow therapist to add private notes', () => {})
  it.skip('should add company as consulting client', () => {})
  it.skip('should access company inclusivity metrics (aggregated only)', () => {})
  it.skip('should show aggregated metrics across all clients', () => {})
  it.skip('should compare therapist client metrics vs platform average', () => {})
  it.skip('should recommend candidate to company with consent', () => {})
  it.skip('should NOT recommend without explicit consent', () => {})
  it.skip('should show pending requests', () => {})
  it.skip('should detect crisis situations and alert therapist', () => {})
  it.skip('should handle client requesting to change therapist', () => {})
})
