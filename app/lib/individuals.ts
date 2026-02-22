/**
 * Individual (Candidate) Profile Management — Prisma implementation
 * UC-001: Individual Registration and Profile Management
 *
 * Migrated from JSON file storage to PostgreSQL via Prisma 7.
 * Maintains same public API as individuals.js for backward compatibility.
 *
 * Sprint 3: Refactored to use Repository + Service layers.
 * - Data access: app/lib/repositories/individual.repository.ts
 * - Business logic: app/lib/services/profiles.service.ts
 *
 * Compliance: GDPR Art. 9/17/20, EU AI Act Art. 13/22
 * Security: Diagnoses/medical data encrypted AES-256-GCM at application layer
 */

import {
  isValidEmail,
  sanitizeInput,
  generateAnonymizedName,
} from './utils.js'

// ─── Repository (Data Access) ─────────────────────────────────────────────────

import * as IndividualRepo from './repositories/individual.repository'

// ─── Service (Business Logic) ─────────────────────────────────────────────────

import {
  DEFAULT_PRIVACY,
  DEFAULT_ASSESSMENT,
  splitName,
  checkLowVisibility,
  calculateProfileCompletionFromData,
  validateIndividualData as validateIndividualDataPure,
  getPublicProfileView as computePublicProfileView,
} from './services/profiles.service'

// ─── Re-export Types ──────────────────────────────────────────────────────────

export type {
  PrivacySettings,
  AssessmentData,
  MetadataData,
  ExperienceItem,
  EducationItem,
  IndividualProfile,
} from './services/profiles.service'

import type {
  PrivacySettings,
  AssessmentData,
  IndividualProfile,
  ExperienceItem,
} from './services/profiles.service'

import type { Individual, User } from '@prisma/client'

type IndividualWithUser = Individual & { user: User }

// ─── Normalization (tightly coupled to Prisma types) ──────────────────────────

function normalizeIndividual(
  individual: IndividualWithUser,
  extra: Partial<IndividualProfile> = {}
): IndividualProfile {
  const name = [individual.firstName, individual.lastName]
    .filter(Boolean)
    .join(' ')

  const privacy = (individual.privacy ?? DEFAULT_PRIVACY) as unknown as PrivacySettings
  const assessment = (individual.assessment ?? DEFAULT_ASSESSMENT) as unknown as AssessmentData
  const metadata = individual.metadata as unknown as import('./services/profiles.service').MetadataData
  const experience = (individual.experience ?? []) as unknown as import('./services/profiles.service').ExperienceItem[]
  const education = (individual.education ?? []) as unknown as import('./services/profiles.service').EducationItem[]
  const preferences = (individual.preferences ?? {}) as unknown as Record<string, unknown>

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
 * Stores User + Individual in a single transaction via repository
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
      education?: import('./services/profiles.service').EducationItem[]
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

  // Check for duplicate email via repository
  const existingUser = await IndividualRepo.findUserByEmail(email)
  if (existingUser) throw new Error('Email already exists')

  // Apply default privacy (most restrictive) then override with user preferences
  const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(data.privacy ?? {}) }

  // Low-visibility warning via service
  const warnings = checkLowVisibility(privacy)

  const { firstName, lastName } = splitName(sanitizeInput(data.profile.name))

  // accommodationsNeeded: store as newline-separated string
  const accommodationsStr =
    data.profile.accommodationsNeeded?.join('\n') || null

  // Create User + Individual atomically via repository
  const individual = await IndividualRepo.createUserAndIndividual(
    {
      email,
      passwordHash: data.passwordHash ?? '',
      userType: 'individual',
      status: 'active',
    },
    {
      firstName,
      lastName,
      diagnoses: data.profile.diagnoses ?? [],
      accommodationsNeeded: accommodationsStr,
      medicalHistory: data.profile.medicalHistory ?? null,
      bio: sanitizeInput(data.profile.bio ?? ''),
      location: data.profile.location ?? null,
      skills: data.profile.skills ?? [],
      experience: (data.profile.experience ?? []) as object[],
      education: (data.profile.education ?? []) as object[],
      preferences: (data.profile.preferences ?? {}) as object,
      therapistAssignedId: data.profile.therapistId ?? null,
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
    }
  )

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
 * Get individual profile by userId via repository
 */
export async function getIndividualProfile(
  userId: string
): Promise<IndividualProfile | null> {
  const individual = await IndividualRepo.findIndividualByUserId(userId)
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
 * Update individual profile via repository
 */
export async function updateIndividualProfile(
  userId: string,
  updates: {
    profile?: Partial<IndividualProfile['profile']>
    privacy?: Partial<PrivacySettings>
    assessment?: Partial<AssessmentData>
  }
): Promise<IndividualProfile> {
  const current = await IndividualRepo.findIndividualByUserId(userId)
  if (!current) throw new Error('Individual not found')

  const currentPrivacy = (current.privacy ?? DEFAULT_PRIVACY) as unknown as PrivacySettings
  const currentAssessment = (current.assessment ?? DEFAULT_ASSESSMENT) as unknown as AssessmentData

  // Build name update if provided
  const nameUpdate = updates.profile?.name
    ? splitName(sanitizeInput(updates.profile.name))
    : {}

  const updated = await IndividualRepo.updateIndividual(userId, {
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
 * Deactivate individual profile via repository
 */
export async function deactivateIndividual(userId: string): Promise<IndividualProfile> {
  const individual = await IndividualRepo.deactivateIndividualInDb(userId)
  return normalizeIndividual(individual as IndividualWithUser)
}

/**
 * Delete individual account — GDPR Art. 17 (Right to Erasure)
 * Soft delete: anonymizes PII, retains audit trail for compliance
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  await IndividualRepo.anonymizeUserAccount(userId)
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
 * Get public profile view — delegates to profiles.service
 * EU AI Act Art. 13: Transparent about what data is shared
 */
export function getPublicProfileView(profile: IndividualProfile): object {
  return computePublicProfileView(profile)
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
 * Uses repository for data access + service filter logic
 */
export async function getVisibleIndividuals(): Promise<IndividualProfile[]> {
  const individuals = await IndividualRepo.findActiveIndividuals()

  return individuals
    .map((ind) => normalizeIndividual(ind as IndividualWithUser))
    .filter((p) => p.privacy.visibleInSearch && p.assessment.completed)
}

/**
 * Calculate profile completion percentage — delegates to profiles.service
 * Drives UI progress indicators and matching quality
 */
export async function calculateProfileCompletion(
  userId: string
): Promise<object | null> {
  const profile = await getIndividualProfile(userId)
  if (!profile) return null

  return calculateProfileCompletionFromData(profile)
}

// ─── Therapist Integration ────────────────────────────────────────────────────

export async function addTherapistToIndividual(
  userId: string,
  therapistId: string
): Promise<IndividualProfile> {
  const updated = await IndividualRepo.updateIndividual(userId, {
    therapistAssignedId: therapistId,
    updatedAt: new Date(),
  })
  return normalizeIndividual(updated as IndividualWithUser)
}

export async function removeTherapistFromIndividual(
  userId: string
): Promise<IndividualProfile> {
  const updated = await IndividualRepo.updateIndividual(userId, {
    therapistAssignedId: null,
    updatedAt: new Date(),
  })
  return normalizeIndividual(updated as IndividualWithUser)
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate individual data — delegates to profiles.service
 * Rule-based with AI-style normalization
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
  return validateIndividualDataPure(data)
}
