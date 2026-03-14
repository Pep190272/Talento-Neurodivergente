// app/lib/rate-limiter.ts
/**
 * In-Memory Rate Limiter
 *
 * Implementa rate limiting simple basado en memoria.
 * Para producción con múltiples instancias, considerar Redis.
 *
 * Algoritmo: Sliding Window (ventana deslizante)
 * - Mantiene timestamps de requests en una ventana de tiempo
 * - Limpia automáticamente requests antiguos
 */

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

const requests = new Map<string, number[]>()

function cleanOldRequests(identifier: string, windowMs: number): number[] {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!requests.has(identifier)) {
    return []
  }

  const userRequests = requests.get(identifier)!
  const recentRequests = userRequests.filter(time => time > windowStart)

  if (recentRequests.length === 0) {
    requests.delete(identifier)
    return []
  }

  requests.set(identifier, recentRequests)
  return recentRequests
}

export function rateLimit(identifier: string, options: RateLimitOptions = {}): RateLimitResult {
  const {
    windowMs = 60000,
    maxRequests = 60
  } = options

  const now = Date.now()
  const recentRequests = cleanOldRequests(identifier, windowMs)

  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0]
    const resetTime = oldestRequest + windowMs

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    }
  }

  recentRequests.push(now)
  requests.set(identifier, recentRequests)

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
    resetTime: now + windowMs
  }
}

export function clearAllRateLimits(): void {
  requests.clear()
}

export function getRateLimiterStats(): { totalIdentifiers: number; totalRequests: number } {
  let totalRequests = 0

  for (const [, userRequests] of requests) {
    totalRequests += userRequests.length
  }

  return {
    totalIdentifiers: requests.size,
    totalRequests
  }
}

export const RATE_LIMITS = {
  AUTH: { windowMs: 60000, maxRequests: 5 },
  API: { windowMs: 60000, maxRequests: 60 },
  READ: { windowMs: 60000, maxRequests: 100 },
  WRITE: { windowMs: 60000, maxRequests: 30 },
} as const
