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

// Import LLM for job analysis
import { analyzeJobInclusivity as llmAnalyze } from './llm'
import { validateJobAnalysis } from './schemas/job-analysis'

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

// Alias for backward compatibility
export const getCompanyById = getCompany

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

// Alias for backward compatibility
export const getJobById = getJobPosting

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

// ─── Inclusivity Analysis ─────────────────────────────────────────────────────

/**
 * Analyze job posting for inclusivity and discriminatory language.
 * Uses LLM (Ollama/Gemma 2B) with fallback to rule-based analysis.
 */
export async function analyzeJobInclusivity(jobData: {
  title?: string
  description?: string
  accommodations?: string[]
  workMode?: string
}): Promise<InclusivityAnalysis> {
  try {
    const rawAnalysis = await llmAnalyze(jobData)
    const validatedAnalysis = validateJobAnalysis(rawAnalysis)

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
    }
  } catch {
    // Fallback to rule-based analysis
    const text = `${jobData.title ?? ''} ${jobData.description ?? ''}`.toLowerCase()

    const discriminatoryTerms = [
      { term: 'young', type: 'age' },
      { term: 'energetic', type: 'age' },
      { term: 'rockstar', type: 'gender' },
      { term: 'ninja', type: 'gender' },
      { term: 'guru', type: 'cultural' },
      { term: 'native speaker', type: 'cultural' },
      { term: 'recent graduate', type: 'age' },
      { term: 'digital native', type: 'age' },
    ]

    const issues: InclusivityAnalysis['issues'] = []

    for (const { term, type } of discriminatoryTerms) {
      if (text.includes(term)) {
        issues.push({
          type,
          text: term,
          severity: 'high',
          suggestion: `Replace "${term}" with more inclusive language`,
        })
      }
    }

    if (!jobData.accommodations || jobData.accommodations.length === 0) {
      issues.push({
        type: 'missing_accommodations',
        severity: 'high',
        suggestion: 'Add workplace accommodations to make job more inclusive',
      })
    }

    // Calculate inclusivity score
    let score = 100
    score -= issues.filter((i) => i.severity === 'high').length * 20
    score -= issues.filter((i) => i.severity === 'medium').length * 10

    if (jobData.accommodations && jobData.accommodations.length >= 3) score += 10
    if (jobData.workMode === 'remote') score += 10

    score = Math.max(0, Math.min(100, score))

    const suggestions: string[] = []
    if (score < 80) suggestions.push('Add more accommodations to improve inclusivity')
    if (!jobData.workMode || jobData.workMode === 'on-site') {
      suggestions.push('Consider offering remote or hybrid work for better accessibility')
    }
    if (!jobData.description || jobData.description.length < 100) {
      suggestions.push('Add detailed job description to help candidates understand requirements')
    }

    return {
      hasDiscriminatoryLanguage: issues.some((i) => i.severity === 'high'),
      issues,
      score,
      suggestions,
      llmPowered: false,
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
/** Alias used by dashboard tests */
export const moveCandidateToStage = updatePipelineStage

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
