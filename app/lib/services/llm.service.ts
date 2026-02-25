/**
 * LLM Service — Business Logic Layer
 *
 * Wraps Ollama (llama3.2:3b self-hosted, diversia-ollama container) with:
 *   - 3 professional prompts: inclusivity analysis, candidate evaluation, matching explanation
 *   - In-memory TTL cache to avoid redundant inference calls
 *   - Rate limiting per identifier (10 req/min — inference is expensive)
 *
 * Sprint 4: Migrated from app/lib/llm.js (gemma:2b) to TypeScript service (llama3.2:3b)
 *
 * Architecture:
 *   API Route → companies.ts / matching.ts → LlmService → Ollama (:11434)
 *
 * Model: llama3.2:3b (self-hosted, GDPR compliant, zero API cost)
 * Decision: Keep Ollama self-hosted — data control + colocation with diversia-db
 */

import { rateLimit } from '../rate-limiter.js'

// ─── Configuration ────────────────────────────────────────────────────────────

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'
const REQUEST_TIMEOUT = 30_000       // 30s — llama3.2:3b is slower than gemma:2b
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute window
const RATE_LIMIT_MAX = 10            // 10 LLM calls/min per identifier

// ─── TTL Cache ────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const _cache = new Map<string, CacheEntry<unknown>>()

const TTL_MS = {
  inclusivity: 60 * 60 * 1000,       // 1 h  — job postings rarely change
  candidateEval: 30 * 60 * 1000,     // 30 min
  matchExplanation: 15 * 60 * 1000,  // 15 min
}

function cacheGet<T>(key: string): T | null {
  const entry = _cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null }
  return entry.value
}

function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  _cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

function cacheKey(prefix: string, data: unknown): string {
  return `${prefix}:${JSON.stringify(data)}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobData {
  title: string
  description?: string
  requiredSkills?: string[]
  accommodations?: string[]
}

export interface InclusivityAnalysis {
  score: number
  discriminatoryLanguage: boolean
  issues: Array<{
    type: 'age' | 'ableism' | 'gender' | 'cultural'
    term: string
    severity: 'low' | 'medium' | 'high'
  }>
  accommodations: {
    count: number
    quality: 'poor' | 'good' | 'excellent'
  }
  suggestions: string
  fallback?: boolean
}

export interface CandidateProfile {
  skills: string[]
  accommodationsNeeded?: string[]
  bio?: string
  experience?: Array<{ title: string; company: string }>
  assessmentScore?: number
}

export interface CandidateEvaluation {
  overallFit: number
  strengthsForRole: string[]
  potentialChallenges: string[]
  accommodationAlignment: string
  recommendation: 'strong_match' | 'good_match' | 'moderate_match' | 'weak_match'
  narrative: string
  fallback?: boolean
}

export interface ScoreBreakdown {
  skills: number
  accommodations: number
  preferences: number
  location: number
}

export interface MatchingExplanation {
  summary: string
  keyReasons: string[]
  accommodationsNote: string
  transparencyDisclaimer: string
  fallback?: boolean
}

// ─── Core: Ollama Generate ────────────────────────────────────────────────────

export async function generateCompletion(
  prompt: string,
  options: { temperature?: number; numPredict?: number } = {}
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: options.temperature ?? 0.1,  // low = deterministic, professional
          top_p: 0.9,
          num_predict: options.numPredict ?? 512,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.response as string

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(`LLM timeout after ${REQUEST_TIMEOUT / 1000}s`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function parseJSON<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    // llama sometimes wraps output in markdown fences
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) return JSON.parse(match[1]) as T
    throw new Error('LLM did not return valid JSON')
  }
}

// ─── Rate Limit Helper ────────────────────────────────────────────────────────

function assertRateLimit(identifier: string): void {
  const result = rateLimit(identifier, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  })
  if (!result.allowed) {
    throw new Error(`LLM rate limit exceeded — retry after ${result.retryAfter}s`)
  }
}

// ─── Prompt 1: Job Inclusivity Analysis ──────────────────────────────────────

function buildInclusivityPrompt(job: JobData): string {
  return `You are a senior DEI (Diversity, Equity & Inclusion) specialist with deep expertise in neurodiversity-inclusive employment practices (ADHD, Autism Spectrum, Dyslexia, Dyspraxia, Dyscalculia, Tourette Syndrome, and related conditions).

Analyze the following job posting for its friendliness toward neurodivergent candidates. Return ONLY a valid JSON object — no preamble, no markdown, no extra text.

SCORING METHODOLOGY:
- Base score: 50 points
- +10 per accommodation listed (cap at +60 for 6 or more)
- +5 bonus for high-value accommodations: remote work, flexible hours, asynchronous communication, written documentation, sensory-friendly workspace
- -20 if discriminatory language is detected
- Final score capped at 100

DISCRIMINATORY LANGUAGE TO DETECT:
- Age discrimination: "young talent", "energetic", "digital native", "recent graduate only", "under X years old"
- Ableism: "perfect communication skills", "flawless execution", "no limitations", "fully neurotypical environment", "100% focus required"
- Gender bias: "rockstar developer", "coding ninja", "marketing guru"
- Cultural bias: "native English speaker only", "cultural fit" (undefined), "born leader"

REQUIRED JSON SCHEMA:
{
  "score": <integer 0-100>,
  "discriminatoryLanguage": <boolean>,
  "issues": [
    { "type": "age|ableism|gender|cultural", "term": "<exact term found>", "severity": "low|medium|high" }
  ],
  "accommodations": { "count": <integer>, "quality": "poor|good|excellent" },
  "suggestions": "<2-3 specific, actionable improvements written in the same language as the job posting>"
}

JOB POSTING DATA:
Title: ${job.title}
Description: ${job.description ?? 'Not provided'}
Required Skills: ${job.requiredSkills?.join(', ') ?? 'Not specified'}
Accommodations Offered: ${job.accommodations?.join(', ') ?? 'None listed'}

Return ONLY the JSON object.`.trim()
}

// ─── Prompt 2: Candidate Evaluation ──────────────────────────────────────────

function buildCandidateEvalPrompt(candidate: CandidateProfile, job: JobData): string {
  const expStr = candidate.experience?.length
    ? candidate.experience.map(e => `${e.title} at ${e.company}`).join('; ')
    : 'Not provided'

  return `You are a specialist talent acquisition consultant with 15+ years of experience in neurodiversity-inclusive hiring. Your methodology celebrates cognitive diversity as a competitive advantage, not a limitation.

Evaluate the following candidate against the job requirements. Focus on transferable strengths, accommodation fit, and growth potential — not diagnostic labels. Return ONLY a valid JSON object.

EVALUATION PRINCIPLES:
1. Cognitive strengths associated with neurodivergence (hyperfocus, pattern recognition, attention to detail, systems thinking) are assets — frame them positively
2. Accommodation alignment is weighted equally with technical skill match
3. Flag when specific accommodations would unlock the candidate's full potential
4. Use strengths-based, professional language throughout

REQUIRED JSON SCHEMA:
{
  "overallFit": <integer 0-100>,
  "strengthsForRole": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3 max>"],
  "potentialChallenges": ["<challenge with concrete mitigation suggestion>"],
  "accommodationAlignment": "<assessment of how well job accommodations meet the candidate's stated needs>",
  "recommendation": "strong_match|good_match|moderate_match|weak_match",
  "narrative": "<3-4 sentence professional summary for the hiring team. Neurodiversity-positive, specific, actionable.>"
}

CANDIDATE PROFILE:
Skills: ${candidate.skills.join(', ')}
Accommodations Needed: ${candidate.accommodationsNeeded?.join(', ') ?? 'None specified'}
${candidate.bio ? `Professional Bio: ${candidate.bio}` : ''}
Experience: ${expStr}
${candidate.assessmentScore !== undefined ? `Cognitive Assessment Score: ${candidate.assessmentScore}/100` : ''}

TARGET ROLE:
Title: ${job.title}
Required Skills: ${job.requiredSkills?.join(', ') ?? 'Not specified'}
Accommodations Offered: ${job.accommodations?.join(', ') ?? 'None'}
${job.description ? `Role Description: ${job.description.slice(0, 400)}` : ''}

Return ONLY the JSON object.`.trim()
}

// ─── Prompt 3: Match Explanation (EU AI Act Art. 13) ─────────────────────────

function buildMatchExplanationPrompt(
  candidate: { skills: string[]; accommodationsNeeded?: string[] },
  job: JobData,
  score: number,
  breakdown: ScoreBreakdown
): string {
  return `You are an AI transparency officer responsible for communicating algorithmic decisions to candidates, as required by EU AI Act Article 13 (Transparency obligations for providers of AI systems).

Write a clear, encouraging, and honest explanation for a candidate about why they were matched to this job. Use second-person ("you"), strengths-based language, and be specific. Return ONLY a valid JSON object.

TRANSPARENCY REQUIREMENTS (EU AI Act Art. 13):
- Disclose that AI was used in the matching decision
- Explain which factors were considered and their relative weight
- State that a human reviewer approves all matches before candidates are contacted
- Inform the candidate of their right to contest (EU AI Act Art. 22 / GDPR Art. 22)

REQUIRED JSON SCHEMA:
{
  "summary": "<1-2 sentences directly to the candidate explaining why this match is promising>",
  "keyReasons": ["<specific reason 1>", "<specific reason 2>", "<specific reason 3 max>"],
  "accommodationsNote": "<specific note: how the job's accommodations address the candidate's needs, or what to clarify before accepting>",
  "transparencyDisclaimer": "<EU AI Act Art. 13 compliant disclosure: factors used, human oversight, right to contest>"
}

MATCH DATA:
Overall Score: ${score}/100
Score Breakdown:
  - Skills alignment: ${breakdown.skills}% (weight: 40%)
  - Accommodations fit: ${breakdown.accommodations}% (weight: 30%)
  - Work preferences: ${breakdown.preferences}% (weight: 20%)
  - Location compatibility: ${breakdown.location}% (weight: 10%)

Candidate Skills: ${candidate.skills.join(', ')}
Candidate Accommodations Needed: ${candidate.accommodationsNeeded?.join(', ') ?? 'None specified'}

Job Title: ${job.title}
Job Accommodations Offered: ${job.accommodations?.join(', ') ?? 'None listed'}
Job Skills Required: ${job.requiredSkills?.join(', ') ?? 'Not specified'}

Return ONLY the JSON object.`.trim()
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze a job posting for neurodiversity inclusivity.
 * Cached 1 hour — job postings rarely change.
 * EU AI Act Art. 13: transparent scoring criteria.
 */
export async function analyzeJobInclusivity(
  jobData: JobData,
  identifier = 'system'
): Promise<InclusivityAnalysis> {
  assertRateLimit(`llm:inclusivity:${identifier}`)

  const key = cacheKey('inclusivity', {
    title: jobData.title,
    desc: jobData.description?.slice(0, 200),
    accommodations: jobData.accommodations?.sort(),
  })
  const cached = cacheGet<InclusivityAnalysis>(key)
  if (cached) return cached

  try {
    const raw = await generateCompletion(buildInclusivityPrompt(jobData))
    const analysis = parseJSON<InclusivityAnalysis>(raw)

    if (typeof analysis.score !== 'number') throw new Error('Missing score field')

    cacheSet(key, analysis, TTL_MS.inclusivity)
    return analysis

  } catch (error) {
    console.warn('[LlmService] analyzeJobInclusivity fallback:', (error as Error).message)

    const count = jobData.accommodations?.length ?? 0
    const fallback: InclusivityAnalysis = {
      score: Math.min(50 + count * 10, 100),
      discriminatoryLanguage: false,
      issues: [],
      accommodations: { count, quality: count >= 3 ? 'good' : 'poor' },
      suggestions: 'LLM analysis unavailable. Score based on accommodation count only.',
      fallback: true,
    }
    return fallback
  }
}

/**
 * Evaluate a candidate against a specific job.
 * Returns strengths, challenges, accommodation alignment, and recommendation.
 * Cached 30 minutes.
 */
export async function evaluateCandidate(
  candidate: CandidateProfile,
  job: JobData,
  identifier = 'system'
): Promise<CandidateEvaluation> {
  assertRateLimit(`llm:candidate:${identifier}`)

  const key = cacheKey('candidate-eval', {
    skills: [...candidate.skills].sort(),
    jobTitle: job.title,
    accommodations: job.accommodations?.sort(),
  })
  const cached = cacheGet<CandidateEvaluation>(key)
  if (cached) return cached

  try {
    const raw = await generateCompletion(buildCandidateEvalPrompt(candidate, job))
    const evaluation = parseJSON<CandidateEvaluation>(raw)

    if (typeof evaluation.overallFit !== 'number') throw new Error('Missing overallFit field')

    cacheSet(key, evaluation, TTL_MS.candidateEval)
    return evaluation

  } catch (error) {
    console.warn('[LlmService] evaluateCandidate fallback:', (error as Error).message)

    const matched = candidate.skills.filter(s =>
      job.requiredSkills?.some(r => r.toLowerCase().includes(s.toLowerCase()))
    )
    const fit = job.requiredSkills?.length
      ? Math.round((matched.length / job.requiredSkills.length) * 100)
      : 50

    const fallback: CandidateEvaluation = {
      overallFit: fit,
      strengthsForRole: matched.length > 0 ? matched.slice(0, 3) : ['Skills pending assessment'],
      potentialChallenges: ['Detailed AI evaluation unavailable — manual review recommended'],
      accommodationAlignment: 'Accommodation fit requires manual assessment',
      recommendation: fit >= 70 ? 'good_match' : fit >= 50 ? 'moderate_match' : 'weak_match',
      narrative: 'AI evaluation unavailable. Profile meets basic criteria and requires human review.',
      fallback: true,
    }
    return fallback
  }
}

/**
 * Generate a human-readable explanation for a match — shown to the candidate.
 * EU AI Act Art. 13: transparency about AI-assisted decisions.
 * Cached 15 minutes.
 */
export async function explainMatch(
  candidate: { skills: string[]; accommodationsNeeded?: string[] },
  job: JobData,
  score: number,
  breakdown: ScoreBreakdown,
  identifier = 'system'
): Promise<MatchingExplanation> {
  assertRateLimit(`llm:explain:${identifier}`)

  const key = cacheKey('match-explain', {
    skills: [...candidate.skills].sort(),
    jobTitle: job.title,
    score,
  })
  const cached = cacheGet<MatchingExplanation>(key)
  if (cached) return cached

  try {
    const raw = await generateCompletion(
      buildMatchExplanationPrompt(candidate, job, score, breakdown)
    )
    const explanation = parseJSON<MatchingExplanation>(raw)

    if (!explanation.summary) throw new Error('Missing summary field')

    cacheSet(key, explanation, TTL_MS.matchExplanation)
    return explanation

  } catch (error) {
    console.warn('[LlmService] explainMatch fallback:', (error as Error).message)

    const fallback: MatchingExplanation = {
      summary: `Your profile has a ${score}% compatibility with "${job.title}" based on skills, accommodations, and work preferences.`,
      keyReasons: [
        `Skills alignment: ${breakdown.skills}%`,
        `Accommodations fit: ${breakdown.accommodations}%`,
        `Work preferences: ${breakdown.preferences}%`,
      ],
      accommodationsNote: 'Please review the listed accommodations to confirm they meet your needs before accepting.',
      transparencyDisclaimer:
        'This match was generated by DiversIA-Matching (algorithm v1) using skills, accommodations, work preferences, and location data. All matches are reviewed by a human before you are contacted. You have the right to contest this decision (EU AI Act Art. 22 / GDPR Art. 22).',
      fallback: true,
    }
    return fallback
  }
}

/**
 * Health check for the Ollama container.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Purge expired cache entries.
 * Returns the number of entries purged.
 */
export function purgeExpiredCache(): number {
  const now = Date.now()
  let purged = 0
  for (const [key, entry] of _cache.entries()) {
    if (now > entry.expiresAt) { _cache.delete(key); purged++ }
  }
  return purged
}
