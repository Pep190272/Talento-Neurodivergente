/**
 * Centralized Exception Handling — Issue #64
 *
 * Provides typed error classes and a withErrorHandler wrapper
 * for all API routes. Replaces scattered try/catch blocks with
 * consistent error responses and structured logging.
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req, ctx) => { ... })
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

// ─── Error Classes ───────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthenticationError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} not found: ${id}` : `${resource} not found`,
      404,
      'NOT_FOUND'
    )
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMITED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

// ─── Error Handler Wrapper ───────────────────────────────────────────────────

type RouteContext = { params: Promise<Record<string, string>> }
type RouteHandler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>

/**
 * Wraps an API route handler with centralized error handling.
 * Catches AppError subclasses and returns structured JSON responses.
 * Unknown errors return 500 with sanitized message (no stack in production).
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RouteContext) => {
    try {
      return await handler(req, ctx)
    } catch (error) {
      if (error instanceof AppError) {
        const body: Record<string, unknown> = {
          error: error.code,
          message: error.message,
        }
        if (error.details) body.details = error.details
        return NextResponse.json(body, { status: error.statusCode })
      }

      // Prisma known errors
      if (isPrismaError(error)) {
        return handlePrismaError(error)
      }

      // Unknown error — log and return sanitized response
      logger.error('API', `${req.method} ${req.nextUrl.pathname}`, error)

      const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (error as Error).message

      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message },
        { status: 500 }
      )
    }
  }
}

// ─── Prisma Error Handling ───────────────────────────────────────────────────

function isPrismaError(error: unknown): boolean {
  return (error as Record<string, unknown>)?.constructor?.name?.startsWith?.('Prisma') ?? false
}

function handlePrismaError(error: unknown): NextResponse {
  const prismaError = error as { code?: string; meta?: Record<string, unknown>; message?: string }
  const code = prismaError.code

  switch (code) {
    case 'P2002': // Unique constraint violation
      return NextResponse.json(
        { error: 'CONFLICT', message: 'Resource already exists', field: prismaError.meta?.target },
        { status: 409 }
      )
    case 'P2025': // Record not found
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Resource not found' },
        { status: 404 }
      )
    default:
      logger.error('Prisma', `${code} ${prismaError.message}`)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: 'Database operation failed' },
        { status: 500 }
      )
  }
}
