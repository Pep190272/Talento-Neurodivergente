/**
 * In-memory password reset token store.
 * Tokens expire after 1 hour. For production scale,
 * consider adding a PasswordResetToken model to Prisma.
 */

import crypto from 'crypto'

interface ResetToken {
  email: string
  expiresAt: number
}

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const tokens = new Map<string, ResetToken>()

export function generateResetToken(email: string): string {
  // Invalidate any existing tokens for this email
  for (const [key, value] of tokens) {
    if (value.email === email) tokens.delete(key)
  }

  const token = crypto.randomBytes(32).toString('hex')
  tokens.set(token, {
    email,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })
  return token
}

export function validateResetToken(token: string): string | null {
  const entry = tokens.get(token)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    tokens.delete(token)
    return null
  }
  return entry.email
}

export function consumeResetToken(token: string): string | null {
  const email = validateResetToken(token)
  if (email) tokens.delete(token)
  return email
}
