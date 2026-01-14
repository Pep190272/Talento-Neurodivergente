/**
 * Tests for Consent API Routes (TDD - RED phase)
 * Testing Next.js API endpoints for consent management
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

// Mock lib/consent
vi.mock('@/lib/consent', () => ({
  grantConsent: vi.fn(),
  rejectConsent: vi.fn(),
  revokeConsent: vi.fn()
}))

describe('Consent API Routes - TDD Tests', () => {

  describe('POST /api/consent/accept', () => {
    it('should accept consent for data sharing', async () => {
      const mockConsentData = {
        userId: 'user-1',
        companyId: 'comp-1',
        jobId: 'job-1',
        consentType: 'match_sharing'
      }

      const mockResult = {
        id: 'consent-1',
        ...mockConsentData,
        status: 'granted',
        timestamp: '2026-01-13T12:00:00Z'
      }

      const { POST } = await import('@/api/consent/accept/route.js')
      const { grantConsent } = await import('@/lib/consent')
      grantConsent.mockResolvedValue(mockResult)

      const mockRequest = {
        json: vi.fn().mockResolvedValue(mockConsentData)
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBe('granted')
      expect(grantConsent).toHaveBeenCalledWith(
        'user-1',
        'comp-1',
        'job-1',
        'match_sharing'
      )
    })

    it('should return 400 if userId is missing', async () => {
      const { POST } = await import('@/api/consent/accept/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          companyId: 'comp-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('userId')
    })

    it('should return 400 if companyId is missing', async () => {
      const { POST } = await import('@/api/consent/accept/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('companyId')
    })

    it('should return 400 if jobId is missing', async () => {
      const { POST } = await import('@/api/consent/accept/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          companyId: 'comp-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('jobId')
    })

    it('should return 400 if consentType is missing', async () => {
      const { POST } = await import('@/api/consent/accept/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          companyId: 'comp-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('consentType')
    })
  })

  describe('POST /api/consent/reject', () => {
    it('should reject consent for data sharing', async () => {
      const mockRejectData = {
        userId: 'user-1',
        companyId: 'comp-1',
        jobId: 'job-1',
        consentType: 'match_sharing'
      }

      const mockResult = {
        id: 'consent-2',
        ...mockRejectData,
        status: 'rejected',
        timestamp: '2026-01-13T12:00:00Z'
      }

      const { POST } = await import('@/api/consent/reject/route.js')
      const { rejectConsent } = await import('@/lib/consent')
      rejectConsent.mockResolvedValue(mockResult)

      const mockRequest = {
        json: vi.fn().mockResolvedValue(mockRejectData)
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBe('rejected')
      expect(rejectConsent).toHaveBeenCalledWith(
        'user-1',
        'comp-1',
        'job-1',
        'match_sharing'
      )
    })

    it('should return 400 if required fields are missing', async () => {
      const { POST } = await import('@/api/consent/reject/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST /api/consent/revoke', () => {
    it('should revoke existing consent', async () => {
      const mockRevokeData = {
        userId: 'user-1',
        companyId: 'comp-1',
        jobId: 'job-1'
      }

      const mockResult = {
        id: 'consent-1',
        ...mockRevokeData,
        status: 'revoked',
        timestamp: '2026-01-13T12:00:00Z',
        revokedAt: '2026-01-13T13:00:00Z'
      }

      const { POST } = await import('@/api/consent/revoke/route.js')
      const { revokeConsent } = await import('@/lib/consent')
      revokeConsent.mockResolvedValue(mockResult)

      const mockRequest = {
        json: vi.fn().mockResolvedValue(mockRevokeData)
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBe('revoked')
      expect(data.message).toContain('revoked')
      expect(revokeConsent).toHaveBeenCalledWith(
        'user-1',
        'comp-1',
        'job-1'
      )
    })

    it('should return 400 if userId is missing', async () => {
      const { POST } = await import('@/api/consent/revoke/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          companyId: 'comp-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('userId')
    })

    it('should return 400 if companyId is missing', async () => {
      const { POST } = await import('@/api/consent/revoke/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('companyId')
    })

    it('should return 400 if jobId is missing', async () => {
      const { POST } = await import('@/api/consent/revoke/route.js')

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          companyId: 'comp-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('jobId')
    })

    it('should return 404 if consent not found', async () => {
      const { POST } = await import('@/api/consent/revoke/route.js')
      const { revokeConsent } = await import('@/lib/consent')

      revokeConsent.mockRejectedValue(new Error('Consent not found'))

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          userId: 'user-1',
          companyId: 'comp-1',
          jobId: 'job-1'
        })
      }

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })
})
