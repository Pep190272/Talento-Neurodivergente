/**
 * Profiles Service — Business Logic Layer
 * Contains profile normalization, validation, and completion logic.
 *
 * Sprint 3: Extracted from app/lib/individuals.ts and app/lib/companies.ts
 * Pure functions — no Prisma calls, fully testable in isolation.
 */

import {
  sanitizeInput,
  generateAnonymizedName,
} from '../utils.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrivacySettings {
  visibleInSearch: boolean
  showRealName: boolean
  shareDiagnosis: boolean
  shareTherapistContact: boolean
  shareAssessmentDetails: boolean
}

export interface AssessmentData {
  completed: boolean
  completedAt: Date | null
  strengths: string[]
  challenges: string[]
  score: number | null
  technicalSkills: string[]
  softSkills: string[]
  workStyle: Record<string, unknown>
}

export interface ExperienceItem {
  title: string
  company?: string
  startYear?: number
  endYear?: number
  current?: boolean
  description?: string
  years?: number
}

export interface EducationItem {
  degree: string
  institution: string
  year?: number
  field?: string
}

export interface MetadataData {
  lastLogin: string | null
  profileViews: number
  matchesReceived: number
  applicationsSubmitted: number
}

export interface IndividualProfile {
  userId: string
  individualId: string
  email: string
  userType: 'individual'
  status: string
  createdAt: Date
  updatedAt: Date
  lastActive: Date | null
  passwordHash?: string
  profile: {
    name: string
    location: string | null
    bio: string
    diagnoses: string[]
    skills: string[]
    experience: ExperienceItem[]
    education: EducationItem[]
    accommodationsNeeded: string[]
    preferences: Record<string, unknown>
    therapistId: string | null
    medicalHistory: string | null
  }
  privacy: PrivacySettings
  assessment: AssessmentData
  metadata: MetadataData
  validationStatus: string | null
  matches: { pending: string[]; accepted: string[]; rejected: string[] }
  connections: unknown[]
  warnings?: Array<{ type: string; message: string }>
  redirectTo?: string
  triggerWelcomeMessage?: boolean
  welcomeMessageContext?: { userId: string; name: string }
  matchingTriggered?: boolean
  isDraft?: boolean
  savedToLocalStorage?: boolean
  aiSuggestions?: unknown[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_PRIVACY: PrivacySettings = {
  visibleInSearch: true,
  showRealName: false,
  shareDiagnosis: false,
  shareTherapistContact: false,
  shareAssessmentDetails: true,
}

export const DEFAULT_ASSESSMENT: AssessmentData = {
  completed: false,
  completedAt: null,
  strengths: [],
  challenges: [],
  score: null,
  technicalSkills: [],
  softSkills: [],
  workStyle: {},
}

// ─── Name Handling ────────────────────────────────────────────────────────────

/**
 * Split a full name into firstName and lastName.
 */
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

// ─── Profile Normalization ────────────────────────────────────────────────────

/**
 * Normalize a Prisma Individual+User record into the IndividualProfile shape.
 * This is the canonical transformation from DB row to API response.
 */
export function normalizeIndividual(
  individual: Record<string, unknown> & { user: Record<string, unknown> },
  extra: Partial<IndividualProfile> = {}
): IndividualProfile {
  const name = [individual.firstName, individual.lastName]
    .filter(Boolean)
    .join(' ')

  const privacy = (individual.privacy ?? DEFAULT_PRIVACY) as unknown as PrivacySettings
  const assessment = (individual.assessment ?? DEFAULT_ASSESSMENT) as unknown as AssessmentData
  const metadata = individual.metadata as unknown as MetadataData
  const experience = (individual.experience ?? []) as unknown as ExperienceItem[]
  const education = (individual.education ?? []) as unknown as EducationItem[]
  const preferences = (individual.preferences ?? {}) as unknown as Record<string, unknown>

  const accommodationsNeeded = individual.accommodationsNeeded
    ? (individual.accommodationsNeeded as string).split('\n').filter(Boolean)
    : []

  return {
    userId: individual.userId as string,
    individualId: individual.id as string,
    email: individual.user?.email as string ?? '',
    userType: 'individual',
    status: individual.user?.status as string ?? 'active',
    createdAt: individual.createdAt as Date,
    updatedAt: individual.updatedAt as Date,
    lastActive: individual.lastActive as Date | null,
    passwordHash: individual.user?.passwordHash as string | undefined,
    profile: {
      name,
      location: individual.location as string | null,
      bio: individual.bio as string ?? '',
      diagnoses: individual.diagnoses as string[],
      skills: individual.skills as string[],
      experience,
      education,
      accommodationsNeeded,
      preferences,
      therapistId: individual.therapistAssignedId as string | null,
      medicalHistory: individual.medicalHistory as string | null,
    },
    privacy,
    assessment,
    metadata,
    validationStatus: individual.validationStatus as string | null,
    matches: { pending: [], accepted: [], rejected: [] },
    connections: [],
    ...extra,
  }
}

// ─── Public Profile View ──────────────────────────────────────────────────────

/**
 * Get public profile view — respects privacy settings.
 * EU AI Act Art. 13: Transparent about what data is shared.
 */
export function getPublicProfileView(profile: IndividualProfile): object {
  const name = profile.privacy.showRealName
    ? profile.profile.name
    : generateAnonymizedName(profile.userId)

  return {
    userId: profile.userId,
    name,
    skills: profile.profile.skills,
    accommodationsNeeded: profile.profile.accommodationsNeeded,
    preferences: profile.profile.preferences,
    assessmentCompleted: profile.assessment.completed,
    assessmentScore: profile.assessment.score,
    experience: profile.profile.experience.map((exp) => ({
      title: exp.title,
      years: exp.years,
    })),
  }
}

// ─── Profile Completion ───────────────────────────────────────────────────────

const COMPLETION_WEIGHTS = { assessment: 40, experience: 30, preferences: 20, skills: 10 }

/**
 * Calculate profile completion percentage from profile data.
 * Returns breakdown + missing steps.
 */
export function calculateProfileCompletionFromData(profile: IndividualProfile) {
  const completion = {
    assessment: profile.assessment.completed ? COMPLETION_WEIGHTS.assessment : 0,
    experience: profile.profile.experience.length > 0 ? COMPLETION_WEIGHTS.experience : 0,
    preferences: Object.keys(profile.profile.preferences).length > 0 ? COMPLETION_WEIGHTS.preferences : 0,
    skills: profile.profile.skills.length >= 3 ? COMPLETION_WEIGHTS.skills : 0,
  }

  const percentage = Object.values(completion).reduce((sum, v) => sum + v, 0)

  return {
    percentage,
    breakdown: completion,
    missingSteps: getMissingSteps(completion, COMPLETION_WEIGHTS),
  }
}

function getMissingSteps(
  completion: Record<string, number>,
  weights: Record<string, number>
): Array<{ step: string; importance: string; weight: number; message: string }> {
  const info: Record<string, { importance: string; message: string }> = {
    assessment: { importance: 'high', message: 'Complete assessment to improve matching' },
    experience: { importance: 'high', message: 'Add work experience to showcase skills' },
    preferences: { importance: 'medium', message: 'Set work preferences for better matches' },
    skills: { importance: 'medium', message: 'Add at least 3 skills' },
  }

  return Object.entries(completion)
    .filter(([, val]) => val === 0)
    .map(([step]) => ({ step, weight: weights[step], ...info[step] }))
    .sort((a, b) => b.weight - a.weight)
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate individual data — rule-based with AI-style normalization.
 * Checks for non-standard diagnoses, sensitive data in public fields, etc.
 */
export function validateIndividualData(data: {
  profile?: {
    diagnoses?: string[]
    experience?: ExperienceItem[]
    bio?: string
    skills?: string[]
  }
}): {
  validated: boolean
  normalized: typeof data
  suggestions: Array<{
    field: string
    suggestion?: string
    original?: string
    message?: string
    priority?: string
  }>
  warnings?: Array<{ field: string; message: string; severity: string }>
} {
  const suggestions: Array<{
    field: string
    suggestion?: string
    original?: string
    message?: string
    priority?: string
  }> = []
  const warnings: Array<{ field: string; message: string; severity: string }> = []

  // Normalize non-standard diagnosis terminology
  const nonStandardMap: Record<string, string> = {
    ADD: 'ADHD',
    Aspergers: 'Autism Spectrum Disorder',
    Asperger: 'Autism Spectrum Disorder',
  }

  if (data.profile?.diagnoses) {
    for (const diagnosis of data.profile.diagnoses) {
      if (nonStandardMap[diagnosis]) {
        suggestions.push({
          field: 'diagnoses',
          suggestion: nonStandardMap[diagnosis],
          original: diagnosis,
        })
      }
    }
  }

  // Detect sensitive data in public fields
  const sensitiveKeywords = ['adhd', 'autism', 'autistic', 'dyslexia', 'disorder']
  if (data.profile?.experience) {
    for (const exp of data.profile.experience) {
      const titleLower = (exp.title ?? '').toLowerCase()
      if (sensitiveKeywords.some((kw) => titleLower.includes(kw))) {
        warnings.push({
          field: 'experience',
          message: 'Sensitive information detected in public field',
          severity: 'medium',
        })
        break
      }
    }
  }

  // Profile quality suggestions
  if ((data.profile?.skills?.length ?? 0) < 3) {
    suggestions.push({
      field: 'skills',
      message: 'Add more skills to improve matching',
      priority: 'medium',
    })
  }

  if (!data.profile?.bio || data.profile.bio.length < 50) {
    suggestions.push({
      field: 'bio',
      message: 'Add a bio to help companies understand your background',
      priority: 'low',
    })
  }

  return {
    validated: true,
    normalized: data,
    suggestions,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

// ─── Privacy Warnings ─────────────────────────────────────────────────────────

/**
 * Check if privacy settings are too restrictive (low visibility warning).
 */
export function checkLowVisibility(privacy: PrivacySettings): Array<{ type: string; message: string }> {
  const warnings: Array<{ type: string; message: string }> = []

  if (!privacy.visibleInSearch && !privacy.showRealName && !privacy.shareDiagnosis) {
    warnings.push({
      type: 'low_visibility',
      message: 'Low visibility settings may reduce matching opportunities',
    })
  }

  return warnings
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Sanitize and split a name for database storage.
 */
export function sanitizeAndSplitName(name: string): { firstName: string; lastName: string } {
  return splitName(sanitizeInput(name))
}
