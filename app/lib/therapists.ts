/**
 * Therapist Profile and Client Management — Prisma implementation
 * UC-008: Therapist Registration
 * UC-009: Therapist Support Tools
 *
 * Migrated from therapists.js → therapists.ts (Prisma 7 / PostgreSQL)
 * Maintains same public API for backward compatibility.
 *
 * Decisión de migración (2026-02-20):
 * - storage.js (JSON files) → Prisma/PostgreSQL
 * - Modelo Therapist expandido con todos los campos del JSON schema
 * - Cross-calls a individuals.ts (Prisma) se mantienen igual
 * - Verificación de certificaciones sigue siendo simulada (MVP)
 */

import prisma from './prisma'
import type { Therapist, User } from '@prisma/client'
import {
  isValidEmail,
  sanitizeInput,
} from './utils.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Certification {
  title: string
  licenseNumber: string
  issuingBody: string
  expiryDate: string | null
}

interface TherapistMetadata {
  lastLogin: string | null
  sessionsCompleted: number
  clientSatisfactionScore: number | null
  averageResponseTime: number | null
  lastSessionDate: string | null
}

type TherapistWithUser = Therapist & { user: User }

export interface TherapistProfile {
  therapistId: string
  userId: string
  email: string
  userType: 'therapist'
  status: string
  createdAt: Date
  updatedAt: Date
  profile: {
    name: string
    certifications: Certification[]
    specializations: string[]
    neurodiversityExperience: number
    experienceYears: number
    approach: string | null
    services: string[]
    rates: unknown
    languages: string[]
    location: string | null
    bio: string
    acceptingNewClients: boolean
  }
  certificationValidation: { validated: boolean; checkedAt: Date | null } | null
  additionalDocumentationRequired: boolean
  badges: string[]
  warnings: Array<{ type: string; message: string }>
  clients: string[]
  companyPartners: string[]
  companyContracts: Record<string, unknown>
  pendingRequests: unknown[]
  availability: {
    status: string
    maxClients: number
    currentClients: number
  }
  verificationStatus: string
  verifiedAt: Date | null
  verifiedBy: string | null
  verificationNotes: string | null
  rejectionReason: string | null
  welcomeEmailSent: boolean
  redirectTo: string | null
  metadata: TherapistMetadata
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RECOGNIZED_BODIES = [
  'State Board of Psychology',
  'American Psychological Association',
  'National Board for Certified Counselors',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeTherapist(therapist: TherapistWithUser): TherapistProfile {
  const certs = (therapist.certifications as unknown as Certification[]) ?? []
  const certValidation = (therapist.certificationValidation as unknown as { validated: boolean; checkedAt: Date | null }) ?? null
  const warnings = (therapist.warnings as unknown as Array<{ type: string; message: string }>) ?? []
  const metadata = (therapist.metadata as unknown as TherapistMetadata) ?? {} as TherapistMetadata
  const companyContracts = (therapist.companyContracts as unknown as Record<string, unknown>) ?? {}
  const pendingRequests = (therapist.pendingRequests as unknown as unknown[]) ?? []

  return {
    therapistId: therapist.id,
    userId: therapist.userId,
    email: therapist.user.email,
    userType: 'therapist',
    status: therapist.user.status,
    createdAt: therapist.createdAt,
    updatedAt: therapist.updatedAt,
    profile: {
      name: therapist.name,
      certifications: certs,
      specializations: therapist.specializations,
      neurodiversityExperience: therapist.neurodiversityExperience,
      experienceYears: therapist.experienceYears,
      approach: therapist.approach,
      services: therapist.services,
      rates: undefined,
      languages: therapist.languages,
      location: therapist.location,
      bio: therapist.bio ?? '',
      acceptingNewClients: therapist.acceptingNewClients,
    },
    certificationValidation: certValidation,
    additionalDocumentationRequired: therapist.additionalDocRequired,
    badges: therapist.badges,
    warnings,
    clients: therapist.clients,
    companyPartners: therapist.companyPartners,
    companyContracts,
    pendingRequests,
    availability: {
      status: therapist.acceptingNewClients ? 'available' : 'unavailable',
      maxClients: therapist.maxClients,
      currentClients: therapist.currentClients,
    },
    verificationStatus: therapist.verificationStatus,
    verifiedAt: therapist.verifiedAt,
    verifiedBy: therapist.verifiedBy,
    verificationNotes: therapist.verificationNotes,
    rejectionReason: (therapist as unknown as Record<string, unknown>).rejectionReason as string | null ?? null,
    welcomeEmailSent: therapist.verificationStatus === 'verified',
    redirectTo: therapist.verificationStatus === 'verified' ? '/dashboard/therapist' : null,
    metadata,
  }
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Create new therapist profile
 * @param data - Therapist registration data
 * @returns Created therapist profile
 */
export async function createTherapist(data: {
  email: string
  password?: string
  profile: {
    name: string
    certifications: Array<{ title?: string; licenseNumber?: string; issuingBody?: string; issuer?: string; expiryDate?: string }>
    specializations: string[]
    neurodiversityExperience?: number
    experienceYears?: number
    approach?: string
    services?: string[]
    rates?: unknown
    languages?: string[]
    location?: string
    bio?: string
  }
  availability?: { maxClients?: number }
}): Promise<TherapistProfile> {
  if (!data.email) {
    throw new Error('Email is required')
  }

  if (!data.profile) {
    throw new Error('Profile is required')
  }

  const email = data.email.toLowerCase().trim()

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format')
  }

  // Check for duplicate email
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error('Email already exists')
  }

  // Validate certifications
  if (!Array.isArray(data.profile.certifications) || data.profile.certifications.length === 0) {
    throw new Error('At least one certification is required')
  }

  // Check for expired certifications
  for (const cert of data.profile.certifications) {
    if (cert.expiryDate) {
      const expiryDate = new Date(cert.expiryDate)
      if (expiryDate < new Date()) {
        throw new Error('Certification has expired')
      }
    }
  }

  // Normalize certifications
  const certifications: Certification[] = data.profile.certifications.map(cert => ({
    title: sanitizeInput(cert.title || ''),
    licenseNumber: sanitizeInput(cert.licenseNumber || ''),
    issuingBody: sanitizeInput(cert.issuingBody || cert.issuer || ''),
    expiryDate: cert.expiryDate || null,
  }))

  // Check if certification is from recognized body
  const hasRecognizedCert = certifications.some(cert =>
    RECOGNIZED_BODIES.includes(cert.issuingBody)
  )

  // Neurodiversity experience badges/warnings
  const neurodiversityExperience = data.profile.neurodiversityExperience || 0
  const badges: string[] = []
  const warnings: Array<{ type: string; message: string }> = []

  if (neurodiversityExperience === 0) {
    badges.push('new_to_neurodiversity')
    warnings.push({
      type: 'limited_experience',
      message: 'Limited neurodiversity experience',
    })
  }

  // Create User + Therapist in transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: data.password || 'pending_hash',
        userType: 'therapist',
        status: 'pending_verification',
      },
    })

    const therapist = await tx.therapist.create({
      data: {
        userId: user.id,
        name: sanitizeInput(data.profile.name || ''),
        specialty: data.profile.specializations?.[0] ?? null,
        licenseNumber: certifications[0]?.licenseNumber ?? null,
        specializations: data.profile.specializations || [],
        certifications: certifications as unknown as [],
        certificationValidation: {
          validated: hasRecognizedCert,
          checkedAt: new Date(),
        },
        additionalDocRequired: !hasRecognizedCert,
        neurodiversityExperience,
        experienceYears: data.profile.experienceYears || 0,
        approach: data.profile.approach || null,
        services: data.profile.services || [],
        languages: data.profile.languages || ['English'],
        location: data.profile.location || null,
        bio: sanitizeInput(data.profile.bio || ''),
        acceptingNewClients: true,
        clients: [],
        companyPartners: [],
        maxClients: data.availability?.maxClients || 20,
        currentClients: 0,
        verificationStatus: 'pending',
        badges: badges.length > 0 ? badges : [],
        warnings: warnings.length > 0 ? warnings as unknown as [] : [],
        metadata: {
          lastLogin: new Date().toISOString(),
          sessionsCompleted: 0,
          clientSatisfactionScore: null,
          averageResponseTime: null,
          lastSessionDate: null,
        },
      },
      include: { user: true },
    })

    return therapist
  })

  return normalizeTherapist(result)
}

/**
 * Get therapist profile by therapist ID
 */
export async function getTherapist(therapistId: string): Promise<TherapistProfile | null> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) return null
  return normalizeTherapist(therapist)
}

/**
 * Get therapist by userId
 */
export async function getTherapistByUserId(userId: string): Promise<TherapistProfile | null> {
  const therapist = await prisma.therapist.findUnique({
    where: { userId },
    include: { user: true },
  })

  if (!therapist) return null
  return normalizeTherapist(therapist)
}

/**
 * Update therapist profile
 */
export async function updateTherapist(
  therapistId: string,
  updates: {
    profile?: Partial<TherapistProfile['profile']>
    availability?: Partial<TherapistProfile['availability']>
  }
): Promise<TherapistProfile> {
  const data: Record<string, unknown> = {}

  if (updates.profile) {
    if (updates.profile.name) data.name = sanitizeInput(updates.profile.name)
    if (updates.profile.bio !== undefined) data.bio = sanitizeInput(updates.profile.bio)
    if (updates.profile.specializations) data.specializations = updates.profile.specializations
    if (updates.profile.certifications) data.certifications = updates.profile.certifications as unknown as []
    if (updates.profile.approach !== undefined) data.approach = updates.profile.approach
    if (updates.profile.services) data.services = updates.profile.services
    if (updates.profile.languages) data.languages = updates.profile.languages
    if (updates.profile.location !== undefined) data.location = updates.profile.location
    if (updates.profile.experienceYears !== undefined) data.experienceYears = updates.profile.experienceYears
    if (updates.profile.neurodiversityExperience !== undefined) data.neurodiversityExperience = updates.profile.neurodiversityExperience
    if (updates.profile.acceptingNewClients !== undefined) data.acceptingNewClients = updates.profile.acceptingNewClients
  }

  if (updates.availability) {
    if (updates.availability.maxClients !== undefined) data.maxClients = updates.availability.maxClients
    if (updates.availability.currentClients !== undefined) data.currentClients = updates.availability.currentClients
  }

  const therapist = await prisma.therapist.update({
    where: { id: therapistId },
    data,
    include: { user: true },
  })

  return normalizeTherapist(therapist)
}

/**
 * Verify therapist (admin action)
 */
export async function verifyTherapist(
  therapistId: string,
  options: {
    status?: string
    verifiedBy?: string
    notes?: string
    reason?: string
  } = {}
): Promise<TherapistProfile> {
  const isRejected = options.status === 'rejected'

  const data: Record<string, unknown> = {}

  if (isRejected) {
    data.rejectionReason = options.reason || null
    data.rejectedAt = new Date()
    data.verificationStatus = 'rejected'
  } else {
    data.verificationStatus = 'verified'
    data.verifiedAt = new Date()
  }

  if (options.verifiedBy) data.verifiedBy = options.verifiedBy
  if (options.notes) data.verificationNotes = options.notes

  const therapist = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      ...data,
      user: {
        update: {
          status: isRejected ? 'rejected' : 'active',
        },
      },
    },
    include: { user: true },
  })

  return normalizeTherapist(therapist)
}

/**
 * Add client to therapist (individual user)
 * Also updates individual's therapistAssignedId via cross-call
 */
export async function addClientToTherapist(therapistId: string, clientId: string): Promise<TherapistProfile> {
  // First read current state
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')
  if (therapist.clients.includes(clientId)) throw new Error('Client already added')
  if (!therapist.acceptingNewClients) throw new Error('Therapist not accepting new clients')
  if (therapist.currentClients >= therapist.maxClients) throw new Error('Therapist at maximum capacity')

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      clients: { push: clientId },
      currentClients: { increment: 1 },
    },
    include: { user: true },
  })

  // Cross-update individual's therapist reference
  const { addTherapistToIndividual } = await import('./individuals')
  await addTherapistToIndividual(clientId, therapistId)

  return normalizeTherapist(updated)
}

/**
 * Remove client from therapist
 * Also removes therapist from individual's profile via cross-call
 */
export async function removeClientFromTherapist(therapistId: string, clientId: string): Promise<TherapistProfile> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      clients: therapist.clients.filter(id => id !== clientId),
      currentClients: Math.max(0, therapist.currentClients - 1),
    },
    include: { user: true },
  })

  // Cross-update individual's therapist reference
  const { removeTherapistFromIndividual } = await import('./individuals')
  await removeTherapistFromIndividual(clientId)

  return normalizeTherapist(updated)
}

/**
 * Add company partner to therapist
 */
export async function addCompanyPartner(therapistId: string, companyId: string): Promise<TherapistProfile> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')
  if (therapist.companyPartners.includes(companyId)) throw new Error('Company already a partner')

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      companyPartners: { push: companyId },
    },
    include: { user: true },
  })

  return normalizeTherapist(updated)
}

/**
 * Remove company partner from therapist
 */
export async function removeCompanyPartner(therapistId: string, companyId: string): Promise<TherapistProfile> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      companyPartners: therapist.companyPartners.filter(id => id !== companyId),
    },
    include: { user: true },
  })

  return normalizeTherapist(updated)
}

/**
 * Get client data for therapist (with elevated access — therapists see diagnoses)
 */
export async function getClientDataForTherapist(therapistId: string, clientId: string) {
  const therapist = await prisma.therapist.findUnique({ where: { id: therapistId } })

  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.clients.includes(clientId)) throw new Error('Not authorized to access this client')

  const { getIndividualProfile } = await import('./individuals')
  const client = await getIndividualProfile(clientId)

  if (!client) throw new Error('Client not found')

  return {
    userId: client.userId,
    name: client.profile.name,
    email: client.email,
    diagnoses: client.profile.diagnoses,
    accommodationsNeeded: client.profile.accommodationsNeeded,
    assessment: client.assessment,
    matches: client.matches,
    connections: client.connections,
    profile: client.profile,
  }
}

/**
 * Get all clients for a therapist
 */
export async function getTherapistClients(therapistId: string) {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')

  const { getIndividualProfile } = await import('./individuals')

  // Get individual clients
  const individualClients = (await Promise.all(
    therapist.clients.map(async (clientId) => {
      const client = await getIndividualProfile(clientId)
      if (!client) return null

      return {
        userId: client.userId,
        name: client.profile.name,
        diagnoses: client.profile.diagnoses,
        assessmentCompleted: client.assessment.completed,
        activeMatches: (client.matches?.pending?.length ?? 0) + (client.matches?.accepted?.length ?? 0),
        lastActive: client.metadata.lastLogin,
      }
    })
  )).filter((c): c is NonNullable<typeof c> => c !== null)

  // Get company clients
  const { getCompany } = await import('./companies')
  const companyClients = (await Promise.all(
    therapist.companyPartners.map(async (companyId) => {
      const company = await getCompany(companyId)
      if (!company) return null

      return {
        companyId: company.companyId,
        name: company.name,
        contractStartDate: null,
      }
    })
  )).filter((c): c is NonNullable<typeof c> => c !== null)

  // Generate suggestions
  const suggestions: Array<{ type: string; message: string }> = []
  if (individualClients.length === 0 && companyClients.length === 0) {
    suggestions.push({
      type: 'get_started',
      message: 'How to get your first clients',
    })
  }

  return {
    individualClients,
    companyClients,
    suggestions,
  }
}

/**
 * Get therapist dashboard data
 */
export async function getTherapistDashboard(therapistId: string) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) throw new Error('Therapist not found')

  const clientsData = await getTherapistClients(therapistId)
  const individualClients = clientsData.individualClients || []

  const activeClients = individualClients.filter(c => c.activeMatches > 0)
  const clientsWithCompleteAssessment = individualClients.filter(c => c.assessmentCompleted)

  return {
    therapistId,
    therapist: therapist.profile,
    verificationStatus: therapist.verificationStatus,
    clients: {
      total: individualClients.length,
      active: activeClients.length,
      capacity: therapist.availability.maxClients,
      acceptingNew: therapist.profile.acceptingNewClients,
    },
    metrics: {
      assessmentCompletionRate: individualClients.length > 0
        ? Math.round((clientsWithCompleteAssessment.length / individualClients.length) * 100)
        : 0,
      totalActiveMatches: individualClients.reduce((sum, c) => sum + c.activeMatches, 0),
      sessionsCompleted: therapist.metadata.sessionsCompleted,
      satisfactionScore: therapist.metadata.clientSatisfactionScore,
    },
    recentClients: individualClients.slice(0, 5),
    pendingRequests: therapist.pendingRequests,
    resources: {
      gamesLibrary: '/resources/games',
      quizzesLibrary: '/resources/quizzes',
    },
  }
}

/**
 * Log therapy session (for metrics)
 */
export async function logTherapySession(
  therapistId: string,
  clientId: string,
  _sessionData?: unknown
): Promise<TherapistProfile> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.clients.includes(clientId)) throw new Error('Not authorized to log session for this client')

  const currentMetadata = (therapist.metadata as unknown as TherapistMetadata) ?? {} as TherapistMetadata

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      metadata: {
        ...currentMetadata,
        sessionsCompleted: (currentMetadata.sessionsCompleted || 0) + 1,
        lastSessionDate: new Date().toISOString(),
      },
    },
    include: { user: true },
  })

  return normalizeTherapist(updated)
}

/**
 * Get all verified therapists (for matching)
 */
export async function getVerifiedTherapists(): Promise<TherapistProfile[]> {
  const therapists = await prisma.therapist.findMany({
    where: {
      verificationStatus: 'verified',
      acceptingNewClients: true,
      user: { status: 'active' },
    },
    include: { user: true },
  })

  return therapists.map(normalizeTherapist)
}

/**
 * Search therapists by specialization
 */
export async function searchTherapistsBySpecialization(specialization: string): Promise<TherapistProfile[]> {
  const therapists = await prisma.therapist.findMany({
    where: {
      verificationStatus: 'verified',
      acceptingNewClients: true,
      user: { status: 'active' },
      specializations: { has: specialization },
    },
    include: { user: true },
  })

  // Also do partial match for broader results
  if (therapists.length === 0) {
    const allVerified = await getVerifiedTherapists()
    return allVerified.filter(t =>
      t.profile.specializations.some(spec =>
        spec.toLowerCase().includes(specialization.toLowerCase())
      )
    )
  }

  return therapists.map(normalizeTherapist)
}

/**
 * Add therapist notes for a client (private)
 * Note: In MVP, returns note object without persisting separately
 */
export async function addTherapistNotes(
  therapistId: string,
  clientId: string,
  noteData: { content: string; private?: boolean }
) {
  const therapist = await prisma.therapist.findUnique({ where: { id: therapistId } })

  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.clients.includes(clientId)) throw new Error('Access denied: No consent from client')

  return {
    noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    therapistId,
    clientId,
    content: noteData.content,
    private: noteData.private !== false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Add company as consulting client
 */
export async function addCompanyClient(
  therapistId: string,
  companyId: string,
  contractData: { serviceType?: string; contractStartDate?: Date } = {}
): Promise<TherapistProfile> {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')
  if (therapist.companyPartners.includes(companyId)) throw new Error('Company already a consulting client')

  const contracts = (therapist.companyContracts ?? {}) as Record<string, unknown>
  contracts[companyId] = {
    serviceType: contractData.serviceType || 'general',
    contractStartDate: contractData.contractStartDate || new Date(),
    addedAt: new Date(),
  }

  const updated = await prisma.therapist.update({
    where: { id: therapistId },
    data: {
      companyPartners: { push: companyId },
      companyContracts: contracts as unknown as [],
    },
    include: { user: true },
  })

  return normalizeTherapist(updated)
}

/**
 * Get company metrics for therapist (aggregated only)
 */
export async function getCompanyMetricsForTherapist(therapistId: string, companyId: string) {
  const therapist = await prisma.therapist.findUnique({ where: { id: therapistId } })

  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.companyPartners.includes(companyId)) {
    throw new Error('Access denied: No consulting relationship with company')
  }

  const { getCompany } = await import('./companies')
  const company = await getCompany(companyId)

  if (!company) throw new Error('Company not found')

  return {
    companyId,
    avgInclusivityScore: 75,
    totalAccommodationsOffered: 5,
    totalJobPostings: company.jobs?.length || 0,
    neurodiversityFriendlyRating: 'good',
    candidateData: undefined,
  }
}

/**
 * Get aggregated metrics across all therapist clients
 */
export async function getTherapistAggregateMetrics(therapistId: string) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) throw new Error('Therapist not found')

  const clientsData = await getTherapistClients(therapistId)
  const individualClients = clientsData.individualClients || []

  const totalClients = individualClients.length
  const clientsWithMatches = individualClients.filter(c => c.activeMatches > 0).length

  const avgMatchRate = totalClients > 0
    ? Math.round((clientsWithMatches / totalClients) * 100)
    : 0

  const platformAvgMatchRate = 65

  return {
    avgMatchRate,
    platformAvgMatchRate,
    topStrengthIdentified: 'Problem Solving',
    mostRequestedAccommodation: 'Flexible Schedule',
    comparison: {
      performanceVsPlatform: avgMatchRate - platformAvgMatchRate,
    },
    individualData: undefined,
  }
}

/**
 * Request therapist for onboarding support (company initiates)
 */
export async function requestTherapistForOnboarding(companyId: string, therapistId: string) {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })

  if (!therapist) throw new Error('Therapist not found')

  const { getCompany } = await import('./companies')
  const company = await getCompany(companyId)

  if (!company) throw new Error('Company not found')

  if (!therapist.services?.includes('company_consulting')) {
    throw new Error('Therapist does not offer company consulting services')
  }

  const pendingRequests = (therapist.pendingRequests ?? []) as Array<Record<string, unknown>>
  const requestId = `req_${Date.now()}`

  pendingRequests.push({
    requestId,
    type: 'onboarding_support',
    companyId,
    companyName: company.name,
    requestedAt: new Date(),
    status: 'pending',
  })

  await prisma.therapist.update({
    where: { id: therapistId },
    data: { pendingRequests: pendingRequests as unknown as [] },
  })

  return {
    success: true,
    requestId,
    status: 'pending',
    message: 'Request sent to therapist',
  }
}

/**
 * Check client alerts for therapist
 */
export async function checkClientAlerts(therapistId: string) {
  const therapist = await prisma.therapist.findUnique({ where: { id: therapistId } })

  if (!therapist) throw new Error('Therapist not found')

  const { getIndividualProfile } = await import('./individuals')

  const urgentAlerts: Array<{ type: string; clientId: string; severity: string; message: string; detectedAt: Date }> = []
  const regularAlerts: Array<{ type: string; clientId: string; severity: string; message: string; detectedAt: Date }> = []

  for (const clientId of therapist.clients) {
    const client = await getIndividualProfile(clientId)
    if (!client) continue

    if ((client.assessment as unknown as Record<string, unknown>)?.flags && (((client.assessment as unknown as Record<string, unknown>).flags) as Record<string, unknown>)?.crisis) {
      urgentAlerts.push({
        type: 'crisis',
        clientId,
        severity: 'high',
        message: 'Client may need immediate support',
        detectedAt: new Date(),
      })
    }

    const lastActive = new Date(client.metadata?.lastLogin || 0)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActive > 14) {
      regularAlerts.push({
        type: 'inactivity',
        clientId,
        severity: 'low',
        message: `Client inactive for ${Math.floor(daysSinceActive)} days`,
        detectedAt: new Date(),
      })
    }
  }

  return {
    urgentAlerts,
    regularAlerts,
    checkedAt: new Date(),
  }
}
