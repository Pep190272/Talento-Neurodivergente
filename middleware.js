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
import NextAuth from 'next-auth'
import { authConfig } from './app/lib/auth.config'
import { rateLimit, RATE_LIMITS } from './app/lib/rate-limiter.js'

const { auth } = NextAuth(authConfig)

export default async function middleware(req) {
  const path = req.nextUrl.pathname
  const session = await auth()

  // ═══════════════════════════════════════════════════════════════════════
  // AUTHENTICATION & REDIRECTS (Security Architect)
  // ═══════════════════════════════════════════════════════════════════════

  // 1. Proteger rutas de Dashboard
  if (path.startsWith('/dashboard')) {
    if (!session) {
      // Usuario no autenticado intentando entrar -> Login
      const loginUrl = new URL('/auth/role-selection', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Redirigir si usuario ya logueado intenta ir a Login
  if ((path === '/login' || path === '/register') && session) {
    // Redirigir a su dashboard correspondiente según rol
    const role = session.user?.type
    let target = '/dashboard'

    if (role === 'company') target = '/dashboard/company'
    else if (role === 'individual') target = '/dashboard/candidate'
    else if (role === 'therapist') target = '/dashboard/therapist'

    return NextResponse.redirect(new URL(target, req.url))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════════════════════════════

  // Obtener identificador para rate limiting (IP)
  const identifier = req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'unknown'

  // Bypassing rate limiting in development environment because it is annoying
  if (process.env.NODE_ENV === 'development') {
    return handleSecurityHeaders(NextResponse.next())
  }

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

  // Strict-Transport-Security: Forzar HTTPS durante 1 año (solo producción)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  // Content-Security-Policy: Prevenir inyección de scripts
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')
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

function handleSecurityHeaders(response) {
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

  // Content-Security-Policy: Prevenir inyección de scripts
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')
  )

  return response
}
