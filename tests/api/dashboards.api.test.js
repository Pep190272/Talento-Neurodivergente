/**
 * Tests for Dashboards API Routes (TDD - RED phase)
 * Testing Next.js API endpoints for dashboards
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

// Mock lib/dashboards
vi.mock('@/lib/dashboards', () => ({
  getIndividualDashboard: vi.fn(),
  getCompanyDashboard: vi.fn()
}))

describe('Dashboards API Routes - TDD Tests', () => {

  describe('GET /api/dashboards/individual/:userId', () => {
    it('should return individual dashboard data', async () => {
      const mockDashboard = {
        userId: 'user-1',
        profile: {
          name: 'John Doe',
          skills: ['JavaScript', 'React']
        },
        stats: {
          profileViews: 25,
          matches: 10,
          activeApplications: 3
        },
        recentMatches: [
          {
            jobId: 'job-1',
            companyName: 'Tech Corp',
            score: 0.85,
            status: 'pending'
          },
          {
            jobId: 'job-2',
            companyName: 'StartupXYZ',
            score: 0.78,
            status: 'interested'
          }
        ],
        consents: [
          {
            companyId: 'comp-1',
            jobId: 'job-1',
            status: 'granted'
          }
        ]
      }

      const { GET } = await import('@/api/dashboards/individual/[userId]/route.js')
      const { getIndividualDashboard } = await import('@/lib/dashboards')
      getIndividualDashboard.mockResolvedValue(mockDashboard)

      const mockRequest = {}
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.userId).toBe('user-1')
      expect(data.data.stats.matches).toBe(10)
      expect(data.data.recentMatches).toHaveLength(2)
      expect(getIndividualDashboard).toHaveBeenCalledWith('user-1')
    })

    it('should return 404 if user not found', async () => {
      const { GET } = await import('@/api/dashboards/individual/[userId]/route.js')
      const { getIndividualDashboard } = await import('@/lib/dashboards')
      getIndividualDashboard.mockResolvedValue(null)

      const mockRequest = {}
      const mockParams = { params: { userId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should handle dashboard generation errors', async () => {
      const { GET } = await import('@/api/dashboards/individual/[userId]/route.js')
      const { getIndividualDashboard } = await import('@/lib/dashboards')
      getIndividualDashboard.mockRejectedValue(new Error('Database error'))

      const mockRequest = {}
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Internal server error')
    })
  })

  describe('GET /api/dashboards/company/:companyId', () => {
    it('should return company dashboard data', async () => {
      const mockDashboard = {
        companyId: 'comp-1',
        profile: {
          companyName: 'Tech Corp',
          industry: 'Technology'
        },
        stats: {
          activeJobs: 5,
          totalCandidates: 42,
          matchedCandidates: 15,
          pendingConsents: 8
        },
        activeJobs: [
          {
            jobId: 'job-1',
            title: 'Software Engineer',
            status: 'active',
            candidates: 12,
            topMatches: 3
          },
          {
            jobId: 'job-2',
            title: 'Product Manager',
            status: 'active',
            candidates: 8,
            topMatches: 2
          }
        ],
        recentMatches: [
          {
            userId: 'user-1',
            candidateName: 'John Doe',
            jobId: 'job-1',
            score: 0.88,
            status: 'pending'
          },
          {
            userId: 'user-2',
            candidateName: 'Jane Smith',
            jobId: 'job-1',
            score: 0.82,
            status: 'consent_granted'
          }
        ]
      }

      const { GET } = await import('@/api/dashboards/company/[companyId]/route.js')
      const { getCompanyDashboard } = await import('@/lib/dashboards')
      getCompanyDashboard.mockResolvedValue(mockDashboard)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.companyId).toBe('comp-1')
      expect(data.data.stats.activeJobs).toBe(5)
      expect(data.data.activeJobs).toHaveLength(2)
      expect(data.data.recentMatches).toHaveLength(2)
      expect(getCompanyDashboard).toHaveBeenCalledWith('comp-1')
    })

    it('should return 404 if company not found', async () => {
      const { GET } = await import('@/api/dashboards/company/[companyId]/route.js')
      const { getCompanyDashboard } = await import('@/lib/dashboards')
      getCompanyDashboard.mockResolvedValue(null)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should handle dashboard generation errors', async () => {
      const { GET } = await import('@/api/dashboards/company/[companyId]/route.js')
      const { getCompanyDashboard } = await import('@/lib/dashboards')
      getCompanyDashboard.mockRejectedValue(new Error('Calculation error'))

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Internal server error')
    })

    it('should return empty arrays if company has no data', async () => {
      const mockDashboard = {
        companyId: 'comp-1',
        profile: {
          companyName: 'New Corp'
        },
        stats: {
          activeJobs: 0,
          totalCandidates: 0,
          matchedCandidates: 0,
          pendingConsents: 0
        },
        activeJobs: [],
        recentMatches: []
      }

      const { GET } = await import('@/api/dashboards/company/[companyId]/route.js')
      const { getCompanyDashboard } = await import('@/lib/dashboards')
      getCompanyDashboard.mockResolvedValue(mockDashboard)

      const mockRequest = {}
      const mockParams = { params: { companyId: 'comp-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.stats.activeJobs).toBe(0)
      expect(data.data.activeJobs).toHaveLength(0)
      expect(data.data.recentMatches).toHaveLength(0)
    })
  })
})
