/**
 * Consent Management Module — Prisma implementation
 * UC-005: Match Consent (Accept/Reject)
 * UC-016: Revoke Consent
 *
 * Migrated from consent.js → consent.ts (Prisma 7 / PostgreSQL)
 * Maintains same public API for backward compatibility.
 *
 * Decisión de migración (2026-02-20):
 * - storage.js → Prisma Connection/Matching tables
 * - Ya no se escribe en el JSON del Individual (las relaciones son queries)
 * - pipelineStage ahora es campo en Connection (antes embebido en JSON)
 *
 * CRITICAL: Privacy-First, GDPR Compliance
 */

import prisma from './prisma'
import { getMatchById } from './matching'
import { getIndividualProfile } from './individuals'
import { getCompany, getJobPosting } from './companies'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectionResult {
  connectionId: string
  matchId: string | null
  candidateId: string
  companyId: string
  jobId: string | null
  status: string
  consentGivenAt: Date | null
  revokedAt: Date | null
  revokedReason: string | null
  sharedData: string[]
  customPrivacy: Record<string, boolean>
  pipelineStage: string
  metadata: Record<string, unknown>
  updatedAt: Date | null
  createdAt: Date
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_STAGES = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected']

// ─── Core Operations ──────────────────────────────────────────────────────────

/**
 * Accept a match and create connection with consent
 */
export async function acceptMatch(
  matchId: string,
  userId: string,
  options: {
    customPrivacy?: Record<string, boolean>
    message?: string
  } = {}
) {
  const match = await getMatchById(matchId)
  if (!match) throw new Error('Match not found')
  if (match.candidateId !== userId) throw new Error('Unauthorized: Only candidate can accept match')
  if (match.status !== 'pending') throw new Error(`Cannot accept match with status: ${match.status}`)
  if (new Date() > new Date(match.expiresAt)) throw new Error('Match has expired')

  const candidate = await getIndividualProfile(userId)
  const job = await getJobPosting(match.jobId)
  const company = await getCompany(match.companyId)

  if (!candidate || !job || !company) throw new Error('Related entities not found')

  // Determine shared data based on privacy settings
  const customPrivacy = options.customPrivacy || {}
  const effectivePrivacy = {
    showRealName: customPrivacy.showRealName ?? candidate.privacy.showRealName,
    shareDiagnosis: customPrivacy.shareDiagnosis ?? candidate.privacy.shareDiagnosis,
    shareTherapistContact: customPrivacy.shareTherapistContact ?? candidate.privacy.shareTherapistContact,
    shareAssessmentDetails: customPrivacy.shareAssessmentDetails ?? candidate.privacy.shareAssessmentDetails,
  }

  // Build sharedData array
  const sharedData = ['name', 'email', 'skills', 'assessment']
  if (effectivePrivacy.shareDiagnosis) sharedData.push('diagnosis')
  if (effectivePrivacy.shareTherapistContact && candidate.profile.therapistId) sharedData.push('therapist')
  sharedData.push('accommodations', 'experience', 'education')

  // Create connection + update match in transaction
  const connection = await prisma.$transaction(async (tx) => {
    // Create connection
    const conn = await tx.connection.create({
      data: {
        type: 'JOB_MATCH',
        individualId: candidate.individualId,
        companyId: company.companyId,
        matchId: match.matchId,
        jobId: match.jobId,
        status: 'active',
        sharedData,
        customPrivacy: effectivePrivacy,
        consentGivenAt: new Date(),
        pipelineStage: 'newMatches',
        metadata: {
          lastInteraction: new Date().toISOString(),
          messagesSent: options.message ? 1 : 0,
          lastPrivacyUpdate: null,
          lastStageUpdate: null,
          lastDataRevocation: null,
        },
      },
    })

    // Update match status
    await tx.matching.update({
      where: { id: matchId },
      data: {
        status: 'APPROVED',
        acceptedAt: new Date(),
        connectionId: conn.id,
      },
    })

    return conn
  })

  // Prepare notifications
  const jobTitle = (job as Record<string, unknown>).title ??
    ((job as Record<string, unknown>).details as Record<string, unknown>)?.title ?? 'this position'

  const notifications = [
    {
      recipientId: match.companyId,
      type: 'new_candidate_match',
      matchId: match.matchId,
      connectionId: connection.id,
      candidateName: effectivePrivacy.showRealName
        ? candidate.profile.name
        : 'Anonymous Candidate',
      message: `New candidate accepted match for ${jobTitle}`,
      createdAt: new Date(),
    },
  ]

  let initialMessage = null
  if (options.message) {
    initialMessage = {
      messageId: `msg_${Date.now()}`,
      connectionId: connection.id,
      senderId: userId,
      recipientId: match.companyId,
      content: options.message,
      sentAt: new Date(),
    }
  }

  return {
    match: { ...match, status: 'accepted', acceptedAt: new Date() },
    connection: {
      connectionId: connection.id,
      matchId: match.matchId,
      candidateId: userId,
      companyId: match.companyId,
      jobId: match.jobId,
      status: 'active',
      consentGivenAt: new Date(),
      revokedAt: null,
      sharedData,
      customPrivacy: effectivePrivacy,
      pipelineStage: 'newMatches',
      metadata: { lastInteraction: new Date(), messagesSent: options.message ? 1 : 0 },
    },
    notifications,
    initialMessage,
  }
}

/**
 * Reject a match (private, company not notified)
 */
export async function rejectMatch(
  matchId: string,
  userId: string,
  options: { reason?: string } = {}
) {
  const match = await getMatchById(matchId)
  if (!match) throw new Error('Match not found')
  if (match.candidateId !== userId) throw new Error('Unauthorized: Only candidate can reject match')
  if (match.status !== 'pending') throw new Error(`Cannot reject match with status: ${match.status}`)

  await prisma.matching.update({
    where: { id: matchId },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: options.reason || null,
      reasonPrivate: true,
    },
  })

  return {
    ...match,
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionReason: options.reason || null,
    reasonPrivate: true,
    companyNotified: false,
  }
}

/**
 * Customize privacy settings for a specific connection
 */
export async function customizeMatchPrivacy(
  connectionId: string,
  privacyUpdates: Record<string, boolean>
) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!connection) throw new Error('Connection not found')

  const currentPrivacy = (connection.customPrivacy as unknown as Record<string, boolean>) ?? {}
  const newPrivacy = { ...currentPrivacy, ...privacyUpdates }

  let sharedData = [...connection.sharedData]

  if (privacyUpdates.shareDiagnosis === false) {
    sharedData = sharedData.filter(f => f !== 'diagnosis')
  } else if (privacyUpdates.shareDiagnosis === true && !sharedData.includes('diagnosis')) {
    sharedData.push('diagnosis')
  }

  if (privacyUpdates.shareTherapistContact === false) {
    sharedData = sharedData.filter(f => f !== 'therapist')
  } else if (privacyUpdates.shareTherapistContact === true && !sharedData.includes('therapist')) {
    sharedData.push('therapist')
  }

  const currentMetadata = (connection.metadata as unknown as Record<string, unknown>) ?? {}

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      customPrivacy: newPrivacy,
      sharedData,
      metadata: {
        ...currentMetadata,
        lastPrivacyUpdate: new Date().toISOString(),
      },
    },
  })

  return {
    connectionId: updated.id,
    status: updated.status,
    sharedData: updated.sharedData,
    customPrivacy: newPrivacy,
    pipelineStage: updated.pipelineStage,
    metadata: { ...currentMetadata, lastPrivacyUpdate: new Date() },
    updatedAt: updated.updatedAt,
  }
}

/**
 * Revoke consent for a connection
 */
export async function revokeConsent(
  connectionId: string,
  userId: string,
  options: { reason?: string } = {}
) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!connection) throw new Error('Connection not found')
  if (connection.individualId !== userId) throw new Error('Unauthorized: Only candidate can revoke consent')
  if (connection.status === 'revoked') throw new Error('Connection already revoked')
  if (connection.pipelineStage === 'hired') throw new Error('Cannot revoke after hiring is complete')

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: 'revoked',
      revokedAt: new Date(),
      revokedReason: options.reason || null,
    },
  })

  const notifications = [
    {
      recipientId: connection.companyId,
      type: 'candidate_withdrew',
      connectionId,
      message: 'Candidate withdrew from process',
    },
  ]

  return {
    connectionId: updated.id,
    status: updated.status,
    revokedAt: updated.revokedAt,
    notifications,
  }
}

/**
 * Revoke specific data permission without ending connection
 */
export async function revokeDataPermission(connectionId: string, dataFields: string[]) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!connection) throw new Error('Connection not found')

  const currentPrivacy = (connection.customPrivacy as unknown as Record<string, boolean>) ?? {}
  const currentMetadata = (connection.metadata as unknown as Record<string, unknown>) ?? {}

  if (dataFields.includes('diagnosis')) {
    currentPrivacy.shareDiagnosis = false
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      sharedData: connection.sharedData.filter(f => !dataFields.includes(f)),
      customPrivacy: currentPrivacy,
      metadata: {
        ...currentMetadata,
        lastDataRevocation: new Date().toISOString(),
      },
    },
  })

  return {
    connectionId: updated.id,
    sharedData: updated.sharedData,
    customPrivacy: currentPrivacy,
    updatedAt: updated.updatedAt,
  }
}

/**
 * Revoke all active connections for a user
 */
export async function revokeAllConsents(userId: string) {
  const candidate = await getIndividualProfile(userId)
  if (!candidate) throw new Error('User not found')

  const activeConnections = await prisma.connection.findMany({
    where: { individualId: candidate.individualId, status: 'active' },
  })

  const revokedConnections = []

  for (const conn of activeConnections) {
    try {
      const revoked = await revokeConsent(conn.id, userId)
      revokedConnections.push(revoked)
    } catch (error) {
      console.error(`Failed to revoke connection ${conn.id}:`, error)
    }
  }

  return { revokedConnections }
}

/**
 * Get privacy preview for a match (before accepting)
 */
export async function getMatchPrivacyPreview(matchId: string, userId: string) {
  const match = await getMatchById(matchId)
  if (!match || match.candidateId !== userId) throw new Error('Match not found or unauthorized')

  const candidate = await getIndividualProfile(userId)
  if (!candidate) throw new Error('User not found')

  const companyWillSee = ['name', 'email', 'skills', 'assessment', 'accommodations', 'experience']
  const companyWillNotSee = ['Real name', 'Diagnosis', 'Therapist contact']

  if (candidate.privacy.showRealName) {
    const idx = companyWillNotSee.indexOf('Real name')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  if (candidate.privacy.shareDiagnosis) {
    companyWillSee.push('diagnosis')
    const idx = companyWillNotSee.indexOf('Diagnosis')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  if (candidate.privacy.shareTherapistContact && candidate.profile.therapistId) {
    companyWillSee.push('therapist')
    const idx = companyWillNotSee.indexOf('Therapist contact')
    if (idx !== -1) companyWillNotSee.splice(idx, 1)
  }

  return {
    companyWillSee,
    companyWillNotSee,
    canCustomize: true,
    message: 'You can customize these settings for this specific connection when accepting the match',
  }
}

/**
 * Create connection (used internally)
 */
export async function createConnection(data: {
  candidateId?: string
  companyId?: string
  therapistId?: string
  type?: 'JOB_MATCH' | 'THERAPY' | 'CONSULTING'
  sharedData?: string[]
  matchId?: string
  jobId?: string
}) {
  const connection = await prisma.connection.create({
    data: {
      type: data.type || 'JOB_MATCH',
      individualId: data.candidateId,
      companyId: data.companyId,
      therapistId: data.therapistId,
      matchId: data.matchId,
      jobId: data.jobId,
      status: 'active',
      sharedData: data.sharedData || [],
      consentGivenAt: new Date(),
      pipelineStage: 'newMatches',
    },
  })

  return {
    connectionId: connection.id,
    ...data,
    status: 'active',
    consentGivenAt: new Date(),
    createdAt: connection.createdAt,
  }
}

/**
 * Get connection by ID
 */
export async function getConnection(connectionId: string): Promise<ConnectionResult | null> {
  const conn = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!conn) return null

  const metadata = (conn.metadata as unknown as Record<string, unknown>) ?? {}
  const customPrivacy = (conn.customPrivacy as unknown as Record<string, boolean>) ?? {}

  return {
    connectionId: conn.id,
    matchId: conn.matchId,
    candidateId: conn.individualId ?? '',
    companyId: conn.companyId ?? '',
    jobId: conn.jobId,
    status: conn.status,
    consentGivenAt: conn.consentGivenAt,
    revokedAt: conn.revokedAt,
    revokedReason: conn.revokedReason,
    sharedData: conn.sharedData,
    customPrivacy,
    pipelineStage: conn.pipelineStage,
    metadata,
    updatedAt: conn.updatedAt,
    createdAt: conn.createdAt,
  }
}

/**
 * Check if connection exists between candidate and company
 */
export async function getActiveConnection(candidateId: string, companyId: string): Promise<ConnectionResult | null> {
  const conn = await prisma.connection.findFirst({
    where: {
      individualId: candidateId,
      companyId,
      status: 'active',
    },
  })

  if (!conn) return null

  return getConnection(conn.id)
}

/**
 * Update connection pipeline stage
 */
export async function updateConnectionStage(connectionId: string, newStage: string) {
  if (!VALID_STAGES.includes(newStage)) {
    throw new Error(`Invalid pipeline stage: ${newStage}`)
  }

  const conn = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!conn) throw new Error('Connection not found')

  const currentMetadata = (conn.metadata as unknown as Record<string, unknown>) ?? {}

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      pipelineStage: newStage,
      metadata: {
        ...currentMetadata,
        lastStageUpdate: new Date().toISOString(),
      },
    },
  })

  return {
    connectionId: updated.id,
    pipelineStage: updated.pipelineStage,
    updatedAt: updated.updatedAt,
  }
}

// ─── Therapist Consent Functions ──────────────────────────────────────────────

/**
 * Request therapist access (individual initiates)
 */
export async function requestTherapistAccess(individualId: string, therapistId: string) {
  const individual = await getIndividualProfile(individualId)
  if (!individual) throw new Error('Individual not found')
  if (!(individual.privacy as unknown as Record<string, unknown>).allowTherapistAccess) {
    throw new Error('Therapist access not enabled in privacy settings')
  }

  const { getTherapist, addClientToTherapist } = await import('./therapists')

  const therapist = await getTherapist(therapistId)
  if (!therapist) throw new Error('Therapist not found')
  if (therapist.verificationStatus !== 'verified' || therapist.status !== 'active') {
    throw new Error('Therapist not verified')
  }

  await addClientToTherapist(therapistId, individualId)

  return {
    success: true,
    therapistId,
    individualId,
    consentGivenAt: new Date(),
    accessLevel: 'full',
  }
}

/**
 * Revoke therapist access (individual revokes)
 */
export async function revokeTherapistAccess(individualId: string, therapistId: string) {
  const individual = await getIndividualProfile(individualId)
  if (!individual) throw new Error('Individual not found')

  const { getTherapist, removeClientFromTherapist } = await import('./therapists')

  const therapist = await getTherapist(therapistId)
  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.clients.includes(individualId)) {
    throw new Error('Individual is not a client of this therapist')
  }

  await removeClientFromTherapist(therapistId, individualId)

  return {
    success: true,
    therapistId,
    individualId,
    revokedAt: new Date(),
    accessRevoked: true,
  }
}

/**
 * Request recommendation consent (therapist asks client)
 */
export async function requestRecommendationConsent(
  therapistId: string,
  individualId: string,
  companyId: string,
  _jobId: string
) {
  const { getTherapist } = await import('./therapists')
  const therapist = await getTherapist(therapistId)
  if (!therapist) throw new Error('Therapist not found')
  if (!therapist.clients.includes(individualId)) throw new Error('Individual is not a client of this therapist')

  const individual = await getIndividualProfile(individualId)
  const company = await getCompany(companyId)
  if (!individual || !company) throw new Error('Individual or company not found')

  return {
    requestId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'recommendation',
    therapistId,
    individualId,
    companyId,
    status: 'pending',
    consentRequested: true,
    pendingClientApproval: true,
    requestedAt: new Date(),
  }
}

/**
 * Recommend candidate to company (requires prior consent)
 * Always throws — placeholder requiring explicit consent flow
 */
export async function recommendCandidateToCompany(
  _therapistId: string,
  _individualId: string,
  _companyId: string
) {
  throw new Error('Client consent required for recommendation')
}

/**
 * Change therapist (individual switches to new therapist)
 */
export async function changeTherapist(individualId: string, newTherapistId: string) {
  const individual = await getIndividualProfile(individualId)
  if (!individual) throw new Error('Individual not found')

  const { getTherapist, addClientToTherapist, removeClientFromTherapist } = await import('./therapists')

  const currentTherapistId = individual.profile.therapistId

  if (currentTherapistId) {
    const currentTherapist = await getTherapist(currentTherapistId)
    if (currentTherapist && currentTherapist.clients.includes(individualId)) {
      await removeClientFromTherapist(currentTherapistId, individualId)
    }
  }

  const newTherapist = await getTherapist(newTherapistId)
  if (!newTherapist) throw new Error('New therapist not found')
  if (newTherapist.status !== 'active') throw new Error('New therapist is not active')

  await addClientToTherapist(newTherapistId, individualId)

  return {
    success: true,
    previousTherapistId: currentTherapistId,
    newTherapistId,
    changedAt: new Date(),
  }
}

// Aliases for API compatibility
export { acceptMatch as grantConsent }
export { rejectMatch as rejectConsent }
