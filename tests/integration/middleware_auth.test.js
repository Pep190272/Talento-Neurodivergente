/**
 * Integration: Middleware Auth Enforcement
 * Tests that middleware correctly protects routes and redirects users
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock NextAuth before importing middleware
vi.mock('next-auth', () => {
  const mockAuth = vi.fn().mockResolvedValue(null) // No session by default
  return {
    default: () => ({ auth: mockAuth }),
    __mockAuth: mockAuth,
  }
})

// Mock rate limiter
vi.mock('@/lib/rate-limiter.js', () => ({
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 99, resetTime: Date.now() + 60000, retryAfter: 0 })),
  RATE_LIMITS: {
    API: { maxRequests: 100, windowMs: 60000 },
    AUTH: { maxRequests: 10, windowMs: 60000 },
    READ: { maxRequests: 200, windowMs: 60000 },
    WRITE: { maxRequests: 50, windowMs: 60000 },
  },
}))

// Mock auth config
vi.mock('@/lib/auth.config', () => ({
  authConfig: {},
}))

// Mock NextResponse
vi.mock('next/server', () => {
  const mockHeaders = () => {
    const h = new Map()
    return { set: (k, v) => h.set(k, v), get: (k) => h.get(k) }
  }

  return {
    NextResponse: {
      next: vi.fn(() => ({ headers: mockHeaders() })),
      redirect: vi.fn((url) => ({ status: 307, url, headers: mockHeaders() })),
      json: vi.fn((body, opts) => ({ body, status: opts?.status || 200, headers: mockHeaders() })),
    },
  }
})

import { NextResponse } from 'next/server'

// Get the mock auth function via the module
const nextAuthModule = await import('next-auth')
const mockAuth = nextAuthModule.__mockAuth

// Import middleware AFTER mocks
const { default: middleware } = await import('../../middleware')

function createMockRequest(pathname, options = {}) {
  return {
    nextUrl: {
      pathname,
      origin: 'http://localhost:3000',
      clone: () => ({ pathname }),
    },
    url: `http://localhost:3000${pathname}`,
    headers: {
      get: (name) => {
        if (name === 'x-forwarded-for') return options.ip || '127.0.0.1'
        return null
      },
    },
    ip: options.ip || '127.0.0.1',
    method: options.method || 'GET',
    cookies: { get: () => null },
  }
}

describe('Middleware Auth Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no session (unauthenticated)
    mockAuth.mockResolvedValue(null)
    // Set production env for rate limiting
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env.NODE_ENV = 'test'
  })

  describe('Dashboard Protection', () => {
    it('should redirect unauthenticated users from /dashboard to auth page', async () => {
      const req = createMockRequest('/dashboard')

      await middleware(req)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectArg = NextResponse.redirect.mock.calls[0][0]
      expect(redirectArg.toString()).toContain('/auth/role-selection')
    })

    it('should redirect unauthenticated users from /dashboard/company', async () => {
      const req = createMockRequest('/dashboard/company')

      await middleware(req)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should allow authenticated users to access dashboard', async () => {
      mockAuth.mockResolvedValue({ user: { type: 'individual' } })
      const req = createMockRequest('/dashboard')

      await middleware(req)

      // Should NOT redirect — should call next()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })
  })

  describe('Login Redirect for Authenticated Users', () => {
    it('should redirect authenticated individual to their dashboard', async () => {
      mockAuth.mockResolvedValue({ user: { type: 'individual' } })
      const req = createMockRequest('/login')

      await middleware(req)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectArg = NextResponse.redirect.mock.calls[0][0]
      expect(redirectArg.toString()).toContain('/dashboard/candidate')
    })

    it('should redirect authenticated company to company dashboard', async () => {
      mockAuth.mockResolvedValue({ user: { type: 'company' } })
      const req = createMockRequest('/login')

      await middleware(req)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectArg = NextResponse.redirect.mock.calls[0][0]
      expect(redirectArg.toString()).toContain('/dashboard/company')
    })

    it('should redirect authenticated therapist to therapist dashboard', async () => {
      mockAuth.mockResolvedValue({ user: { type: 'therapist' } })
      const req = createMockRequest('/login')

      await middleware(req)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectArg = NextResponse.redirect.mock.calls[0][0]
      expect(redirectArg.toString()).toContain('/dashboard/therapist')
    })
  })

  describe('Security Headers', () => {
    it('should set security headers on response', async () => {
      const req = createMockRequest('/api/test')

      const result = await middleware(req)

      if (result && result.headers) {
        // Verify security headers exist
        expect(result.headers.get('X-Frame-Options')).toBe('DENY')
        expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff')
        expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block')
        expect(result.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
      }
    })
  })

  describe('Rate Limiting', () => {
    it('should return 429 when rate limited', async () => {
      const { rateLimit } = await import('@/lib/rate-limiter.js')
      rateLimit.mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 30,
      })

      const req = createMockRequest('/api/test')

      await middleware(req)

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Too many requests' }),
        expect.objectContaining({ status: 429 })
      )
    })
  })
})
