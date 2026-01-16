/**
 * UC-003: Registro de Empresa y Definición de Vacante
 * Tests TDD para registro de empresas y creación de jobs
 *
 * CORE BUSINESS: Matching Marketplace - Supply Side
 * PRIORIDAD: MUST (MVP Critical)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCompany, createJobPosting, analyzeJobInclusivity, getCompanyById, getJobById } from '@/lib/companies'
import { generateUserId, generateJobId } from '@/lib/utils'

describe('UC-003: Company Registration & Job Posting', () => {
  let mockCompanyData
  let mockJobData

  beforeEach(() => {
    mockCompanyData = {
      email: 'hr@techcorp.com',
      name: 'TechCorp',
      industry: 'Technology',
      size: '50-200',
      contact: {
        email: 'hr@techcorp.com',
        phone: '+34123456789'
      }
    }

    mockJobData = {
      title: 'Software Engineer',
      description: 'Full-stack developer for modern web applications',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      accommodations: [
        'Remote work',
        'Flexible hours',
        'Async communication',
        'Written documentation'
      ],
      salaryRange: '40k-60k',
      visibility: 'public'
    }
  })

  describe('Company Registration', () => {
    it('should create company profile with unique companyId', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.companyId).toMatch(/^comp_/)
      expect(result.name).toBe('TechCorp')
      expect(result.industry).toBe('Technology')
      expect(result.status).toBe('active')
      expect(result.createdAt).toBeDefined()
    })

    it('should initialize empty jobs array', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.jobs).toEqual([])
    })

    it('should reject duplicate company email', async () => {
      await createCompany(mockCompanyData)

      await expect(createCompany(mockCompanyData)).rejects.toThrow('Company email already exists')
    })

    it('should validate required company fields', async () => {
      const invalidData = { email: 'test@example.com' } // missing name

      await expect(createCompany(invalidData)).rejects.toThrow('Company name is required')
    })
  })

  describe('Job Posting Creation', () => {
    it('should create job posting with unique jobId', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.jobId).toMatch(/^job_/)
      expect(job.companyId).toBe(company.companyId)
      expect(job.title).toBe('Software Engineer')
      expect(job.status).toBe('active')
      expect(job.createdAt).toBeDefined()
    })

    it('should link job to company jobs array', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      const updatedCompany = await getCompanyById(company.companyId)
      expect(updatedCompany.jobs).toContain(job.jobId)
    })

    it('should initialize empty matches object', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.matches).toEqual({
        pending: [],
        accepted: []
      })
    })

    it('should require at least one accommodation', async () => {
      const jobWithoutAccommodations = {
        ...mockJobData,
        accommodations: []
      }

      const company = await createCompany(mockCompanyData)

      await expect(
        createJobPosting(company.companyId, jobWithoutAccommodations)
      ).rejects.toThrow('At least one accommodation is required')
    })
  })

  describe('OpenAI Inclusivity Analysis', () => {
    it('should analyze job posting for inclusivity', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.inclusivityScore).toBeGreaterThanOrEqual(0)
      expect(job.inclusivityScore).toBeLessThanOrEqual(100)
      expect(job.inclusivityAnalysis).toBeDefined()
    })

    it('should score higher with more accommodations', async () => {
      const company = await createCompany(mockCompanyData)

      const jobFewAccommodations = await createJobPosting(company.companyId, {
        ...mockJobData,
        accommodations: ['Remote work']
      })

      const jobManyAccommodations = await createJobPosting(company.companyId, {
        ...mockJobData,
        accommodations: [
          'Remote work',
          'Flexible hours',
          'Async communication',
          'Written documentation',
          'Quiet workspace',
          'Noise-cancelling headphones'
        ]
      })

      expect(jobManyAccommodations.inclusivityScore).toBeGreaterThan(
        jobFewAccommodations.inclusivityScore
      )
    })

    it('should detect discriminatory language', async () => {
      const jobWithDiscriminatoryLanguage = {
        ...mockJobData,
        description: 'We only hire young, energetic rockstars who can work long hours'
      }

      const company = await createCompany(mockCompanyData)

      const result = await analyzeJobInclusivity(jobWithDiscriminatoryLanguage)

      expect(result.hasDiscriminatoryLanguage).toBe(true)
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'age_discrimination',
          text: 'young'
        })
      )
      expect(result.suggestedRevisions).toBeDefined()
    })

    it('should block job posting with high discrimination score', async () => {
      const discriminatoryJob = {
        ...mockJobData,
        description: 'Only neurotypical candidates with perfect communication skills'
      }

      const company = await createCompany(mockCompanyData)

      await expect(
        createJobPosting(company.companyId, discriminatoryJob)
      ).rejects.toThrow('Job posting contains discriminatory language')
    })

    it('should suggest additional accommodations', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.suggestedAccommodations).toBeInstanceOf(Array)
      expect(job.suggestedAccommodations.length).toBeGreaterThan(0)
    })
  })

  describe('Skills Analysis', () => {
    it('should categorize skills into technical and soft', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.skillsBreakdown).toBeDefined()
      expect(job.skillsBreakdown.technical).toContain('JavaScript')
      expect(job.skillsBreakdown.technical).toContain('React')
    })

    it('should reject overly generic skills', async () => {
      const jobWithGenericSkills = {
        ...mockJobData,
        skills: ['Communication', 'Teamwork', 'Leadership'] // all generic
      }

      const company = await createCompany(mockCompanyData)

      const result = await analyzeJobInclusivity(jobWithGenericSkills)

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'generic_skills',
          message: 'Skills are too generic for effective matching'
        })
      )
    })
  })

  describe('Visibility Settings', () => {
    it('should create public job visible in searches by default', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.visibility).toBe('public')
    })

    it('should create private job not visible in public searches', async () => {
      const privateJobData = {
        ...mockJobData,
        visibility: 'private'
      }

      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, privateJobData)

      expect(job.visibility).toBe('private')
      expect(job.allowDirectApplications).toBe(false) // default for private
    })

    it('should allow direct applications for public jobs', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, {
        ...mockJobData,
        allowDirectApplications: true
      })

      expect(job.allowDirectApplications).toBe(true)
    })
  })

  describe('Data Persistence', () => {
    it('should save company to data/users/companies/{companyId}.json', async () => {
      const company = await createCompany(mockCompanyData)
      const saved = await getCompanyById(company.companyId)

      expect(saved).toBeDefined()
      expect(saved.companyId).toBe(company.companyId)
    })

    it('should save job to data/jobs/{jobId}.json', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      const saved = await getJobById(job.jobId)

      expect(saved).toBeDefined()
      expect(saved.jobId).toBe(job.jobId)
      expect(saved.companyId).toBe(company.companyId)
    })
  })

  describe('Edge Cases', () => {
    it('should handle OpenAI API failure gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('OpenAI API Error'))

      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      // Should save without analysis but mark for manual review
      expect(job.inclusivityScore).toBeUndefined()
      expect(job.reviewStatus).toBe('pending_manual_review')
    })

    it('should detect duplicate job postings', async () => {
      const company = await createCompany(mockCompanyData)
      const job1 = await createJobPosting(company.companyId, mockJobData)

      // Try to create very similar job
      const result = await createJobPosting(company.companyId, mockJobData)

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'potential_duplicate',
          similarJobId: job1.jobId
        })
      )
    })

    it('should warn when no accommodations added', async () => {
      const jobMinimalAccommodations = {
        ...mockJobData,
        accommodations: []
      }

      const company = await createCompany(mockCompanyData)

      await expect(
        createJobPosting(company.companyId, jobMinimalAccommodations)
      ).rejects.toThrow('At least one accommodation is required')
    })

    it('should handle existing company adding new job', async () => {
      const company = await createCompany(mockCompanyData)
      const job1 = await createJobPosting(company.companyId, mockJobData)
      const job2 = await createJobPosting(company.companyId, {
        ...mockJobData,
        title: 'Senior Software Engineer'
      })

      const updatedCompany = await getCompanyById(company.companyId)

      expect(updatedCompany.jobs).toHaveLength(2)
      expect(updatedCompany.jobs).toContain(job1.jobId)
      expect(updatedCompany.jobs).toContain(job2.jobId)
    })
  })

  describe('Integration with Dashboard', () => {
    it('should redirect to /dashboard/company after registration', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.redirectTo).toBe('/dashboard/company')
    })

    it('should show "0 matches" initially', async () => {
      const company = await createCompany(mockCompanyData)
      const job = await createJobPosting(company.companyId, mockJobData)

      expect(job.matches.pending).toHaveLength(0)
      expect(job.matches.accepted).toHaveLength(0)
    })
  })
})
