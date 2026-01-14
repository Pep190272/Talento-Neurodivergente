/**
 * Tests for Companies API Routes (TDD - RED phase)
 * Testing Next.js API endpoints for company management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Next.js server utilities
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
    })
  }
}))

// Mock lib/companies
vi.mock('@/lib/companies', () => ({
  createCompany: vi.fn(),
  getCompany: vi.fn(),
  updateCompany: vi.fn(),
  createJobPosting: vi.fn(),
  getCompanyJobs: vi.fn(),
  getJobPosting: vi.fn(),
  updateJobPosting: vi.fn(),
  closeJob: vi.fn()
}))

describe('Companies API Routes - TDD Tests', () => {

  describe('POST /api/companies', () => {
    it('should create a new company profile with valid data', async () => {
      const mockCompanyData = {
        email: 'empresa@test.com',
        profile: {
          companyName: 'Tech Corp',
          industry: 'Technology',
          size: '50-200'
        }
      }

      const { POST } = await import('@/api/companies/route.js')
      const mockRequest = {
        json: vi.fn().mockResolvedValue(mockCompanyData)
      }

      const { createCompany } = await import('@/lib/companies')
      createCompany.mockResolvedValue({ id: 'comp-1', ...mockCompanyData })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('comp-1')
    })

    it('should return 400 if email is missing', async () => {
      const { POST } = await import('@/api/companies/route.js')
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          profile: { companyName: 'Tech Corp' }
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Email')
    })

    it('should return 400 if company name is missing', async () => {
      const { POST } = await import('@/api/companies/route.js')
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'empresa@test.com',
          profile: {}
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Company name')
    })

    it('should return 409 if company already exists', async () => {
      const { POST } = await import('@/api/companies/route.js')
      const { createCompany } = await import('@/lib/companies')

      createCompany.mockRejectedValue(new Error('Company already exists'))

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'empresa@test.com',
          profile: { companyName: 'Tech Corp' }
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })
  })

  describe('GET /api/companies/:companyId', () => {
    it('should return company profile when it exists', async () => {
      const mockCompany = {
        id: 'comp-1',
        email: 'empresa@test.com',
        profile: { companyName: 'Tech Corp' }
      }

      const { GET } = await import('@/api/companies/[companyId]/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(mockCompany)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('comp-1')
    })

    it('should return 404 if company not found', async () => {
      const { GET } = await import('@/api/companies/[companyId]/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(null)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  describe('PATCH /api/companies/:companyId', () => {
    it('should update company profile', async () => {
      const mockExisting = { id: 'comp-1', profile: { companyName: 'Old Name' } }
      const mockUpdated = { id: 'comp-1', profile: { companyName: 'New Name' } }

      const { PATCH } = await import('@/api/companies/[companyId]/route.js')
      const { getCompany, updateCompany } = await import('@/lib/companies')

      getCompany.mockResolvedValue(mockExisting)
      updateCompany.mockResolvedValue(mockUpdated)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          profile: { companyName: 'New Name' }
        })
      }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await PATCH(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.profile.companyName).toBe('New Name')
    })

    it('should return 404 if company not found', async () => {
      const { PATCH } = await import('@/api/companies/[companyId]/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(null)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ profile: { companyName: 'New' } })
      }
      const mockParams = { params: { companyId: 'nonexistent' } }

      const response = await PATCH(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  describe('POST /api/companies/:companyId/jobs', () => {
    it('should create a new job posting', async () => {
      const mockJobData = {
        title: 'Software Engineer',
        description: 'Great opportunity',
        requiredSkills: ['JavaScript', 'React']
      }

      const mockCompany = { id: 'comp-1', profile: { companyName: 'Tech Corp' } }
      const mockJob = { id: 'job-1', ...mockJobData, companyId: 'comp-1' }

      const { POST } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany, createJobPosting } = await import('@/lib/companies')

      getCompany.mockResolvedValue(mockCompany)
      createJobPosting.mockResolvedValue(mockJob)

      const mockRequest = {
        json: vi.fn().mockResolvedValue(mockJobData)
      }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await POST(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('job-1')
    })

    it('should return 404 if company not found', async () => {
      const { POST } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(null)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          title: 'Job',
          description: 'Desc'
        })
      }
      const mockParams = { params: { companyId: 'nonexistent' } }

      const response = await POST(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Company not found')
    })

    it('should return 400 if title is missing', async () => {
      const mockCompany = { id: 'comp-1' }

      const { POST } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(mockCompany)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          description: 'Desc only'
        })
      }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await POST(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('title')
    })

    it('should return 400 if description is missing', async () => {
      const mockCompany = { id: 'comp-1' }

      const { POST } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(mockCompany)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          title: 'Title only'
        })
      }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await POST(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('description')
    })
  })

  describe('GET /api/companies/:companyId/jobs', () => {
    it('should return all active jobs for a company', async () => {
      const mockCompany = { id: 'comp-1' }
      const mockJobs = [
        { id: 'job-1', title: 'Job 1', status: 'active' },
        { id: 'job-2', title: 'Job 2', status: 'active' }
      ]

      const { GET } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany, getCompanyJobs } = await import('@/lib/companies')

      getCompany.mockResolvedValue(mockCompany)
      getCompanyJobs.mockResolvedValue(mockJobs)

      const mockRequest = { url: 'http://localhost/api/companies/comp-1/jobs' }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.count).toBe(2)
    })

    it('should filter jobs by status query parameter', async () => {
      const mockCompany = { id: 'comp-1' }
      const mockClosedJobs = [
        { id: 'job-3', title: 'Job 3', status: 'closed' }
      ]

      const { GET } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany, getCompanyJobs } = await import('@/lib/companies')

      getCompany.mockResolvedValue(mockCompany)
      getCompanyJobs.mockResolvedValue(mockClosedJobs)

      const mockRequest = { url: 'http://localhost/api/companies/comp-1/jobs?status=closed' }
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(getCompanyJobs).toHaveBeenCalledWith('comp-1', { status: 'closed' })
    })

    it('should return 404 if company not found', async () => {
      const { GET } = await import('@/api/companies/[companyId]/jobs/route.js')
      const { getCompany } = await import('@/lib/companies')
      getCompany.mockResolvedValue(null)

      const mockRequest = { url: 'http://localhost/api/companies/nonexistent/jobs' }
      const mockParams = { params: { companyId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/companies/:companyId/jobs/:jobId', () => {
    it('should return job details', async () => {
      const mockJob = {
        id: 'job-1',
        companyId: 'comp-1',
        title: 'Software Engineer'
      }

      const { GET } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(mockJob)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('job-1')
    })

    it('should return 404 if job not found', async () => {
      const { GET } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(null)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 403 if job belongs to different company', async () => {
      const mockJob = {
        id: 'job-1',
        companyId: 'comp-2',
        title: 'Job'
      }

      const { GET } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(mockJob)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('does not belong')
    })
  })

  describe('PATCH /api/companies/:companyId/jobs/:jobId', () => {
    it('should update job posting', async () => {
      const mockExisting = { id: 'job-1', companyId: 'comp-1', title: 'Old' }
      const mockUpdated = { id: 'job-1', companyId: 'comp-1', title: 'New' }

      const { PATCH } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting, updateJobPosting } = await import('@/lib/companies')

      getJobPosting.mockResolvedValue(mockExisting)
      updateJobPosting.mockResolvedValue(mockUpdated)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ title: 'New' })
      }
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await PATCH(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('New')
    })

    it('should return 404 if job not found', async () => {
      const { PATCH } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(null)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ title: 'New' })
      }
      const mockParams = { params: { companyId: 'comp-1', jobId: 'nonexistent' } }

      const response = await PATCH(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
    })

    it('should return 403 if job belongs to different company', async () => {
      const mockJob = { id: 'job-1', companyId: 'comp-2' }

      const { PATCH } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(mockJob)

      const mockRequest = {
        json: vi.fn().mockResolvedValue({ title: 'New' })
      }
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await PATCH(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/companies/:companyId/jobs/:jobId', () => {
    it('should close job posting', async () => {
      const mockJob = { id: 'job-1', companyId: 'comp-1', status: 'active' }

      const { DELETE } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting, closeJob } = await import('@/lib/companies')

      getJobPosting.mockResolvedValue(mockJob)
      closeJob.mockResolvedValue(undefined)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await DELETE(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('closed')
    })

    it('should return 404 if job not found', async () => {
      const { DELETE } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(null)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'nonexistent' } }

      const response = await DELETE(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
    })

    it('should return 403 if job belongs to different company', async () => {
      const mockJob = { id: 'job-1', companyId: 'comp-2' }

      const { DELETE } = await import('@/api/companies/[companyId]/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(mockJob)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1', jobId: 'job-1' } }

      const response = await DELETE(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(403)
    })
  })
})
