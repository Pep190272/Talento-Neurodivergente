/**
 * Company Profile and Job Posting Management
 * UC-003: Company Registration & Job Posting
 *
 * Migrated from companies.js → companies.ts (Prisma 7 / PostgreSQL)
 *
 * Sprint 3: Refactored to use Repository layer.
 * - Data access: app/lib/repositories/company.repository.ts
 *
 * Methodology: TDD, Clean Architecture, GDPR + EU AI Act compliance
 */

import type { Company, Job, User } from '@prisma/client'

// Import LLM Service for job analysis (Sprint 4: llm.js → services/llm.service.ts)
import { analyzeJobInclusivity as llmAnalyze } from './services/llm.service'
import { validateJobAnalysis } from './schemas/job-analysis'
import { detectBias } from './bias-patterns'

// ─── Repository (Data Access) ─────────────────────────────────────────────────

import * as CompanyRepo from './repositories/company.repository'

// ─── Types ────────────────────────────────────────────────────────────────────

type CompanyWithUser = Company & {
  user: User
  jobs: Pick<Job, 'id'>[]
}

interface CompanyProfile {
  companyId: string
  userId: string
  email: string
  userType: string
  status: string
  createdAt: Date
  updatedAt: Date
  name: string
  industry: string | null
  size: string | null
  location: string | null
  website: string | null
  description: string | null
  contact: unknown
  diversityCommitment: string | null
  neurodiversityPrograms: unknown
  subscriptionPlan: string
  stripeCustomerId: string | null
  metadata: Record<string, unknown>
  jobs: string[]
  redirectTo?: string
  [key: string]: unknown
}

interface JobProfile {
  jobId: string
  companyId: string
  status: string
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  title: string
  description: string
  skills: string[]
  accommodations: string[]
  salaryRange: string | null
  workMode: string
  visibility: string
  location: string | null
  benefits: unknown
  teamSize: string | null
  reportingStructure: string | null
  inclusivityScore: number | null
  inclusivityAnalysis: unknown
  matches: { pending: unknown[]; accepted: unknown[] }
  pipeline: Record<string, unknown[]>
  metadata: Record<string, unknown>
  matchingTriggered?: boolean
  [key: string]: unknown
}

interface InclusivityAnalysis {
  score: number
  hasDiscriminatoryLanguage: boolean
  issues: Array<{ type: string; text?: string; severity: string; suggestion?: string }>
  suggestions: string[]
  llmPowered: boolean
  accommodationsCount?: number
  accommodationsQuality?: string
  skillsBreakdown?: SkillsBreakdown
  suggestedAccommodations?: string[]
}

interface SkillsBreakdown {
  technical: string[]
  soft: string[]
  domain: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeCompany(company: CompanyWithUser, extra: Record<string, unknown> = {}): CompanyProfile {
  return {
    companyId: company.id,
    userId: company.userId,
    email: company.user.email,
    userType: 'company',
    status: company.user.status,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,

    name: company.name,
    industry: company.industry,
    size: company.size,
    location: company.location,
    website: company.website,
    description: company.description,
    contact: company.contact,
    diversityCommitment: company.diversityCommitment,
    neurodiversityPrograms: company.neurodiversityPrograms,

    subscriptionPlan: company.subscriptionPlan,
    stripeCustomerId: company.stripeCustomerId,
    metadata: (company.metadata as Record<string, unknown>) ?? {
      lastLogin: null,
      jobsPosted: 0,
      candidatesHired: 0,
      averageTimeToHire: null,
    },

    jobs: company.jobs.map((j) => j.id),

    ...extra,
  }
}

function normalizeJob(job: Job, extra: Record<string, unknown> = {}): JobProfile {
  const statusMap: Record<string, string> = {
    DRAFT: 'draft',
    PUBLISHED: 'active',
    CLOSED: 'closed',
    ARCHIVED: 'archived',
  }

  return {
    jobId: job.id,
    companyId: job.companyId,
    status: statusMap[job.status] ?? job.status.toLowerCase(),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    closedAt: job.closedAt,

    title: job.title,
    description: job.description,
    skills: job.skills,
    accommodations: job.accommodations,
    salaryRange: job.salaryRange,
    workMode: job.workMode,
    visibility: job.visibility,
    location: job.location,
    benefits: job.benefits,
    teamSize: job.teamSize,
    reportingStructure: job.reportingStructure,

    inclusivityScore: job.inclusivityScore,
    inclusivityAnalysis: job.inclusivityAnalysis,

    matches: { pending: [], accepted: [] },
    pipeline: {
      newMatches: [],
      underReview: [],
      interviewing: [],
      offered: [],
      hired: [],
      rejected: [],
    },
    metadata: { views: 0, applicants: 0, averageMatchScore: null },

    ...extra,
  }
}

// ─── Company CRUD ─────────────────────────────────────────────────────────────

/**
 * Create new company profile
 * Atomically creates User + Company via repository
 */
export async function createCompany(data: {
  email?: string
  passwordHash?: string
  name?: string
  industry?: string
  size?: string
  location?: string
  website?: string
  description?: string
  contact?: unknown
  diversityCommitment?: string
  neurodiversityPrograms?: unknown[]
}): Promise<CompanyProfile> {
  if (!data.name) {
    throw new Error('Company name is required')
  }

  if (!data.email) {
    throw new Error('Email is required')
  }

  const email = data.email.toLowerCase().trim()

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format')
  }

  // Check for duplicate email via repository
  const existingUser = await CompanyRepo.findUserByEmail(email)
  if (existingUser) {
    throw new Error('Company email already exists')
  }

  const passwordHash = data.passwordHash ?? '$2b$10$placeholder'

  const company = await CompanyRepo.createUserAndCompany(
    {
      email,
      passwordHash,
      userType: 'company',
      status: 'active',
    },
    {
      name: data.name,
      industry: data.industry ?? null,
      size: data.size ?? null,
      location: data.location ?? null,
      website: data.website ?? null,
      description: data.description ?? '',
      contact: (data.contact ?? null) as never,
      diversityCommitment: data.diversityCommitment ?? null,
      neurodiversityPrograms: (data.neurodiversityPrograms ?? []) as never,
      metadata: {
        lastLogin: new Date().toISOString(),
        jobsPosted: 0,
        candidatesHired: 0,
        averageTimeToHire: null,
      } as never,
    }
  )

  return normalizeCompany(company as CompanyWithUser, {
    redirectTo: '/dashboard/company',
  })
}

/**
 * Get company profile by Company.id via repository
 */
export async function getCompany(companyId: string): Promise<CompanyProfile | null> {
  const company = await CompanyRepo.findCompanyById(companyId)
  if (!company) return null
  return normalizeCompany(company as CompanyWithUser)
}

/**
 * Get company by User.id (userId) via repository
 */
export async function getCompanyByUserId(userId: string): Promise<CompanyProfile | null> {
  const company = await CompanyRepo.findCompanyByUserId(userId)
  if (!company) return null
  return normalizeCompany(company as CompanyWithUser)
}


/**
 * Update company profile via repository
 */
export async function updateCompany(
  companyId: string,
  updates: {
    name?: string
    industry?: string
    size?: string
    location?: string
    website?: string
    description?: string
    contact?: unknown
    diversityCommitment?: string
    neurodiversityPrograms?: unknown[]
  }
): Promise<CompanyProfile> {
  const company = await CompanyRepo.updateCompanyInDb(companyId, {
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.industry !== undefined && { industry: updates.industry }),
    ...(updates.size !== undefined && { size: updates.size }),
    ...(updates.location !== undefined && { location: updates.location }),
    ...(updates.website !== undefined && { website: updates.website }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.contact !== undefined && { contact: updates.contact as never }),
    ...(updates.diversityCommitment !== undefined && {
      diversityCommitment: updates.diversityCommitment,
    }),
    ...(updates.neurodiversityPrograms !== undefined && {
      neurodiversityPrograms: updates.neurodiversityPrograms as never,
    }),
  })

  return normalizeCompany(company as CompanyWithUser)
}

// ─── Job Posting CRUD ─────────────────────────────────────────────────────────

/**
 * Create job posting
 * Analyzes inclusivity before saving (LLM → fallback rule-based)
 */
export async function createJobPosting(
  companyId: string,
  jobData: {
    title?: string
    description?: string
    skills?: string[]
    accommodations?: string[]
    salaryRange?: string
    location?: string
    workMode?: string
    benefits?: unknown[]
    teamSize?: string
    reportingStructure?: string
    visibility?: string
  }
): Promise<JobProfile> {
  if (!jobData.title) {
    throw new Error('title is required')
  }
  if (!jobData.skills) {
    throw new Error('skills is required')
  }

  // Require at least one accommodation
  if (!Array.isArray(jobData.accommodations) || jobData.accommodations.length === 0) {
    throw new Error('At least one accommodation is required')
  }

  // Analyze job inclusivity (LLM → fallback)
  const inclusivityAnalysis = await analyzeJobInclusivity(jobData)

  if (inclusivityAnalysis.hasDiscriminatoryLanguage) {
    throw new Error(
      `Discriminatory language detected: ${inclusivityAnalysis.issues
        .map((i) => i.text ?? i.type)
        .join(', ')}`
    )
  }

  const job = await CompanyRepo.createJobInDb({
    companyId,
    title: jobData.title,
    description: jobData.description ?? '',
    status: 'PUBLISHED',
    skills: jobData.skills ?? [],
    accommodations: jobData.accommodations,
    salaryRange: jobData.salaryRange ?? null,
    workMode: jobData.workMode ?? 'remote',
    visibility: jobData.visibility ?? 'public',
    location: jobData.location ?? null,
    benefits: (jobData.benefits ?? []) as never,
    teamSize: jobData.teamSize ?? null,
    reportingStructure: jobData.reportingStructure ?? null,
    inclusivityScore: inclusivityAnalysis.score,
    inclusivityAnalysis: inclusivityAnalysis as never,
  })

  return normalizeJob(job as Job, { matchingTriggered: true })
}

/**
 * Get job posting by Job.id via repository
 */
export async function getJobPosting(jobId: string): Promise<JobProfile | null> {
  const job = await CompanyRepo.findJobById(jobId)
  if (!job) return null
  return normalizeJob(job as Job)
}


/**
 * Update job posting via repository
 */
export async function updateJobPosting(
  jobId: string,
  updates: {
    title?: string
    description?: string
    skills?: string[]
    accommodations?: string[]
    salaryRange?: string
    location?: string
    workMode?: string
    visibility?: string
  }
): Promise<JobProfile> {
  const job = await CompanyRepo.updateJobInDb(jobId, {
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.skills !== undefined && { skills: updates.skills }),
    ...(updates.accommodations !== undefined && { accommodations: updates.accommodations }),
    ...(updates.salaryRange !== undefined && { salaryRange: updates.salaryRange }),
    ...(updates.location !== undefined && { location: updates.location }),
    ...(updates.workMode !== undefined && { workMode: updates.workMode }),
    ...(updates.visibility !== undefined && { visibility: updates.visibility }),
  })

  return normalizeJob(job as Job)
}

/**
 * Close a job posting via repository
 */
export async function closeJob(jobId: string): Promise<JobProfile> {
  const job = await CompanyRepo.updateJobInDb(jobId, {
    status: 'CLOSED',
    closedAt: new Date(),
  })

  return normalizeJob(job as Job)
}

/**
 * Get all jobs for a company via repository
 */
export async function getCompanyJobs(companyId: string): Promise<JobProfile[]> {
  const jobs = await CompanyRepo.findJobsByCompanyId(companyId)
  return jobs.map((j) => normalizeJob(j as Job))
}

/**
 * Get all published/open job postings via repository
 */
export async function getAllOpenJobs(): Promise<JobProfile[]> {
  const jobs = await CompanyRepo.findPublishedJobs()
  return jobs.map((j) => normalizeJob(j as Job))
}

// ─── Skills Categorization ────────────────────────────────────────────────────

const TECHNICAL_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
  'git', 'linux', 'api', 'rest', 'graphql', 'microservices',
  'html', 'css', 'sass', 'tailwind', 'figma', 'sketch',
  'machine learning', 'data science', 'data analysis', 'statistics',
  'cybersecurity', 'networking', 'devops', 'sre',
])

const SOFT_SKILLS = new Set([
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'creativity', 'adaptability', 'time management', 'organization', 'collaboration',
  'presentation', 'negotiation', 'conflict resolution', 'emotional intelligence',
  'attention to detail', 'multitasking', 'decision making', 'mentoring',
])

export function categorizeSkills(skills: string[]): SkillsBreakdown {
  const technical: string[] = []
  const soft: string[] = []
  const domain: string[] = []

  for (const skill of skills) {
    const lower = skill.toLowerCase().trim()
    if (TECHNICAL_SKILLS.has(lower)) {
      technical.push(skill)
    } else if (SOFT_SKILLS.has(lower)) {
      soft.push(skill)
    } else {
      domain.push(skill)
    }
  }

  return { technical, soft, domain }
}

// ─── Suggested Accommodations ────────────────────────────────────────────────

const ROLE_ACCOMMODATIONS: Record<string, string[]> = {
  'engineer': ['Pair programming support', 'Async code reviews', 'Quiet workspace', 'Noise-cancelling headphones provided'],
  'developer': ['Pair programming support', 'Async code reviews', 'Quiet workspace', 'Noise-cancelling headphones provided'],
  'designer': ['Visual task boards', 'Flexible deadlines for creative work', 'Quiet workspace'],
  'analyst': ['Written documentation for all meetings', 'Extended time for data review', 'Structured task breakdowns'],
  'manager': ['Async meeting options', 'Written agendas in advance', 'Flexible scheduling'],
  'support': ['Script templates for common interactions', 'Breaks between calls', 'Written escalation procedures'],
}

const UNIVERSAL_ACCOMMODATIONS = [
  'Remote work', 'Flexible hours', 'Async communication', 'Written documentation',
  'Sensory-friendly workspace', 'Clear task prioritization', 'Regular 1:1 check-ins',
]

export function suggestAccommodations(title: string, existingAccommodations: string[]): string[] {
  const lower = title.toLowerCase()
  const existing = new Set(existingAccommodations.map(a => a.toLowerCase()))
  const suggestions: string[] = []

  // Role-specific suggestions
  for (const [role, accommodations] of Object.entries(ROLE_ACCOMMODATIONS)) {
    if (lower.includes(role)) {
      for (const acc of accommodations) {
        if (!existing.has(acc.toLowerCase())) {
          suggestions.push(acc)
        }
      }
    }
  }

  // Universal suggestions not already present
  for (const acc of UNIVERSAL_ACCOMMODATIONS) {
    if (!existing.has(acc.toLowerCase()) && !suggestions.includes(acc)) {
      suggestions.push(acc)
    }
  }

  return suggestions.slice(0, 5)
}

// ─── Inclusivity Analysis ─────────────────────────────────────────────────────

/**
 * Analyze job posting for inclusivity and discriminatory language.
 * Uses LLM (Ollama/Gemma 2B) with fallback to rule-based analysis.
 */
export async function analyzeJobInclusivity(jobData: {
  title?: string
  description?: string
  skills?: string[]
  accommodations?: string[]
  workMode?: string
}): Promise<InclusivityAnalysis> {
  try {
    const rawAnalysis = await llmAnalyze(jobData)
    const validatedAnalysis = validateJobAnalysis(rawAnalysis)

    const skills = jobData.skills ?? []

    return {
      score: validatedAnalysis.score,
      hasDiscriminatoryLanguage: validatedAnalysis.discriminatoryLanguage,
      issues: validatedAnalysis.issues.map(
        (issue: { type: string; term: string; severity: string }) => ({
          type: issue.type,
          text: issue.term,
          severity: issue.severity,
          suggestion: `Address ${issue.type} bias: "${issue.term}"`,
        })
      ),
      suggestions: [validatedAnalysis.suggestions],
      accommodationsCount: validatedAnalysis.accommodations?.count,
      accommodationsQuality: validatedAnalysis.accommodations?.quality,
      llmPowered: !validatedAnalysis.fallback,
      skillsBreakdown: categorizeSkills(skills),
      suggestedAccommodations: suggestAccommodations(
        jobData.title ?? '',
        jobData.accommodations ?? []
      ),
    }
  } catch {
    // Fallback to rule-based analysis using shared bias patterns (25+ patterns)
    const titleText = jobData.title ?? ''
    const descText = jobData.description ?? ''

    const biasIssues = [
      ...detectBias(titleText, 'title'),
      ...detectBias(descText, 'description'),
    ]

    const issues: InclusivityAnalysis['issues'] = biasIssues.map(bi => ({
      type: bi.type,
      text: bi.term,
      severity: bi.severity,
      suggestion: bi.suggestion,
    }))

    if (!jobData.accommodations || jobData.accommodations.length === 0) {
      issues.push({
        type: 'missing_accommodations',
        severity: 'high',
        suggestion: 'Add workplace accommodations to make job more inclusive',
      })
    }

    // Calculate inclusivity score — aligned with LLM prompt methodology
    // Base: 50, +10 per accommodation (cap 6), +5 premium accommodations, -20 discriminatory
    const accommodationCount = jobData.accommodations?.length ?? 0
    const premiumAccommodations = ['remote', 'flexible hours', 'async communication', 'written documentation', 'sensory-friendly']
    const premiumCount = jobData.accommodations?.filter((a) =>
      premiumAccommodations.some((p) => a.toLowerCase().includes(p))
    ).length ?? 0

    let score = 50
    score += Math.min(accommodationCount, 6) * 10
    score += premiumCount * 5
    if (jobData.workMode === 'remote') score += 5
    score -= issues.filter((i) => i.severity === 'high').length * 20
    score -= issues.filter((i) => i.severity === 'medium').length * 10

    score = Math.max(0, Math.min(100, score))

    const suggestions: string[] = []
    if (score < 80) suggestions.push('Add more accommodations to improve inclusivity')
    if (!jobData.workMode || jobData.workMode === 'on-site') {
      suggestions.push('Consider offering remote or hybrid work for better accessibility')
    }
    if (!jobData.description || jobData.description.length < 100) {
      suggestions.push('Add detailed job description to help candidates understand requirements')
    }

    // Skills breakdown & suggested accommodations
    const skills = jobData.skills ?? []
    const skillsBreakdown = categorizeSkills(skills)
    const suggestedAccommodationsList = suggestAccommodations(
      jobData.title ?? '',
      jobData.accommodations ?? []
    )

    // Warn if skills are overly generic (>80% soft skills)
    if (skills.length > 0 && skillsBreakdown.soft.length / skills.length > 0.8) {
      suggestions.push('Skills are too generic for effective matching — add specific technical or domain skills')
    }

    return {
      hasDiscriminatoryLanguage: issues.some((i) => i.severity === 'high'),
      issues,
      score,
      suggestions,
      llmPowered: false,
      skillsBreakdown,
      suggestedAccommodations: suggestedAccommodationsList,
    }
  }
}

// ─── Pipeline & Connections ───────────────────────────────────────────────────

/**
 * Get matches for a specific job (filtered by privacy — excludes rejected)
 * Uses repository for data access
 */
export async function getMatchesForCompany(
  _companyId: string,
  jobId: string
): Promise<unknown[]> {
  return CompanyRepo.findMatchingsByJobIdExcludingRejected(jobId)
}

/**
 * Get company pipeline for a specific job
 */
export async function getCompanyPipeline(
  companyId: string,
  jobId: string
): Promise<Record<string, unknown[]>> {
  const job = await CompanyRepo.findJobCompanyId(jobId)

  if (!job || job.companyId !== companyId) {
    throw new Error('Job not found or unauthorized')
  }

  // Pipeline is computed from Matching statuses
  return {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: [],
  }
}

/**
 * Update pipeline stage for a candidate
 */
export async function updatePipelineStage(
  connectionId: string,
  newStage: string
): Promise<{ connectionId: string; stage: string; updatedAt: Date }> {
  const validStages = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected']

  if (!validStages.includes(newStage)) {
    throw new Error(`Invalid pipeline stage: ${newStage}`)
  }

  return {
    connectionId,
    stage: newStage,
    updatedAt: new Date(),
  }
}

/**
 * Get candidate data for company view (respects privacy + consent)
 * Uses repository for connection lookup
 */
export async function getCandidateDataForCompany(
  companyId: string,
  candidateId: string
): Promise<unknown> {
  // Verify active connection exists via repository
  const connection = await CompanyRepo.findActiveConnection(companyId, candidateId)

  if (!connection) {
    throw new Error('No active connection exists')
  }

  const { getProfileForCompany } = await import('./individuals')
  return await getProfileForCompany(candidateId, connection.id)
}
