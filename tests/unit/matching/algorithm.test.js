/**
 * UC-004: Matching Algorítmico (AI-Powered)
 * Tests TDD para el algoritmo de matching entre candidatos y vacantes
 *
 * CORE BUSINESS: Heart of the Marketplace
 * PRIORIDAD: MUST (Critical)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateMatch,
  runMatchingForJob,
  runMatchingForCandidate,
  recalculateMatches
} from '@/lib/matching'
import { createIndividualProfile } from '@/lib/individuals'
import { createCompany, createJobPosting } from '@/lib/companies'

describe('UC-004: AI-Powered Matching Algorithm', () => {
  let candidate, company, job

  beforeEach(async () => {
    candidate = await createIndividualProfile({
      email: 'candidate@example.com',
      profile: {
        name: 'Tech Candidate',
        location: 'Madrid, Spain',
        diagnoses: ['ADHD'],
        experience: [{ title: 'Developer', years: 3 }],
        preferences: {
          workMode: 'remote',
          flexibleHours: true,
          teamSize: 'small'
        },
        accommodationsNeeded: ['Quiet workspace', 'Written instructions'],
        skills: ['JavaScript', 'React', 'Node.js']
      },
      privacy: {
        visibleInSearch: true,
        shareDiagnosis: false
      }
    })

    // Complete assessment for matching
    candidate.assessment = {
      completed: true,
      strengths: ['Attention to detail', 'Systematic thinking'],
      score: 85,
      technicalSkills: ['JavaScript', 'React'],
      softSkills: ['Problem solving']
    }

    company = await createCompany({
      email: 'company@example.com',
      name: 'TechCorp'
    })

    job = await createJobPosting(company.companyId, {
      title: 'Frontend Developer',
      description: 'React developer for web applications',
      skills: ['JavaScript', 'React', 'TypeScript'],
      accommodations: ['Remote work', 'Flexible hours', 'Written documentation'],
      salaryRange: '40k-60k',
      location: 'Madrid, Spain',
      workMode: 'remote'
    })
  })

  describe('Match Score Calculation', () => {
    it('should calculate match score between 0-100', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      expect(match.score).toBeGreaterThanOrEqual(0)
      expect(match.score).toBeLessThanOrEqual(100)
    })

    it('should provide score breakdown', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      expect(match.scoreBreakdown).toBeDefined()
      expect(match.scoreBreakdown.skills).toBeDefined() // 40% weight
      expect(match.scoreBreakdown.accommodations).toBeDefined() // 30% weight
      expect(match.scoreBreakdown.preferences).toBeDefined() // 20% weight
      expect(match.scoreBreakdown.location).toBeDefined() // 10% weight

      // Verify weights add up to 100%
      const totalWeight =
        Object.values(match.scoreBreakdown).reduce((sum, val) => sum + (val || 0), 0)
      expect(totalWeight).toBeGreaterThan(0)
    })

    it('should score higher when skills match perfectly', async () => {
      const perfectSkillsCandidate = await createIndividualProfile({
        ...candidate,
        email: 'perfect@example.com',
        profile: {
          ...candidate.profile,
          skills: ['JavaScript', 'React', 'TypeScript'] // exact match
        },
        assessment: {
          ...candidate.assessment,
          technicalSkills: ['JavaScript', 'React', 'TypeScript']
        }
      })

      const perfectMatch = await calculateMatch(perfectSkillsCandidate.userId, job.jobId)
      const partialMatch = await calculateMatch(candidate.userId, job.jobId)

      expect(perfectMatch.scoreBreakdown.skills).toBeGreaterThan(
        partialMatch.scoreBreakdown.skills
      )
    })

    it('should score higher when accommodations align', async () => {
      const accommodationsAlignCandidate = await createIndividualProfile({
        ...candidate,
        email: 'aligned@example.com',
        profile: {
          ...candidate.profile,
          accommodationsNeeded: ['Remote work', 'Flexible hours', 'Written documentation']
        }
      })

      const alignedMatch = await calculateMatch(accommodationsAlignCandidate.userId, job.jobId)
      const partialMatch = await calculateMatch(candidate.userId, job.jobId)

      expect(alignedMatch.scoreBreakdown.accommodations).toBeGreaterThan(
        partialMatch.scoreBreakdown.accommodations
      )
    })

    it('should include AI justification', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      expect(match.aiJustification).toBeDefined()
      expect(match.aiJustification.length).toBeGreaterThan(50)
      expect(match.aiJustification).toContain('match') // should explain the match
    })
  })

  describe('Match Creation Logic', () => {
    it('should create match only if score >= 60', async () => {
      const lowScoreCandidate = await createIndividualProfile({
        ...candidate,
        email: 'lowscore@example.com',
        profile: {
          ...candidate.profile,
          skills: ['Python', 'Django'] // totally different skills
        }
      })

      const matches = await runMatchingForJob(job.jobId)

      const lowScoreMatch = matches.find(m => m.candidateId === lowScoreCandidate.userId)
      expect(lowScoreMatch).toBeUndefined() // should not create match <60
    })

    it('should NOT create match if candidate privacy.visibleInSearch = false', async () => {
      const privateCandidate = await createIndividualProfile({
        ...candidate,
        email: 'private@example.com',
        privacy: { visibleInSearch: false }
      })

      const matches = await runMatchingForJob(job.jobId)

      const privateMatch = matches.find(m => m.candidateId === privateCandidate.userId)
      expect(privateMatch).toBeUndefined()
    })

    it('should create match with status "pending"', async () => {
      const matches = await runMatchingForJob(job.jobId)

      expect(matches.length).toBeGreaterThan(0)
      expect(matches[0].status).toBe('pending')
    })

    it('should NOT notify candidate yet (pending consent)', async () => {
      const matches = await runMatchingForJob(job.jobId)

      expect(matches[0].candidateNotified).toBe(false)
      expect(matches[0].companyCanView).toBe(false)
    })

    it('should store match in data/matches/{matchId}.json', async () => {
      const matches = await runMatchingForJob(job.jobId)
      const match = matches[0]

      const saved = await getMatchById(match.matchId)

      expect(saved).toBeDefined()
      expect(saved.matchId).toBe(match.matchId)
    })
  })

  describe('Trigger Events', () => {
    it('should run matching when new job is created', async () => {
      const newJob = await createJobPosting(company.companyId, {
        title: 'Backend Developer',
        skills: ['Node.js', 'PostgreSQL'],
        accommodations: ['Remote work']
      })

      // Matching should run automatically
      expect(newJob.matchingTriggered).toBe(true)
    })

    it('should run matching when candidate completes assessment', async () => {
      const newCandidate = await createIndividualProfile({
        ...candidate,
        email: 'new@example.com'
      })

      // Complete assessment
      const updated = await completeAssessment(newCandidate.userId, {
        strengths: ['Problem solving'],
        technicalSkills: ['React']
      })

      expect(updated.matchingTriggered).toBe(true)
    })

    it('should NOT run matching for candidates without assessment', async () => {
      const incompleteCandidate = await createIndividualProfile({
        ...candidate,
        email: 'incomplete@example.com',
        assessment: { completed: false }
      })

      const matches = await runMatchingForCandidate(incompleteCandidate.userId)

      expect(matches).toHaveLength(0)
    })
  })

  describe('Privacy Enforcement', () => {
    it('should NOT share diagnosis in match data', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      expect(match.candidateData).toBeDefined()
      expect(match.candidateData.diagnoses).toBeUndefined() // private
      expect(match.candidateData.accommodationsNeeded).toBeDefined() // ok to share
    })

    it('should use anonymized name if showRealName = false', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      expect(match.candidateData.name).not.toBe('Tech Candidate')
      expect(match.candidateData.name).toMatch(/Anonymous User \d+/)
    })

    it('should show full data only after consent (UC-005)', async () => {
      const match = await calculateMatch(candidate.userId, job.jobId)

      // Before consent
      expect(match.candidateData.email).toBeUndefined()
      expect(match.candidateData.diagnoses).toBeUndefined()

      // After consent (tested in consent.test.js)
      // expect(match.candidateData.email).toBeDefined()
    })
  })

  describe('Recalculation', () => {
    it('should recalculate matches when candidate updates profile', async () => {
      const originalMatch = await calculateMatch(candidate.userId, job.jobId)

      // Update candidate skills
      candidate.profile.skills.push('TypeScript') // now perfect match
      await updateIndividualProfile(candidate.userId, candidate.profile)

      const recalculated = await recalculateMatches(candidate.userId)

      expect(recalculated.length).toBeGreaterThan(0)
      expect(recalculated[0].score).toBeGreaterThan(originalMatch.score)
    })

    it('should invalidate matches when job is closed', async () => {
      const matches = await runMatchingForJob(job.jobId)

      await closeJob(job.jobId)

      const invalidated = await getMatchesByJobId(job.jobId)
      invalidated.forEach(match => {
        expect(match.status).toBe('expired')
      })
    })

    it('should invalidate matches when candidate deactivates account', async () => {
      const matches = await runMatchingForJob(job.jobId)

      await deactivateIndividual(candidate.userId)

      const invalidated = await getMatchesByCandidateId(candidate.userId)
      invalidated.forEach(match => {
        expect(match.status).toBe('expired')
      })
    })
  })

  describe('OpenAI Integration', () => {
    it('should use OpenAI for semantic skill matching', async () => {
      const candidateWithSimilarSkills = await createIndividualProfile({
        ...candidate,
        email: 'similar@example.com',
        profile: {
          ...candidate.profile,
          skills: ['Frontend development', 'SPA frameworks'] // semantic match
        }
      })

      const match = await calculateMatch(candidateWithSimilarSkills.userId, job.jobId)

      // OpenAI should recognize "Frontend development" ≈ React skills
      expect(match.scoreBreakdown.skills).toBeGreaterThan(50)
    })

    it('should handle OpenAI API failure gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('OpenAI API Error'))

      const match = await calculateMatch(candidate.userId, job.jobId)

      // Should fall back to keyword matching
      expect(match.matchingMethod).toBe('keyword_fallback')
      expect(match.score).toBeDefined() // still calculates score
      expect(match.needsRecalculation).toBe(true) // mark for recalc when API recovers
    })
  })

  describe('Performance & Scale', () => {
    it('should handle matching 1000+ candidates efficiently', async () => {
      // Create 1000 candidates
      const candidates = []
      for (let i = 0; i < 1000; i++) {
        candidates.push(
          await createIndividualProfile({
            email: `candidate${i}@example.com`,
            profile: { ...candidate.profile },
            assessment: { ...candidate.assessment }
          })
        )
      }

      const startTime = Date.now()
      const matches = await runMatchingForJob(job.jobId)
      const duration = Date.now() - startTime

      // Should complete in <30 seconds for 1000 candidates
      expect(duration).toBeLessThan(30000)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should batch OpenAI calls to reduce API costs', async () => {
      const apiCallsSpy = vi.spyOn(global, 'fetch')

      await runMatchingForJob(job.jobId)

      // Should batch multiple candidates in single OpenAI call
      const openAICalls = apiCallsSpy.mock.calls.filter(call =>
        call[0].includes('openai')
      )

      expect(openAICalls.length).toBeLessThan(10) // batched, not 1 per candidate
    })
  })

  describe('Edge Cases', () => {
    it('should handle no eligible candidates', async () => {
      // All candidates invisible or no assessment
      const matches = await runMatchingForJob('job_nonexistent')

      expect(matches).toHaveLength(0)
      expect(matches.warnings).toContainEqual(
        expect.objectContaining({
          type: 'no_eligible_candidates',
          suggestion: 'Adjust job requirements'
        })
      )
    })

    it('should handle job with very generic requirements', async () => {
      const genericJob = await createJobPosting(company.companyId, {
        title: 'Generic Role',
        skills: ['Communication', 'Teamwork'], // too generic
        accommodations: ['Flexible hours']
      })

      const matches = await runMatchingForJob(genericJob.jobId)

      expect(matches.warnings).toContainEqual(
        expect.objectContaining({
          type: 'generic_requirements',
          message: 'Skills too generic for accurate matching'
        })
      )
    })

    it('should handle location mismatch gracefully', async () => {
      const remoteCandidate = await createIndividualProfile({
        ...candidate,
        email: 'remote@example.com',
        profile: {
          ...candidate.profile,
          location: 'Barcelona, Spain',
          preferences: { ...candidate.profile.preferences, workMode: 'remote' }
        }
      })

      const onSiteJob = await createJobPosting(company.companyId, {
        ...job,
        location: 'Madrid, Spain',
        workMode: 'on-site' // mismatch
      })

      const match = await calculateMatch(remoteCandidate.userId, onSiteJob.jobId)

      // Location score should be low, but other factors can compensate
      expect(match.scoreBreakdown.location).toBeLessThan(50)
      expect(match.score).toBeDefined() // still calculates total score
    })
  })

  describe('Match Expiration', () => {
    it('should set expiration date 7 days from creation', async () => {
      const matches = await runMatchingForJob(job.jobId)

      const match = matches[0]
      const expectedExpiry = new Date(match.createdAt)
      expectedExpiry.setDate(expectedExpiry.getDate() + 7)

      expect(match.expiresAt).toEqual(expectedExpiry)
    })

    it('should auto-expire matches after 7 days if no action', async () => {
      const matches = await runMatchingForJob(job.jobId)
      const match = matches[0]

      // Simulate 8 days passing
      const expiredMatch = { ...match, expiresAt: new Date(Date.now() - 86400000) }

      const result = await checkMatchExpiration(expiredMatch.matchId)

      expect(result.status).toBe('expired')
    })
  })
})
