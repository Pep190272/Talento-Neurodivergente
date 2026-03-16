/**
 * Shared Bias Detection Patterns
 *
 * Used by both:
 *   - app/api/bias-detection/route.ts (API endpoint)
 *   - app/lib/companies.ts (job creation fallback analysis)
 *
 * Comprehensive rule-based detection for discriminatory language
 * toward neurodivergent candidates.
 */

export interface BiasPattern {
  pattern: RegExp
  type: 'ableism' | 'age' | 'gender' | 'cultural' | 'neurodiversity'
  term: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

export const BIAS_PATTERNS: BiasPattern[] = [
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

/**
 * Analyze text for bias patterns.
 * Returns matching issues with field location.
 */
export interface BiasIssue {
  type: string
  term: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
  location?: string
}

export function detectBias(text: string, fieldName?: string): BiasIssue[] {
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

/**
 * Detect positive inclusivity indicators in text.
 */
export function detectPositiveIndicators(text: string): string[] {
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
