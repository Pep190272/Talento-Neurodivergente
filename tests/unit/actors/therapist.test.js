/**
 * UC-008: Registro de Terapeuta
 * UC-009: Dashboard Terapeuta con Clientes
 * Tests TDD para terapeutas y especialistas
 *
 * CORE BUSINESS: Support for both sides (candidates + companies)
 * PRIORIDAD: MUST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createTherapist,
  verifyTherapist,
  getTherapistClients,
  getTherapistDashboard,
  addTherapistNotes,
  addCompanyClient,
  getCompanyMetricsForTherapist,
  getTherapistAggregateMetrics,
  requestTherapistForOnboarding,
  checkClientAlerts,
  addClientToTherapist
} from '@/lib/therapists'
import {
  requestTherapistAccess,
  revokeTherapistAccess,
  requestRecommendationConsent,
  recommendCandidateToCompany,
  changeTherapist
} from '@/lib/consent'
import { createIndividualProfile } from '@/lib/individuals'
import { createCompany } from '@/lib/companies'

// individuals.ts now uses Prisma — mock it so therapist tests don't need a real DB
// These tests are about THERAPIST functionality; individuals are test fixtures only
vi.mock('@/lib/individuals', () => {
  // Stateful map so addTherapistToIndividual/removeTherapistFromIndividual
  // are reflected in subsequent getIndividualProfile calls (needed for changeTherapist test)
  const therapistMap = new Map() // userId → therapistId

  const makeIndividual = (data) => {
    const userId = `ind_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const privacy = {
      visibleInSearch: true,
      showRealName: true,
      shareDiagnosis: false,
      shareTherapistContact: false,
      shareAssessmentDetails: true,
      allowTherapistAccess: true, // consent.js checks this field
      ...(data.privacy || {}),
    }
    return {
      userId,
      individualId: `indid_${userId}`,
      email: data.email || 'test@example.com',
      userType: 'individual',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
      profile: {
        name: data.profile?.name || 'Test User',
        location: null,
        bio: '',
        diagnoses: data.profile?.diagnoses || [],
        skills: data.profile?.skills || [],
        experience: [],
        education: [],
        accommodationsNeeded: data.profile?.accommodationsNeeded || [],
        preferences: data.profile?.preferences || {},
        therapistId: null,
        medicalHistory: null,
      },
      privacy,
      assessment: { completed: false, completedAt: null, strengths: [], challenges: [], score: null, technicalSkills: [], softSkills: [], workStyle: {} },
      metadata: { lastLogin: null, profileViews: 0, matchesReceived: 0, applicationsSubmitted: 0 },
      matches: { pending: [], accepted: [], rejected: [] },
      connections: [],
      validationStatus: 'pending',
    }
  }

  const getProfile = async (userId) => ({
    userId,
    email: 'test@example.com',
    status: 'active',
    profile: {
      name: 'Test User',
      skills: [],
      experience: [],
      diagnoses: [],
      accommodationsNeeded: [],
      preferences: {},
      location: null,
      bio: '',
      therapistId: therapistMap.get(userId) || null, // reflects addTherapistToIndividual calls
      medicalHistory: null,
      education: [],
    },
    privacy: {
      visibleInSearch: true,
      showRealName: true,
      shareDiagnosis: false,
      shareTherapistContact: false,
      shareAssessmentDetails: true,
      allowTherapistAccess: true, // consent.js checks this
    },
    assessment: { completed: false, score: null, strengths: [], challenges: [], technicalSkills: [], softSkills: [], workStyle: {} },
    metadata: { lastLogin: null, profileViews: 0, matchesReceived: 0, applicationsSubmitted: 0 },
    matches: { pending: [], accepted: [], rejected: [] },
    connections: [],
  })

  return {
    createIndividualProfile: vi.fn().mockImplementation(async (data) => makeIndividual(data)),
    getIndividualProfile: vi.fn().mockImplementation(getProfile),
    getIndividualById: vi.fn().mockImplementation(getProfile),
    updateIndividualProfile: vi.fn().mockImplementation(async (userId) => getProfile(userId)),
    updatePrivacySettings: vi.fn().mockResolvedValue({}),
    completeAssessment: vi.fn().mockResolvedValue({}),
    deactivateIndividual: vi.fn().mockResolvedValue({}),
    deleteUserAccount: vi.fn().mockResolvedValue(undefined),
    getPublicProfile: vi.fn().mockResolvedValue({}),
    getPublicProfileView: vi.fn().mockReturnValue({}),
    getProfileForCompany: vi.fn().mockResolvedValue({}),
    getVisibleIndividuals: vi.fn().mockResolvedValue([]),
    calculateProfileCompletion: vi.fn().mockResolvedValue({ percentage: 0 }),
    // Stateful: update therapistMap so getProfile reflects the assignment
    addTherapistToIndividual: vi.fn().mockImplementation(async (userId, therapistId) => {
      therapistMap.set(userId, therapistId)
      return {}
    }),
    removeTherapistFromIndividual: vi.fn().mockImplementation(async (userId) => {
      therapistMap.delete(userId)
      return {}
    }),
    validateIndividualData: vi.fn().mockResolvedValue({ validated: true, suggestions: [], normalized: {} }),
  }
})

describe('UC-008: Therapist Registration', () => {
  let mockTherapistData

  beforeEach(() => {
    mockTherapistData = {
      email: `dr.smith.${Date.now()}@therapy.com`,
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
        email: `newnd.${Date.now()}@therapy.com`,
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
        email: `expired.${Date.now()}@therapy.com`,
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
        email: `unrec.${Date.now()}@therapy.com`,
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
        email: `norates.${Date.now()}@therapy.com`,
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
      const therapist = await createTherapist({
        ...mockTherapistData,
        email: `verify.${Date.now()}@therapy.com`
      })

      const verified = await verifyTherapist(therapist.therapistId, {
        verifiedBy: 'admin_123',
        notes: 'Credentials verified with State Board'
      })

      expect(verified.status).toBe('active')
      expect(verified.verifiedAt).toBeDefined()
      expect(verified.verifiedBy).toBe('admin_123')
    })

    it('should send welcome email after verification', async () => {
      const therapist = await createTherapist({
        ...mockTherapistData,
        email: `welcome.${Date.now()}@therapy.com`
      })
      const verified = await verifyTherapist(therapist.therapistId, {})

      expect(verified.welcomeEmailSent).toBe(true)
      expect(verified.redirectTo).toBe('/dashboard/therapist')
    })

    it('should allow admin to reject therapist application', async () => {
      const therapist = await createTherapist({
        ...mockTherapistData,
        email: `reject.${Date.now()}@therapy.com`
      })

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
      const therapist = await createTherapist({
        ...mockTherapistData,
        email: `noclients.${Date.now()}@therapy.com`
      })
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
      const therapist = await createTherapist({
        ...mockTherapistData,
        email: `resources.${Date.now()}@therapy.com`
      })
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
// ============================================================

describe('UC-009: Therapist Dashboard with Clients', () => {
  let therapist
  let individual
  let company
  let mockTherapistData

  beforeEach(async () => {
    // Configurar ENCRYPTION_KEY para tests
    if (!process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = '0'.repeat(64)
    }

    const timestamp = Date.now()

    mockTherapistData = {
      email: `dr.dashboard.${timestamp}@therapy.com`,
      profile: {
        name: 'Dr. Dashboard Test',
        certifications: [
          {
            title: 'Licensed Clinical Psychologist',
            licenseNumber: 'PSY12345',
            issuingBody: 'State Board of Psychology',
            expiryDate: '2026-12-31'
          }
        ],
        specializations: ['autism', 'ADHD'],
        neurodiversityExperience: 5,
        services: ['individual_support', 'company_consulting']
      }
    }

    therapist = await createTherapist(mockTherapistData)
    await verifyTherapist(therapist.therapistId, {})

    individual = await createIndividualProfile({
      email: `client.${timestamp}@example.com`,
      profile: {
        name: 'Client User',
        diagnoses: ['ADHD'],
        skills: ['JavaScript'],
        accommodationsNeeded: ['Flexible Schedule']
      },
      privacy: {
        allowTherapistAccess: true,
        showRealName: true,
        shareDiagnosis: true
      }
    })

    company = await createCompany({
      email: `company.${timestamp}@example.com`,
      name: 'TestCorp',
      contactName: 'HR Manager'
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
      // Create individual without therapist access
      const individualNoConsent = await createIndividualProfile({
        email: `noconsent.${Date.now()}@example.com`,
        profile: { name: 'No Consent User', diagnoses: ['autism'], skills: ['Python'] },
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
    it('should allow therapist to add private notes', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const notes = await addTherapistNotes(therapist.therapistId, individual.userId, {
        content: 'Client is making progress with anxiety management',
        private: true
      })

      expect(notes.therapistId).toBe(therapist.therapistId)
      expect(notes.clientId).toBe(individual.userId)
      expect(notes.private).toBe(true)
    })

    it('should return error when accessing data without consent', async () => {
      // Don't add client to therapist
      await expect(
        addTherapistNotes(therapist.therapistId, individual.userId, {
          content: 'Test',
          private: true
        })
      ).rejects.toThrow('Access denied: No consent from client')
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
    it('should request recommendation consent from client', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      // Request consent from client (not auto-approve)
      const consent = await requestRecommendationConsent(
        therapist.therapistId,
        individual.userId,
        company.companyId,
        'job_123'
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
    it('should detect potential alerts for clients', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const alerts = await checkClientAlerts(therapist.therapistId)

      expect(alerts.urgentAlerts).toBeDefined()
      expect(alerts.regularAlerts).toBeDefined()
    })

    it('should handle client requesting to change therapist', async () => {
      await addClientToTherapist(therapist.therapistId, individual.userId)

      const newTherapist = await createTherapist({
        ...mockTherapistData,
        email: `newtherapist.${Date.now()}@example.com`
      })
      await verifyTherapist(newTherapist.therapistId, {})

      await changeTherapist(individual.userId, newTherapist.therapistId)

      const oldClients = await getTherapistClients(therapist.therapistId)
      const newClients = await getTherapistClients(newTherapist.therapistId)

      expect(oldClients.individualClients).toHaveLength(0)
      expect(newClients.individualClients).toHaveLength(1)
    })
  })
})
