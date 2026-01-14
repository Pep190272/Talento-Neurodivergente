/**
 * Tests for Matching API Routes (TDD - RED phase)
 * Testing Next.js API endpoints for matching engine
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

// Mock lib/matching
vi.mock('@/lib/matching', () => ({
  findMatchesForJob: vi.fn(),
  findMatchesForCandidate: vi.fn()
}))

// Mock lib/companies (for job validation)
vi.mock('@/lib/companies', () => ({
  getJobPosting: vi.fn()
}))

// Mock lib/individuals (for candidate validation)
vi.mock('@/lib/individuals', () => ({
  getIndividualProfile: vi.fn()
}))

describe('Matching API Routes - TDD Tests', () => {

  describe('GET /api/matching/jobs/:jobId', () => {
    it('should return candidate matches for a job', async () => {
      const mockJob = {
        id: 'job-1',
        title: 'Software Engineer',
        requiredSkills: ['JavaScript', 'React']
      }

      const mockMatches = [
        {
          candidateId: 'user-1',
          score: 0.85,
          breakdown: {
            skillsMatch: 0.9,
            accommodationsMatch: 0.8,
            preferencesMatch: 0.85,
            locationMatch: 1.0
          }
        },
        {
          candidateId: 'user-2',
          score: 0.75,
          breakdown: {
            skillsMatch: 0.8,
            accommodationsMatch: 0.7,
            preferencesMatch: 0.75,
            locationMatch: 0.9
          }
        }
      ]

      const { GET } = await import('@/api/matching/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      const { findMatchesForJob } = await import('@/lib/matching')

      getJobPosting.mockResolvedValue(mockJob)
      findMatchesForJob.mockResolvedValue(mockMatches)

      const mockRequest = { url: 'http://localhost/api/matching/jobs/job-1' }
      const mockParams = { params: { jobId: 'job-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].score).toBe(0.85)
      expect(findMatchesForJob).toHaveBeenCalledWith('job-1')
    })

    it('should return 404 if job not found', async () => {
      const { GET } = await import('@/api/matching/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      getJobPosting.mockResolvedValue(null)

      const mockRequest = { url: 'http://localhost/api/matching/jobs/nonexistent' }
      const mockParams = { params: { jobId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return empty array if no matches found', async () => {
      const mockJob = { id: 'job-1', title: 'Job' }

      const { GET } = await import('@/api/matching/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      const { findMatchesForJob } = await import('@/lib/matching')

      getJobPosting.mockResolvedValue(mockJob)
      findMatchesForJob.mockResolvedValue([])

      const mockRequest = { url: 'http://localhost/api/matching/jobs/job-1' }
      const mockParams = { params: { jobId: 'job-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })

    it('should handle minScore query parameter', async () => {
      const mockJob = { id: 'job-1', title: 'Job' }
      const mockMatches = [
        { candidateId: 'user-1', score: 0.9 },
        { candidateId: 'user-2', score: 0.7 }
      ]

      const { GET } = await import('@/api/matching/jobs/[jobId]/route.js')
      const { getJobPosting } = await import('@/lib/companies')
      const { findMatchesForJob } = await import('@/lib/matching')

      getJobPosting.mockResolvedValue(mockJob)
      findMatchesForJob.mockResolvedValue(mockMatches)

      const mockRequest = { url: 'http://localhost/api/matching/jobs/job-1?minScore=0.8' }
      const mockParams = { params: { jobId: 'job-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should filter matches with score >= 0.8
      expect(data.data).toHaveLength(1)
      expect(data.data[0].score).toBe(0.9)
    })
  })

  describe('GET /api/matching/candidates/:userId', () => {
    it('should return job matches for a candidate', async () => {
      const mockProfile = {
        id: 'user-1',
        profile: {
          name: 'John Doe',
          skills: ['JavaScript', 'React']
        }
      }

      const mockMatches = [
        {
          jobId: 'job-1',
          score: 0.88,
          breakdown: {
            skillsMatch: 0.9,
            accommodationsMatch: 0.85,
            preferencesMatch: 0.9,
            locationMatch: 0.87
          }
        },
        {
          jobId: 'job-2',
          score: 0.72,
          breakdown: {
            skillsMatch: 0.75,
            accommodationsMatch: 0.7,
            preferencesMatch: 0.7,
            locationMatch: 0.75
          }
        }
      ]

      const { GET } = await import('@/api/matching/candidates/[userId]/route.js')
      const { getIndividualProfile } = await import('@/lib/individuals')
      const { findMatchesForCandidate } = await import('@/lib/matching')

      getIndividualProfile.mockResolvedValue(mockProfile)
      findMatchesForCandidate.mockResolvedValue(mockMatches)

      const mockRequest = { url: 'http://localhost/api/matching/candidates/user-1' }
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].score).toBe(0.88)
      expect(findMatchesForCandidate).toHaveBeenCalledWith('user-1')
    })

    it('should return 404 if candidate not found', async () => {
      const { GET } = await import('@/api/matching/candidates/[userId]/route.js')
      const { getIndividualProfile } = await import('@/lib/individuals')
      getIndividualProfile.mockResolvedValue(null)

      const mockRequest = { url: 'http://localhost/api/matching/candidates/nonexistent' }
      const mockParams = { params: { userId: 'nonexistent' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return empty array if no job matches found', async () => {
      const mockProfile = { id: 'user-1', profile: { name: 'John' } }

      const { GET } = await import('@/api/matching/candidates/[userId]/route.js')
      const { getIndividualProfile } = await import('@/lib/individuals')
      const { findMatchesForCandidate } = await import('@/lib/matching')

      getIndividualProfile.mockResolvedValue(mockProfile)
      findMatchesForCandidate.mockResolvedValue([])

      const mockRequest = { url: 'http://localhost/api/matching/candidates/user-1' }
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })

    it('should handle minScore query parameter', async () => {
      const mockProfile = { id: 'user-1', profile: { name: 'John' } }
      const mockMatches = [
        { jobId: 'job-1', score: 0.92 },
        { jobId: 'job-2', score: 0.65 }
      ]

      const { GET } = await import('@/api/matching/candidates/[userId]/route.js')
      const { getIndividualProfile } = await import('@/lib/individuals')
      const { findMatchesForCandidate } = await import('@/lib/matching')

      getIndividualProfile.mockResolvedValue(mockProfile)
      findMatchesForCandidate.mockResolvedValue(mockMatches)

      const mockRequest = { url: 'http://localhost/api/matching/candidates/user-1?minScore=0.7' }
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should filter matches with score >= 0.7
      expect(data.data).toHaveLength(1)
      expect(data.data[0].score).toBe(0.92)
    })

    it('should handle limit query parameter', async () => {
      const mockProfile = { id: 'user-1', profile: { name: 'John' } }
      const mockMatches = [
        { jobId: 'job-1', score: 0.9 },
        { jobId: 'job-2', score: 0.85 },
        { jobId: 'job-3', score: 0.8 }
      ]

      const { GET } = await import('@/api/matching/candidates/[userId]/route.js')
      const { getIndividualProfile } = await import('@/lib/individuals')
      const { findMatchesForCandidate } = await import('@/lib/matching')

      getIndividualProfile.mockResolvedValue(mockProfile)
      findMatchesForCandidate.mockResolvedValue(mockMatches)

      const mockRequest = { url: 'http://localhost/api/matching/candidates/user-1?limit=2' }
      const mockParams = { params: { userId: 'user-1' } }

      const response = await GET(mockRequest, mockParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should return only first 2 matches
      expect(data.data).toHaveLength(2)
      expect(data.data[0].score).toBe(0.9)
      expect(data.data[1].score).toBe(0.85)
    })
  })
})
