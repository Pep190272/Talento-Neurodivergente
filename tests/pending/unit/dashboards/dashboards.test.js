/**
 * UC-006: Dashboard Individual con Métricas
 * UC-007: Dashboard Empresa con Pipeline
 * UC-009: Dashboard Terapeuta con Clientes
 *
 * Tests TDD para dashboards y métricas de cada actor
 * CORE BUSINESS: Transparency & Engagement
 * PRIORIDAD: MUST
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getIndividualDashboard,
  getCompanyDashboard,
  getTherapistDashboard
} from '@/lib/dashboards'
import { createIndividualProfile } from '@/lib/individuals'
import { createCompany, createJobPosting } from '@/lib/companies'
import { createTherapist, verifyTherapist } from '@/lib/therapists'
import { calculateMatch, acceptMatch } from '@/lib/matching'

describe('UC-006: Individual Dashboard', () => {
  let candidate

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'candidate@example.com',
      profile: {
        name: 'Test Candidate',
        skills: ['JavaScript', 'React'],
        experience: [{ title: 'Developer', years: 3 }]
      },
      privacy: { visibleInSearch: true }
    })
  })

  describe('Profile Completion', () => {
    it('should calculate profile completion percentage', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.profileCompletion).toBeDefined()
      expect(dashboard.profileCompletion).toBeGreaterThanOrEqual(0)
      expect(dashboard.profileCompletion).toBeLessThanOrEqual(100)
    })

    it('should weight assessment as 40% of completion', async () => {
      const incompleteCandidate = await createIndividualProfile({
        email: 'incomplete@example.com',
        profile: { name: 'Incomplete', skills: ['JS'] },
        assessment: { completed: false }
      })

      const dashboard = await getIndividualDashboard(incompleteCandidate.userId)

      expect(dashboard.profileCompletion).toBeLessThan(60) // missing 40%
    })

    it('should show completion breakdown', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.completionBreakdown).toEqual(
        expect.objectContaining({
          assessment: expect.any(Number), // 40%
          experience: expect.any(Number), // 30%
          preferences: expect.any(Number), // 20%
          additionalSkills: expect.any(Number) // 10%
        })
      )
    })
  })

  describe('Active Matches', () => {
    it('should show pending matches', async () => {
      const company = await createCompany({ email: 'co@example.com', name: 'Corp' })
      const job = await createJobPosting(company.companyId, {
        title: 'Developer',
        skills: ['JavaScript'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {}) // enable matching

      const match = await calculateMatch(candidate.userId, job.jobId)

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.activeMatches).toHaveLength(1)
      expect(dashboard.activeMatches[0]).toEqual(
        expect.objectContaining({
          matchId: match.matchId,
          jobTitle: 'Developer',
          companyName: 'Corp',
          score: match.score,
          status: 'pending'
        })
      )
    })

    it('should show accepted matches separately', async () => {
      const company = await createCompany({ email: 'co@example.com', name: 'Corp' })
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JS'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.acceptedMatches).toHaveLength(1)
      expect(dashboard.pendingMatches).toHaveLength(0)
    })
  })

  describe('Pending Actions', () => {
    it('should show "Complete assessment" if not done', async () => {
      const incompleteCandidate = await createIndividualProfile({
        email: 'incomplete@example.com',
        profile: { name: 'Inc', skills: ['JS'] },
        assessment: { completed: false }
      })

      const dashboard = await getIndividualDashboard(incompleteCandidate.userId)

      expect(dashboard.pendingActions).toContainEqual(
        expect.objectContaining({
          action: 'complete_assessment',
          priority: 'high',
          cta: 'Complete Assessment'
        })
      )
    })

    it('should show "Review new matches" if pending matches exist', async () => {
      const company = await createCompany({ email: 'co@example.com', name: 'Corp' })
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JavaScript'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      await calculateMatch(candidate.userId, job.jobId)

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.pendingActions).toContainEqual(
        expect.objectContaining({
          action: 'review_matches',
          count: 1
        })
      )
    })

    it('should suggest updating skills if >90 days old', async () => {
      candidate.profile.lastUpdated = new Date(Date.now() - 100 * 86400000) // 100 days

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.pendingActions).toContainEqual(
        expect.objectContaining({
          action: 'update_skills',
          reason: 'Profile not updated in 90+ days'
        })
      )
    })
  })

  describe('Privacy Controls', () => {
    it('should show current privacy settings', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.privacyControls).toEqual(
        expect.objectContaining({
          visibleInSearch: true,
          showRealName: false,
          shareDiagnosis: false
        })
      )
    })

    it('should list companies with access', async () => {
      const company = await createCompany({ email: 'co@example.com', name: 'Corp' })
      const job = await createJobPosting(company.companyId, {
        title: 'Dev',
        skills: ['JavaScript'],
        accommodations: ['Remote']
      })

      await completeAssessment(candidate.userId, {})
      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.privacyControls.companiesWithAccess).toHaveLength(1)
      expect(dashboard.privacyControls.companiesWithAccess[0]).toEqual(
        expect.objectContaining({
          companyId: company.companyId,
          companyName: 'Corp',
          accessGrantedAt: expect.any(Date)
        })
      )
    })

    it('should provide revoke consent action', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.privacyControls.actions).toContainEqual(
        expect.objectContaining({
          action: 'revoke_consent',
          available: true
        })
      )
    })
  })

  describe('Metrics', () => {
    it('should show total matches received', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.metrics.totalMatches).toBeDefined()
      expect(dashboard.metrics.totalMatches).toBeGreaterThanOrEqual(0)
    })

    it('should show acceptance/rejection ratio', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.metrics).toEqual(
        expect.objectContaining({
          matchesAccepted: expect.any(Number),
          matchesRejected: expect.any(Number),
          acceptanceRate: expect.any(Number)
        })
      )
    })

    it('should show profile views (if consent given)', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.metrics.profileViews).toBeDefined()
    })
  })

  describe('AI Insights', () => {
    it('should provide personalized insights', async () => {
      await completeAssessment(candidate.userId, {
        strengths: ['Attention to detail', 'Problem solving']
      })

      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.aiInsights).toBeDefined()
      expect(dashboard.aiInsights.topStrength).toBe('Attention to detail')
      expect(dashboard.aiInsights.suggestions).toBeInstanceOf(Array)
    })

    it('should suggest ways to improve match rate', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      if (dashboard.metrics.acceptanceRate < 50) {
        expect(dashboard.aiInsights.suggestions).toContainEqual(
          expect.objectContaining({
            type: 'improve_matching',
            suggestion: expect.stringContaining('skills')
          })
        )
      }
    })
  })

  describe('Quick Actions', () => {
    it('should provide quick action buttons', async () => {
      const dashboard = await getIndividualDashboard(candidate.userId)

      expect(dashboard.quickActions).toContainEqual(
        expect.objectContaining({
          label: 'Complete Assessment',
          route: '/quiz'
        })
      )

      expect(dashboard.quickActions).toContainEqual(
        expect.objectContaining({
          label: 'Browse Jobs',
          route: '/jobs'
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle new user with no data', async () => {
      const newUser = await createIndividualProfile({
        email: 'new@example.com',
        profile: { name: 'New User', skills: [] }
      })

      const dashboard = await getIndividualDashboard(newUser.userId)

      expect(dashboard.profileCompletion).toBeLessThan(50)
      expect(dashboard.onboardingTour).toBe(true)
      expect(dashboard.pendingActions).toHaveLength.greaterThan(0)
    })
  })
})

describe('UC-007: Company Dashboard', () => {
  let company, job

  beforeEach(async () => {
    company = await createCompany({
      email: 'company@example.com',
      name: 'TechCorp'
    })

    job = await createJobPosting(company.companyId, {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React'],
      accommodations: ['Remote work', 'Flexible hours']
    })
  })

  describe('Active Jobs', () => {
    it('should list all active jobs', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.activeJobs).toHaveLength(1)
      expect(dashboard.activeJobs[0]).toEqual(
        expect.objectContaining({
          jobId: job.jobId,
          title: 'Software Engineer',
          status: 'active',
          matchesPending: 0,
          matchesActive: 0
        })
      )
    })

    it('should show match counts per job', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JavaScript', 'React'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.activeJobs[0].matchesActive).toBe(1)
    })
  })

  describe('Candidate Pipeline', () => {
    it('should organize candidates by stage', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JavaScript'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.pipeline).toEqual(
        expect.objectContaining({
          newMatches: expect.arrayContaining([
            expect.objectContaining({
              candidateId: candidate.userId,
              stage: 'new'
            })
          ]),
          underReview: expect.any(Array),
          interviewing: expect.any(Array),
          offered: expect.any(Array),
          hired: expect.any(Array)
        })
      )
    })

    it('should allow moving candidates between stages', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JS'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      const accepted = await acceptMatch(match.matchId, candidate.userId)

      await moveCandidateToStage(accepted.connection.connectionId, 'interviewing')

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.pipeline.interviewing).toHaveLength(1)
      expect(dashboard.pipeline.newMatches).toHaveLength(0)
    })

    it('should respect privacy settings in pipeline view', async () => {
      const privateCandidate = await createIndividualProfile({
        email: 'private@example.com',
        profile: {
          name: 'Private Candidate',
          diagnoses: ['ADHD'],
          skills: ['JavaScript']
        },
        privacy: {
          showRealName: false,
          shareDiagnosis: false
        },
        assessment: { completed: true }
      })

      const match = await calculateMatch(privateCandidate.userId, job.jobId)
      await acceptMatch(match.matchId, privateCandidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)

      const candidate = dashboard.pipeline.newMatches[0]
      expect(candidate.name).not.toBe('Private Candidate') // anonymized
      expect(candidate.diagnoses).toBeUndefined() // private
    })
  })

  describe('Metrics', () => {
    it('should show total candidates matched', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.metrics.totalCandidates).toBeDefined()
      expect(dashboard.metrics.totalCandidates).toBeGreaterThanOrEqual(0)
    })

    it('should calculate conversion rate (matches → hired)', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.metrics).toEqual(
        expect.objectContaining({
          totalMatches: expect.any(Number),
          hired: expect.any(Number),
          conversionRate: expect.any(Number)
        })
      )
    })

    it('should track average time to hire', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.metrics.avgTimeToHire).toBeDefined()
    })

    it('should show inclusivity score', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.metrics.inclusivityScore).toBeDefined()
      expect(dashboard.metrics.inclusivityScore).toBeGreaterThanOrEqual(0)
      expect(dashboard.metrics.inclusivityScore).toBeLessThanOrEqual(100)
    })
  })

  describe('Therapist Support', () => {
    it('should show request onboarding support option', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.therapistSupport).toEqual(
        expect.objectContaining({
          available: true,
          requestButton: expect.any(String)
        })
      )
    })

    it('should list available therapists for consulting', async () => {
      const therapist = await createTherapist({
        email: 'therapist@example.com',
        profile: {
          name: 'Dr. Smith',
          services: ['company_consulting'],
          certifications: [{ title: 'Psychologist', licenseNumber: 'PSY123' }],
          specializations: ['autism']
        }
      })

      await verifyTherapist(therapist.therapistId, {})

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.therapistSupport.availableTherapists).toContainEqual(
        expect.objectContaining({
          therapistId: therapist.therapistId,
          name: 'Dr. Smith',
          specializations: expect.arrayContaining(['autism'])
        })
      )
    })
  })

  describe('Actions', () => {
    it('should allow viewing candidate profiles (with consent)', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JS'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)
      const candidateInPipeline = dashboard.pipeline.newMatches[0]

      expect(candidateInPipeline.actions).toContainEqual(
        expect.objectContaining({
          action: 'view_profile',
          available: true
        })
      )
    })

    it('should allow contacting candidates', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JS'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      await acceptMatch(match.matchId, candidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.pipeline.newMatches[0].actions).toContainEqual(
        expect.objectContaining({
          action: 'contact_candidate',
          available: true
        })
      )
    })

    it('should allow requesting additional data (with consent request)', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.actions).toContainEqual(
        expect.objectContaining({
          action: 'request_additional_data',
          requiresConsent: true
        })
      )
    })

    it('should allow closing job', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.activeJobs[0].actions).toContainEqual(
        expect.objectContaining({
          action: 'close_job',
          available: true
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle no candidates yet', async () => {
      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.pipeline.newMatches).toHaveLength(0)
      expect(dashboard.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'improve_job_posting',
          message: 'Tips to attract candidates'
        })
      )
    })

    it('should handle candidate revoking consent during process', async () => {
      const candidate = await createIndividualProfile({
        email: 'candidate@example.com',
        profile: { name: 'Candidate', skills: ['JS'] },
        assessment: { completed: true }
      })

      const match = await calculateMatch(candidate.userId, job.jobId)
      const accepted = await acceptMatch(match.matchId, candidate.userId)

      await revokeConsent(accepted.connection.connectionId, candidate.userId)

      const dashboard = await getCompanyDashboard(company.companyId)

      expect(dashboard.pipeline.newMatches).toHaveLength(0)
    })
  })
})

describe('UC-009: Therapist Dashboard', () => {
  let therapist

  beforeEach(async () => {
    therapist = await createTherapist({
      email: 'therapist@example.com',
      profile: {
        name: 'Dr. Smith',
        certifications: [{ title: 'Psychologist', licenseNumber: 'PSY123' }],
        specializations: ['autism', 'ADHD'],
        services: ['individual_support', 'company_consulting']
      }
    })

    await verifyTherapist(therapist.therapistId, {})
  })

  describe('Client Lists', () => {
    it('should show individual clients (with consent)', async () => {
      const candidate = await createIndividualProfile({
        email: 'client@example.com',
        profile: { name: 'Client', skills: [] },
        privacy: { allowTherapistAccess: true }
      })

      await addClientToTherapist(therapist.therapistId, candidate.userId)

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.individualClients).toHaveLength(1)
      expect(dashboard.individualClients[0].userId).toBe(candidate.userId)
    })

    it('should show company clients', async () => {
      const company = await createCompany({
        email: 'company@example.com',
        name: 'Corp'
      })

      await addCompanyClient(therapist.therapistId, company.companyId, {
        serviceType: 'onboarding_support'
      })

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.companyClients).toHaveLength(1)
      expect(dashboard.companyClients[0].companyId).toBe(company.companyId)
    })
  })

  describe('Aggregated Metrics', () => {
    it('should show anonymous aggregated metrics', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.aggregateMetrics).toEqual(
        expect.objectContaining({
          avgMatchRate: expect.any(Number),
          topStrengthIdentified: expect.any(String),
          mostRequestedAccommodation: expect.any(String)
        })
      )

      // Should NOT contain individual data
      expect(dashboard.aggregateMetrics.individualData).toBeUndefined()
    })

    it('should compare metrics vs platform average', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.aggregateMetrics).toEqual(
        expect.objectContaining({
          avgMatchRate: expect.any(Number),
          platformAvgMatchRate: expect.any(Number),
          performanceComparison: expect.any(String)
        })
      )
    })
  })

  describe('Pending Requests', () => {
    it('should show pending client requests', async () => {
      const candidate = await createIndividualProfile({
        email: 'client@example.com',
        profile: { name: 'Client', skills: [] },
        privacy: { allowTherapistAccess: true }
      })

      await requestTherapistAccess(candidate.userId, therapist.therapistId)

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.pendingRequests).toHaveLength(1)
      expect(dashboard.pendingRequests[0].type).toBe('individual_session')
    })

    it('should show company onboarding requests', async () => {
      const company = await createCompany({
        email: 'company@example.com',
        name: 'Corp'
      })

      await requestTherapistForOnboarding(company.companyId, therapist.therapistId)

      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.pendingRequests).toContainEqual(
        expect.objectContaining({
          type: 'onboarding_support',
          companyId: company.companyId
        })
      )
    })
  })

  describe('Resources', () => {
    it('should provide links to games library', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.resources.gamesLibrary).toBeDefined()
      expect(dashboard.resources.gamesLibrary.url).toBe('/games')
    })

    it('should provide shareable links for client recommendations', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.resources.shareableLinks).toBeInstanceOf(Array)
    })
  })

  describe('Edge Cases', () => {
    it('should handle therapist with no clients', async () => {
      const dashboard = await getTherapistDashboard(therapist.therapistId)

      expect(dashboard.individualClients).toHaveLength(0)
      expect(dashboard.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'get_started',
          message: 'How to get your first clients'
        })
      )
    })
  })
})
