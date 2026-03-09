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

// ─── Discriminatory patterns (rule-based fallback) ───────────────────────────

interface BiasPattern {
  pattern: RegExp
  type: 'ableism' | 'age' | 'gender' | 'cultural' | 'neurodiversity'
  term: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

const BIAS_PATTERNS: BiasPattern[] = [
  // Ableism
  { pattern: /\bperfect communication skills\b/i, type: 'ableism', term: 'perfect communication skills', severity: 'high', suggestion: 'Use "effective communication" instead — perfection is an unrealistic standard that excludes neurodivergent candidates' },
  { pattern: /\bflawless\s+(execution|performance|delivery)\b/i, type: 'ableism', term: 'flawless execution', severity: 'high', suggestion: 'Replace with "reliable delivery" — flawless implies zero tolerance for different working styles' },
  { pattern: /\bno\s+limitations?\b/i, type: 'ableism', term: 'no limitations', severity: 'high', suggestion: 'Remove this phrase entirely — everyone has different capabilities and strengths' },
  { pattern: /\bmust\s+be\s+able\s+to\s+multitask\b/i, type: 'ableism', term: 'must be able to multitask', severity: 'medium', suggestion: 'Replace with "ability to manage multiple priorities with organizational support"' },
  { pattern: /\b100%\s+focus\b/i, type: 'ableism', term: '100% focus', severity: 'medium', suggestion: 'Replace with "strong attention to detail" — sustained focus levels vary naturally' },
  { pattern: /\bfast-paced\s+environment\b/i, type: 'ableism', term: 'fast-paced environment', severity: 'low', suggestion: 'Specify what this actually means — the term can discourage candidates who need processing time' },
  { pattern: /\bself[-\s]starter\b/i, type: 'ableism', term: 'self-starter', severity: 'low', suggestion: 'Clarify the level of independence expected — many neurodivergent employees thrive with clear initial guidance' },
  { pattern: /\bexcellent\s+time\s+management\b/i, type: 'ableism', term: 'excellent time management', severity: 'low', suggestion: 'Consider "ability to meet deadlines with appropriate tools and support"' },
  { pattern: /\bstress[-\s]?tolerant\b/i, type: 'ableism', term: 'stress-tolerant', severity: 'medium', suggestion: 'Replace with "ability to work through challenges with team support"' },
  { pattern: /\bhighly\s+organized\b/i, type: 'ableism', term: 'highly organized', severity: 'low', suggestion: 'Specify organizational requirements — different people organize differently but effectively' },

  // Neurodiversity-specific
  { pattern: /\bneurotypical\b/i, type: 'neurodiversity', term: 'neurotypical', severity: 'high', suggestion: 'Remove this requirement — it directly excludes neurodivergent candidates' },
  { pattern: /\bnormal\s+(cognitive|mental|thinking)\b/i, type: 'neurodiversity', term: 'normal cognitive', severity: 'high', suggestion: 'Remove — there is no "normal" cognition; cognitive diversity is a strength' },
  { pattern: /\bno\s+(mental|cognitive|psychological)\s+(health\s+)?(issues?|problems?|conditions?)\b/i, type: 'neurodiversity', term: 'no mental health conditions', severity: 'high', suggestion: 'Remove immediately — this is discriminatory and illegal in most jurisdictions' },

  // Age
  { pattern: /\byoung\s+(talent|professional|team)\b/i, type: 'age', term: 'young talent', severity: 'medium', suggestion: 'Use "talented" or "skilled" — age is not relevant to competence' },
  { pattern: /\bdigital\s+native\b/i, type: 'age', term: 'digital native', severity: 'medium', suggestion: 'Specify the actual technical skills required instead' },
  { pattern: /\brecent\s+graduate\s+only\b/i, type: 'age', term: 'recent graduate only', severity: 'high', suggestion: 'Remove "only" — experience level is more relevant than graduation date' },
  { pattern: /\benergetic\b/i, type: 'age', term: 'energetic', severity: 'low', suggestion: 'Replace with "motivated" or "enthusiastic about the role"' },

  // Gender
  { pattern: /\brockstar\s+(developer|programmer|engineer)\b/i, type: 'gender', term: 'rockstar developer', severity: 'medium', suggestion: 'Use "experienced developer" — gendered language discourages diverse applicants' },
  { pattern: /\bninja\b/i, type: 'gender', term: 'ninja', severity: 'low', suggestion: 'Use professional titles — informal terms can feel exclusionary' },
  { pattern: /\bguru\b/i, type: 'gender', term: 'guru', severity: 'low', suggestion: 'Use "expert" or "specialist" instead' },
  { pattern: /\bhacker\b/i, type: 'gender', term: 'hacker', severity: 'low', suggestion: 'Use "developer" or "engineer" — "hacker" can feel exclusionary' },

  // Cultural
  { pattern: /\bnative\s+(english|spanish)\s+speaker\s+only\b/i, type: 'cultural', term: 'native speaker only', severity: 'high', suggestion: 'Use "proficient in [language]" — native speaker excludes competent non-native speakers' },
  { pattern: /\bcultural\s+fit\b/i, type: 'cultural', term: 'cultural fit', severity: 'medium', suggestion: 'Replace with "values alignment" — "cultural fit" often masks bias against diverse candidates' },
]

// ─── Analysis Function ───────────────────────────────────────────────────────

interface BiasIssue {
  type: string
  term: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
  location?: string
}

interface BiasAnalysis {
  discriminatoryLanguage: boolean
  issues: BiasIssue[]
  score: number
  summary: string
  positiveIndicators: string[]
}

function analyzeText(text: string, fieldName: string): BiasIssue[] {
  const issues: BiasIssue[] = []
  for (const bp of BIAS_PATTERNS) {
    if (bp.pattern.test(text)) {
      issues.push({
        type: bp.type,
        term: bp.term,
        severity: bp.severity,
        suggestion: bp.suggestion,
        location: fieldName,
      })
    }
  }
  return issues
}

function detectPositiveIndicators(text: string): string[] {
  const indicators: string[] = []
  const positivePatterns = [
    { pattern: /\baccommodation/i, label: 'Mentions accommodations' },
    { pattern: /\bneurodiver/i, label: 'Neurodiversity-aware language' },
    { pattern: /\bflexible\s+(hours?|schedule|working)/i, label: 'Flexible working mentioned' },
    { pattern: /\bremote\b/i, label: 'Remote work available' },
    { pattern: /\basync(hronous)?\b/i, label: 'Asynchronous communication' },
    { pattern: /\bdiversity|inclusive|inclusion\b/i, label: 'Diversity & inclusion language' },
    { pattern: /\baccessib/i, label: 'Accessibility awareness' },
    { pattern: /\bmentor/i, label: 'Mentoring offered' },
    { pattern: /\bstrengths?[-\s]based\b/i, label: 'Strengths-based approach' },
  ]

  for (const pp of positivePatterns) {
    if (pp.pattern.test(text)) {
      indicators.push(pp.label)
    }
  }
  return indicators
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

  if (title) issues.push(...analyzeText(title, 'title'))
  if (description) issues.push(...analyzeText(description, 'description'))
  if (requirements) issues.push(...analyzeText(requirements, 'requirements'))

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
