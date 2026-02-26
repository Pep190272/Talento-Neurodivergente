/**
 * UC-003: Company Registration & Job Posting
 * TDD Tests — Prisma-backed implementation
 *
 * Methodology: Red → Green → Refactor
 * DB isolation: vi.mock('@/lib/prisma') — no real DB in unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createCompany,
  createJobPosting,
  analyzeJobInclusivity,
  getCompany,
  getJobPosting,
} from '@/lib/companies'

// ─── LLM Mock (so tests don't call Ollama) ───────────────────────────────────
vi.mock('@/lib/services/llm.service', () => ({
  analyzeJobInclusivity: vi.fn().mockRejectedValue(new Error('LLM not available in tests')),
}))
vi.mock('@/lib/schemas/job-analysis', () => ({
  validateJobAnalysis: vi.fn((x: unknown) => x),
}))

// ─── Prisma Mock ─────────────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => {
  const tx = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    company: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    job: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  }
  return {
    default: {
      ...tx,
      $transaction: vi.fn().mockImplementation(
        (fn: (tx: typeof tx) => unknown) => fn(tx)
      ),
    },
  }
})

// ─── Test fixtures ────────────────────────────────────────────────────────────

const USER_ID = 'test-user-cuid-company-001'
const COMPANY_ID = 'test-company-cuid-001'
const JOB_ID = 'test-job-cuid-001'

const mockUser = {
  id: USER_ID,
  email: 'hr@techcorp.com',
  passwordHash: '$2b$10$hashedpassword',
  userType: 'company' as const,
  status: 'active',
  createdAt: new Date('2026-02-20T10:00:00Z'),
  updatedAt: new Date('2026-02-20T10:00:00Z'),
}

const mockCompany = {
  id: COMPANY_ID,
  userId: USER_ID,
  name: 'TechCorp',
  industry: 'Technology',
  size: '50-200',
  location: 'Madrid, Spain',
  website: 'https://techcorp.com',
  description: 'Innovative tech company',
  contact: { email: 'hr@techcorp.com', phone: '+34123456789' },
  diversityCommitment: 'We are committed to neurodiversity',
  neurodiversityPrograms: [],
  subscriptionPlan: 'free',
  stripeCustomerId: null,
  metadata: { lastLogin: null, jobsPosted: 0, candidatesHired: 0, averageTimeToHire: null },
  createdAt: new Date('2026-02-20T10:00:00Z'),
  updatedAt: new Date('2026-02-20T10:00:00Z'),
  user: mockUser,
  jobs: [],
}

const mockJob = {
  id: JOB_ID,
  companyId: COMPANY_ID,
  title: 'Software Engineer',
  description: 'Full-stack developer for modern web applications',
  status: 'PUBLISHED',
  skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
  accommodations: ['Remote work', 'Flexible hours', 'Async communication', 'Written documentation'],
  salaryRange: '40k-60k',
  workMode: 'remote',
  visibility: 'public',
  location: null,
  benefits: [],
  teamSize: null,
  reportingStructure: null,
  inclusivityScore: 100,
  inclusivityAnalysis: {
    score: 100,
    hasDiscriminatoryLanguage: false,
    issues: [],
    suggestions: [],
    llmPowered: false,
  },
  closedAt: null,
  createdAt: new Date('2026-02-20T10:00:00Z'),
  updatedAt: new Date('2026-02-20T10:00:00Z'),
}

// ─── Setup ────────────────────────────────────────────────────────────────────

import prisma from '@/lib/prisma'

beforeEach(() => {
  vi.clearAllMocks()

  // Default: no existing user (allows creation)
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

  // Default transaction: creates user then company
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
    const tx = {
      user: {
        create: vi.fn().mockResolvedValue(mockUser),
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(mockUser),
      },
      company: {
        create: vi.fn().mockResolvedValue(mockCompany),
        findUnique: vi.fn().mockResolvedValue(mockCompany),
        update: vi.fn().mockResolvedValue(mockCompany),
        findMany: vi.fn().mockResolvedValue([mockCompany]),
      },
      job: {
        create: vi.fn().mockResolvedValue(mockJob),
        findUnique: vi.fn().mockResolvedValue(mockJob),
        update: vi.fn().mockResolvedValue(mockJob),
        findMany: vi.fn().mockResolvedValue([mockJob]),
      },
    }
    return (fn as (tx: typeof tx) => unknown)(tx)
  })

  // getCompany (reads company by userId or id)
  vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany as never)

  // createJobPosting calls prisma.job.create directly
  vi.mocked(prisma.job.create).mockResolvedValue(mockJob as never)

  // getJobPosting (reads job by id)
  vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as never)
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UC-003: Company Registration & Job Posting', () => {
  let mockCompanyData: Parameters<typeof createCompany>[0]
  let mockJobData: Parameters<typeof createJobPosting>[1]

  beforeEach(() => {
    mockCompanyData = {
      email: 'hr@techcorp.com',
      name: 'TechCorp',
      industry: 'Technology',
      size: '50-200',
      contact: {
        email: 'hr@techcorp.com',
        phone: '+34123456789',
      },
    }

    mockJobData = {
      title: 'Software Engineer',
      description: 'Full-stack developer for modern web applications',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      accommodations: [
        'Remote work',
        'Flexible hours',
        'Async communication',
        'Written documentation',
      ],
      salaryRange: '40k-60k',
      visibility: 'public',
    }
  })

  // ─── Company Registration ──────────────────────────────────────────────────

  describe('Company Registration', () => {
    it('should create company profile with companyId', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.companyId).toBe(COMPANY_ID)
      expect(result.name).toBe('TechCorp')
      expect(result.industry).toBe('Technology')
      expect(result.status).toBe('active')
      expect(result.createdAt).toBeDefined()
    })

    it('should initialize empty jobs array', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.jobs).toEqual([])
    })

    it('should include email and userId', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.email).toBe('hr@techcorp.com')
      expect(result.userId).toBe(USER_ID)
    })

    it('should reject duplicate company email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      await expect(createCompany(mockCompanyData)).rejects.toThrow('Company email already exists')
    })

    it('should validate required company name', async () => {
      await expect(
        createCompany({ email: 'test@example.com' })
      ).rejects.toThrow('Company name is required')
    })

    it('should validate email format', async () => {
      await expect(
        createCompany({ email: 'not-an-email', name: 'Test' })
      ).rejects.toThrow('Invalid email format')
    })

    it('should redirect to /dashboard/company after registration', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.redirectTo).toBe('/dashboard/company')
    })

    it('should include metadata with initial counters', async () => {
      const result = await createCompany(mockCompanyData)

      expect(result.metadata).toMatchObject({
        jobsPosted: 0,
        candidatesHired: 0,
      })
    })
  })

  // ─── Job Posting Creation ──────────────────────────────────────────────────

  describe('Job Posting Creation', () => {
    it('should create job posting with jobId', async () => {
      const job = await createJobPosting(COMPANY_ID, mockJobData)

      expect(job.jobId).toBe(JOB_ID)
      expect(job.companyId).toBe(COMPANY_ID)
      expect(job.title).toBe('Software Engineer')
      expect(job.status).toBe('active')
      expect(job.createdAt).toBeDefined()
    })

    it('should initialize empty matches object', async () => {
      const job = await createJobPosting(COMPANY_ID, mockJobData)

      expect(job.matches).toEqual({ pending: [], accepted: [] })
    })

    it('should include inclusivity analysis', async () => {
      const job = await createJobPosting(COMPANY_ID, mockJobData)

      expect(job.inclusivityScore).toBeGreaterThanOrEqual(0)
      expect(job.inclusivityScore).toBeLessThanOrEqual(100)
      expect(job.inclusivityAnalysis).toBeDefined()
    })

    it('should have visibility set to public by default', async () => {
      const job = await createJobPosting(COMPANY_ID, mockJobData)

      expect(job.visibility).toBe('public')
    })

    it('should flag matchingTriggered after creation', async () => {
      const job = await createJobPosting(COMPANY_ID, mockJobData)

      expect(job.matchingTriggered).toBe(true)
    })

    it('should require at least one accommodation', async () => {
      await expect(
        createJobPosting(COMPANY_ID, { ...mockJobData, accommodations: [] })
      ).rejects.toThrow('At least one accommodation is required')
    })

    it('should require title field', async () => {
      const { title: _t, ...noTitle } = mockJobData
      await expect(
        createJobPosting(COMPANY_ID, noTitle as never)
      ).rejects.toThrow()
    })
  })

  // ─── Inclusivity Analysis ──────────────────────────────────────────────────

  describe('Inclusivity Analysis', () => {
    it('should analyze job posting for inclusivity (fallback)', async () => {
      const result = await analyzeJobInclusivity(mockJobData)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.hasDiscriminatoryLanguage).toBe(false)
    })

    it('should detect discriminatory language (young, energetic, rockstar)', async () => {
      const result = await analyzeJobInclusivity({
        ...mockJobData,
        description: 'We only hire young, energetic rockstars who can work long hours',
      })

      expect(result.hasDiscriminatoryLanguage).toBe(true)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should score higher with more accommodations', async () => {
      const fewAccommodations = await analyzeJobInclusivity({
        ...mockJobData,
        accommodations: ['Remote work'],
      })

      const manyAccommodations = await analyzeJobInclusivity({
        ...mockJobData,
        accommodations: [
          'Remote work',
          'Flexible hours',
          'Async communication',
          'Written documentation',
          'Quiet workspace',
          'Noise-cancelling headphones',
        ],
      })

      expect(manyAccommodations.score).toBeGreaterThanOrEqual(fewAccommodations.score)
    })

    it('should block job with discriminatory language', async () => {
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUser) },
          company: { create: vi.fn().mockResolvedValue(mockCompany), findUnique: vi.fn().mockResolvedValue(mockCompany) },
          job: { create: vi.fn().mockResolvedValue(mockJob) },
        }
        return (fn as (tx: typeof tx) => unknown)(tx)
      })

      await expect(
        createJobPosting(COMPANY_ID, {
          ...mockJobData,
          description: 'Only young energetic rockstars needed',
        })
      ).rejects.toThrow('Discriminatory language detected')
    })
  })

  // ─── Data Retrieval ────────────────────────────────────────────────────────

  describe('Data Retrieval', () => {
    it('should retrieve company by companyId (Company.id)', async () => {
      const result = await getCompany(COMPANY_ID)

      expect(result).toBeDefined()
      expect(result!.companyId).toBe(COMPANY_ID)
      expect(result!.email).toBe('hr@techcorp.com')
    })

    it('should return null when company not found', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null)

      const result = await getCompany('nonexistent-id')

      expect(result).toBeNull()
    })

    it('should retrieve job by jobId (Job.id)', async () => {
      const result = await getJobPosting(JOB_ID)

      expect(result).toBeDefined()
      expect(result!.jobId).toBe(JOB_ID)
      expect(result!.title).toBe('Software Engineer')
    })

    it('should return null when job not found', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null)

      const result = await getJobPosting('nonexistent-id')

      expect(result).toBeNull()
    })
  })
})
