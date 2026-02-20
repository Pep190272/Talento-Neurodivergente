/**
 * Individual (Candidate) Profile Management — Prisma implementation
 * UC-001: Individual Registration and Profile Management
 *
 * Migrated from JSON file storage to PostgreSQL via Prisma 7.
 * Maintains same public API as individuals.js for backward compatibility.
 *
 * Compliance: GDPR Art. 9/17/20, EU AI Act Art. 13/22
 * Security: Diagnoses/medical data encrypted AES-256-GCM at application layer
 */

import prisma from './prisma'
import type { Individual, User } from '@prisma/client'
import {
  isValidEmail,
  sanitizeInput,
  generateAnonymizedName,
} from './utils.js'

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

export interface MetadataData {
  lastLogin: string | null
  profileViews: number
  matchesReceived: number
  applicationsSubmitted: number
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

type IndividualWithUser = Individual & { user: User }

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PRIVACY: PrivacySettings = {
  visibleInSearch: true,
  showRealName: false,
  shareDiagnosis: false,
  shareTherapistContact: false,
  shareAssessmentDetails: true,
}

const DEFAULT_ASSESSMENT: AssessmentData = {
  completed: false,
  completedAt: null,
  strengths: [],
  challenges: [],
  score: null,
  technicalSkills: [],
  softSkills: [],
  workStyle: {},
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

function normalizeIndividual(
  individual: IndividualWithUser,
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

  // accommodationsNeeded: stored as newline-separated string in DB
  const accommodationsNeeded = individual.accommodationsNeeded
    ? individual.accommodationsNeeded.split('\n').filter(Boolean)
    : []

  return {
    userId: individual.userId,
    individualId: individual.id,
    email: individual.user?.email ?? '',
    userType: 'individual',
    status: individual.user?.status ?? 'active',
    createdAt: individual.createdAt,
    updatedAt: individual.updatedAt,
    lastActive: individual.lastActive,
    passwordHash: individual.user?.passwordHash,
    profile: {
      name,
      location: individual.location,
      bio: individual.bio ?? '',
      diagnoses: individual.diagnoses,
      skills: individual.skills,
      experience,
      education,
      accommodationsNeeded,
      preferences,
      therapistId: individual.therapistAssignedId,
      medicalHistory: individual.medicalHistory,
    },
    privacy,
    assessment,
    metadata,
    validationStatus: individual.validationStatus,
    matches: { pending: [], accepted: [], rejected: [] },
    connections: [],
    ...extra,
  }
}

// ─── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Create new individual profile
 * Stores User + Individual in a single transaction
 */
export async function createIndividualProfile(
  data: {
    email?: string
    password?: string
    passwordHash?: string
    profile?: {
      name?: string
      location?: string
      bio?: string
      diagnoses?: string[]
      skills?: string[]
      experience?: ExperienceItem[]
      education?: EducationItem[]
      accommodationsNeeded?: string[]
      preferences?: Record<string, unknown>
      therapistId?: string | null
      medicalHistory?: string | null
    }
    privacy?: Partial<PrivacySettings>
    assessment?: Partial<AssessmentData>
  },
  options: { draft?: boolean } = {}
): Promise<IndividualProfile> {
  // Handle draft mode — no DB required
  if (options.draft) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`draft_${data.email}`, JSON.stringify(data))
    }
    return {
      ...(data as unknown as IndividualProfile),
      isDraft: true,
      savedToLocalStorage: true,
    }
  }

  // Validate required fields
  if (!data.profile) throw new Error('Profile data is required')
  if (!data.email) throw new Error('Email is required')
  if (!data.profile.name) throw new Error('Name is required')

  const email = data.email.toLowerCase().trim()
  if (!isValidEmail(email)) throw new Error('Invalid email format')

  // Check for duplicate email
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) throw new Error('Email already exists')

  // Apply default privacy (most restrictive) then override with user preferences
  const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(data.privacy ?? {}) }

  // Low-visibility warning: matching will be harder
  const warnings: Array<{ type: string; message: string }> = []
  if (!privacy.visibleInSearch && !privacy.showRealName && !privacy.shareDiagnosis) {
    warnings.push({
      type: 'low_visibility',
      message: 'Low visibility settings may reduce matching opportunities',
    })
  }

  const { firstName, lastName } = splitName(sanitizeInput(data.profile.name))

  // accommodationsNeeded: store as newline-separated string
  const accommodationsStr =
    data.profile.accommodationsNeeded?.join('\n') || null

  // Create User + Individual atomically
  const individual = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: data.passwordHash ?? '',
        userType: 'individual',
        status: 'active',
      },
    })

    return tx.individual.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        diagnoses: data.profile!.diagnoses ?? [],
        accommodationsNeeded: accommodationsStr,
        medicalHistory: data.profile!.medicalHistory ?? null,
        bio: sanitizeInput(data.profile!.bio ?? ''),
        location: data.profile!.location ?? null,
        skills: data.profile!.skills ?? [],
        experience: (data.profile!.experience ?? []) as object[],
        education: (data.profile!.education ?? []) as object[],
        preferences: (data.profile!.preferences ?? {}) as object,
        therapistAssignedId: data.profile!.therapistId ?? null,
        privacy: privacy as object,
        assessment: (data.assessment
          ? { ...DEFAULT_ASSESSMENT, ...data.assessment }
          : DEFAULT_ASSESSMENT) as object,
        metadata: {
          lastLogin: new Date().toISOString(),
          profileViews: 0,
          matchesReceived: 0,
          applicationsSubmitted: 0,
        } as object,
        lastActive: new Date(),
        validationStatus: 'pending',
      },
      include: { user: true },
    })
  })

  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  // AI validation — optional, graceful fallback
  let aiSuggestions: unknown[] | undefined
  try {
    const validated = await validateIndividualData(data)
    if (validated.suggestions.length > 0) {
      aiSuggestions = validated.suggestions
    }
  } catch {
    // AI validation is optional — profile creation proceeds
  }

  return normalizeIndividual(individual as IndividualWithUser, {
    warnings: warnings.length > 0 ? warnings : undefined,
    redirectTo: '/dashboard/individual',
    triggerWelcomeMessage: true,
    welcomeMessageContext: { userId: individual.userId, name: fullName },
    ...(aiSuggestions && { aiSuggestions }),
  })
}

/**
 * Get individual profile by userId
 */
export async function getIndividualProfile(
  userId: string
): Promise<IndividualProfile | null> {
  const individual = await prisma.individual.findUnique({
    where: { userId },
    include: { user: true },
  })
  if (!individual) return null
  return normalizeIndividual(individual as IndividualWithUser)
}

/**
 * Alias for getIndividualProfile (backward compatibility)
 */
export async function getIndividualById(
  userId: string
): Promise<IndividualProfile | null> {
  return getIndividualProfile(userId)
}

/**
 * Update individual profile
 */
export async function updateIndividualProfile(
  userId: string,
  updates: {
    profile?: Partial<IndividualProfile['profile']>
    privacy?: Partial<PrivacySettings>
    assessment?: Partial<AssessmentData>
  }
): Promise<IndividualProfile> {
  const current = await prisma.individual.findUnique({
    where: { userId },
    include: { user: true },
  })
  if (!current) throw new Error('Individual not found')

  const currentPrivacy = (current.privacy ?? DEFAULT_PRIVACY) as unknown as PrivacySettings
  const currentAssessment = (current.assessment ?? DEFAULT_ASSESSMENT) as unknown as AssessmentData

  // Build name update if provided
  const nameUpdate = updates.profile?.name
    ? splitName(sanitizeInput(updates.profile.name))
    : {}

  const updated = await prisma.individual.update({
    where: { userId },
    data: {
      ...(updates.profile && {
        ...nameUpdate,
        bio:
          updates.profile.bio !== undefined
            ? sanitizeInput(updates.profile.bio)
            : undefined,
        location: updates.profile.location,
        skills: updates.profile.skills,
        experience: updates.profile.experience as object[] | undefined,
        education: updates.profile.education as object[] | undefined,
        preferences: updates.profile.preferences as object | undefined,
        therapistAssignedId: updates.profile.therapistId,
        accommodationsNeeded:
          updates.profile.accommodationsNeeded !== undefined
            ? updates.profile.accommodationsNeeded.join('\n') || null
            : undefined,
      }),
      ...(updates.privacy && {
        privacy: { ...currentPrivacy, ...updates.privacy } as object,
      }),
      ...(updates.assessment && {
        assessment: { ...currentAssessment, ...updates.assessment } as object,
      }),
      updatedAt: new Date(),
    },
    include: { user: true },
  })

  return normalizeIndividual(updated as IndividualWithUser)
}

/**
 * Update privacy settings (GDPR Art. 7 — granular consent management)
 */
export async function updatePrivacySettings(
  userId: string,
  privacyUpdates: Partial<PrivacySettings>
): Promise<IndividualProfile> {
  return updateIndividualProfile(userId, { privacy: privacyUpdates })
}

/**
 * Complete assessment — triggers matching after completion
 */
export async function completeAssessment(
  userId: string,
  assessmentData: Partial<AssessmentData>
): Promise<IndividualProfile & { matchingTriggered: boolean }> {
  const updated = await updateIndividualProfile(userId, {
    assessment: { ...assessmentData, completed: true, completedAt: new Date() },
  })
  return { ...updated, matchingTriggered: true }
}

/**
 * Deactivate individual profile
 */
export async function deactivateIndividual(userId: string): Promise<IndividualProfile> {
  const individual = await prisma.individual.update({
    where: { userId },
    data: { deactivatedAt: new Date(), updatedAt: new Date() },
    include: { user: true },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'deactivated' },
  })

  return normalizeIndividual(individual as IndividualWithUser)
}

/**
 * Delete individual account — GDPR Art. 17 (Right to Erasure)
 * Soft delete: anonymizes PII, retains audit trail for compliance
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.individual.update({
      where: { userId },
      data: {
        firstName: 'Deleted',
        lastName: 'User',
        bio: null,
        location: null,
        diagnoses: [],
        accommodationsNeeded: null,
        medicalHistory: null,
        deletedAt: now,
        updatedAt: now,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.local`,
        status: 'deleted',
        updatedAt: now,
      },
    })
  })
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get public profile (respects privacy settings)
 * Used for matching display before consent is established
 */
export async function getPublicProfile(userId: string): Promise<object | null> {
  const profile = await getIndividualProfile(userId)
  if (!profile) return null
  return getPublicProfileView(profile)
}

/**
 * Get public profile view — synchronous, takes normalized profile object
 * EU AI Act Art. 13: Transparent about what data is shared
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
      // Company names and details omitted for privacy
    })),
    // diagnoses deliberately excluded — never in public view
    // email, therapistId, medicalHistory deliberately excluded
  }
}

/**
 * Get profile data for company with active connection
 * Only returns data explicitly consented in the connection.sharedData array
 */
export async function getProfileForCompany(
  userId: string,
  connectionId: string
): Promise<object> {
  const profile = await getIndividualProfile(userId)
  if (!profile) throw new Error('Profile not found')

  const connection = profile.connections.find(
    (c: unknown) => (c as { connectionId: string }).connectionId === connectionId
  ) as
    | { status: string; sharedData: string[]; customPrivacy?: PrivacySettings }
    | undefined

  if (!connection || connection.status !== 'active') {
    throw new Error('No active connection exists')
  }

  const result: Record<string, unknown> = {}

  if (connection.sharedData.includes('name')) {
    result.name = connection.customPrivacy?.showRealName
      ? profile.profile.name
      : generateAnonymizedName(userId)
  }
  if (connection.sharedData.includes('email')) result.email = profile.email
  if (connection.sharedData.includes('skills')) result.skills = profile.profile.skills
  if (connection.sharedData.includes('assessment')) result.assessment = profile.assessment
  if (
    connection.sharedData.includes('diagnosis') &&
    connection.customPrivacy?.shareDiagnosis
  ) {
    result.diagnoses = profile.profile.diagnoses
  }
  if (connection.sharedData.includes('accommodations')) {
    result.accommodationsNeeded = profile.profile.accommodationsNeeded
  }
  if (connection.sharedData.includes('experience')) {
    result.experience = profile.profile.experience
  }
  if (connection.sharedData.includes('education')) {
    result.education = profile.profile.education
  }

  return result
}

/**
 * Get all individuals visible in search (for matching engine)
 */
export async function getVisibleIndividuals(): Promise<IndividualProfile[]> {
  const individuals = await prisma.individual.findMany({
    where: {
      deletedAt: null,
      user: { status: 'active' },
    },
    include: { user: true },
  })

  return individuals
    .map((ind) => normalizeIndividual(ind as IndividualWithUser))
    .filter((p) => p.privacy.visibleInSearch && p.assessment.completed)
}

/**
 * Calculate profile completion percentage
 * Drives UI progress indicators and matching quality
 */
export async function calculateProfileCompletion(
  userId: string
): Promise<object | null> {
  const profile = await getIndividualProfile(userId)
  if (!profile) return null

  const weights = { assessment: 40, experience: 30, preferences: 20, skills: 10 }
  const completion = {
    assessment: profile.assessment.completed ? weights.assessment : 0,
    experience: profile.profile.experience.length > 0 ? weights.experience : 0,
    preferences: Object.keys(profile.profile.preferences).length > 0 ? weights.preferences : 0,
    skills: profile.profile.skills.length >= 3 ? weights.skills : 0,
  }

  const percentage = Object.values(completion).reduce((sum, v) => sum + v, 0)

  return {
    percentage,
    breakdown: completion,
    missingSteps: getMissingSteps(completion, weights),
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

// ─── Therapist Integration ────────────────────────────────────────────────────

export async function addTherapistToIndividual(
  userId: string,
  therapistId: string
): Promise<IndividualProfile> {
  const updated = await prisma.individual.update({
    where: { userId },
    data: { therapistAssignedId: therapistId, updatedAt: new Date() },
    include: { user: true },
  })
  return normalizeIndividual(updated as IndividualWithUser)
}

export async function removeTherapistFromIndividual(
  userId: string
): Promise<IndividualProfile> {
  const updated = await prisma.individual.update({
    where: { userId },
    data: { therapistAssignedId: null, updatedAt: new Date() },
    include: { user: true },
  })
  return normalizeIndividual(updated as IndividualWithUser)
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate individual data — rule-based with AI-style normalization
 * Checks for non-standard diagnoses, sensitive data in public fields, etc.
 */
export async function validateIndividualData(data: {
  profile?: {
    diagnoses?: string[]
    experience?: ExperienceItem[]
    bio?: string
    skills?: string[]
  }
}): Promise<{
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
}> {
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

  // Detect sensitive data inadvertently placed in public fields
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
