// middleware.js
/**
 * Middleware de Security + Rate Limiting
 *
 * Para MVP, la autenticación se maneja a nivel de ruta.
 * Este middleware se enfoca en:
 * - Security headers
 * - Rate limiting
 *
 * Rutas públicas (sin autenticación):
 * - /, /about, /features, /login, /register
 * - /api/auth/*
 * - POST /api/individuals (registro)
 * - POST /api/companies (registro)
 * - POST /api/therapists (registro)
 */

import { NextResponse } from 'next/server'
import { rateLimit, RATE_LIMITS } from './app/lib/rate-limiter.js'

export default function middleware(req) {
  const path = req.nextUrl.pathname

  // ═══════════════════════════════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════════════════════════════

  // Obtener identificador para rate limiting (IP)
  const identifier = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') ||
                    req.ip ||
                    'unknown'

  // Determinar límites según el endpoint
  let limits = RATE_LIMITS.API // Default

  if (path.startsWith('/api/auth')) {
    limits = RATE_LIMITS.AUTH
  } else if (path.startsWith('/api/')) {
    // Diferenciar entre lectura y escritura
    if (req.method === 'GET' || req.method === 'HEAD') {
      limits = RATE_LIMITS.READ
    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
      limits = RATE_LIMITS.WRITE
    }
  }

  // Aplicar rate limiting
  const { allowed, remaining, resetTime, retryAfter } = rateLimit(identifier, limits)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limits.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  }

  const response = NextResponse.next()

  // Agregar headers de rate limit a la respuesta
  response.headers.set('X-RateLimit-Limit', limits.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', resetTime.toString())

  // ═══════════════════════════════════════════════════════════════════════
  // SECURITY HEADERS
  // ═══════════════════════════════════════════════════════════════════════

  // X-Frame-Options: Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options: Prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-XSS-Protection: Protección XSS (legacy, pero no hace daño)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer-Policy: Controlar información del referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy: Desactivar APIs peligrosas
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

/**
 * Configuración del matcher
 * Define qué rutas pasan por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
}
