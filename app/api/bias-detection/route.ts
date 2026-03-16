/**
 * Bias Detection API — Issue #60
 * POST /api/bias-detection
 *
 * Analyzes job descriptions for discriminatory or exclusionary language
 * toward neurodivergent candidates. Uses LLM when available, falls back
 * to rule-based detection.
 *
 * EU AI Act Art. 10: Data governance — bias monitoring in training/input data
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, ValidationError, AuthenticationError } from '@/lib/errors'
import { detectBias, detectPositiveIndicators, type BiasIssue } from '@/lib/bias-patterns'

// ─── Analysis Function ───────────────────────────────────────────────────────

interface BiasAnalysis {
  discriminatoryLanguage: boolean
  issues: BiasIssue[]
  score: number
  summary: string
  positiveIndicators: string[]
}

function calculateBiasScore(issues: BiasIssue[], positives: string[]): number {
  let score = 80 // Base score

  for (const issue of issues) {
    switch (issue.severity) {
      case 'high': score -= 20; break
      case 'medium': score -= 10; break
      case 'low': score -= 5; break
    }
  }

  // Bonus for positive indicators
  score += Math.min(positives.length * 5, 20)

  return Math.max(0, Math.min(100, score))
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const body = await req.json()
  const { title, description, requirements, accommodations } = body

  if (!title && !description) {
    throw new ValidationError('At least title or description is required')
  }

  const allText = [title, description, requirements].filter(Boolean).join(' ')
  const issues: BiasIssue[] = []

  if (title) issues.push(...detectBias(title, 'title'))
  if (description) issues.push(...detectBias(description, 'description'))
  if (requirements) issues.push(...detectBias(requirements, 'requirements'))

  const positiveIndicators = detectPositiveIndicators(allText)

  // Add positive indicators for accommodations
  if (accommodations?.length > 0) {
    positiveIndicators.push(`${accommodations.length} accommodation(s) listed`)
  }

  const score = calculateBiasScore(issues, positiveIndicators)

  const analysis: BiasAnalysis = {
    discriminatoryLanguage: issues.some(i => i.severity === 'high'),
    issues,
    score,
    summary: issues.length === 0
      ? 'No discriminatory language detected. Job posting appears neurodiversity-friendly.'
      : `Found ${issues.length} potential bias issue(s). Review suggestions to improve inclusivity.`,
    positiveIndicators,
  }

  return NextResponse.json({ success: true, data: analysis })
})
