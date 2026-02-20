/**
 * Consent Management Module
 * UC-005: Match Consent (Accept/Reject)
 * UC-016: Revoke Consent
 *
 * CRITICAL: Privacy-First, GDPR Compliance
 */

import {
  generateConnectionId,
  deepClone
} from './utils.js'

import {
  saveToFile,
  readFromFile,
  getMatchFilePath,
  getConnectionFilePath,
  getUserFilePath,
  updateFile
} from './storage.js'

import { getMatchById } from './matching.js'
import { getIndividualProfile } from './individuals'
import { getCompany, getJobPosting } from './companies.js'

/**
 * Accept a match and create connection with consent
 * @param {string} matchId - Match ID
 * @param {string} userId - User ID (must be candidate)
 * @param {object} options - Optional settings
 * @param {object} options.customPrivacy - Custom privacy settings for this connection
 * @param {string} options.message - Initial message to company
 * @returns {object} - Result with updated match, connection, and notifications
 */
export async function acceptMatch(matchId, userId, options = {}) {
  const match = await getMatchById(matchId)

  if (!match) {
    throw new Error('Match not found')
  }

  // Verify user is the candidate
  if (match.candidateId !== userId) {
    throw new Error('Unauthorized: Only candidate can accept match')
  }

  // Check match status
  if (match.status !== 'pending') {
    throw new Error(`Cannot accept match with status: ${match.status}`)
  }

  // Check expiration
  if (new Date() > new Date(match.expiresAt)) {
    throw new Error('Match has expired')
  }

  // Get candidate profile for privacy settings
  const candidate = await getIndividualProfile(userId)
  const job = await getJobPosting(match.jobId)
  const company = await getCompany(match.companyId)

  // Determine shared data based on privacy settings
  const customPrivacy = options.customPrivacy || {}

  const effectivePrivacy = {
    showRealName: customPrivacy.showRealName !== undefined
      ? customPrivacy.showRealName
      : candidate.privacy.showRealName,
    shareDiagnosis: customPrivacy.shareDiagnosis !== undefined
      ? customPrivacy.shareDiagnosis
      : candidate.privacy.shareDiagnosis,
    shareTherapistContact: customPrivacy.shareTherapistContact !== undefined
      ? customPrivacy.shareTherapistContact
      : candidate.privacy.shareTherapistContact,
    shareAssessmentDetails: customPrivacy.shareAssessmentDetails !== undefined
      ? customPrivacy.shareAssessmentDetails
      : candidate.privacy.shareAssessmentDetails
  }

  // Build sharedData array
  const sharedData = ['name', 'email', 'skills', 'assessment']

  if (effectivePrivacy.shareDiagnosis) {
    sharedData.push('diagnosis')
  }

  if (effectivePrivacy.shareTherapistContact && candidate.profile.therapistId) {
    sharedData.push('therapist')
  }

  sharedData.push('accommodations', 'experience', 'education')

  // Create connection
  const connectionId = generateConnectionId()

  const connection = {
    connectionId,
    matchId,
    candidateId: userId,
    companyId: match.companyId,
    jobId: match.jobId,
    status: 'active',
    consentGivenAt: new Date(),
    revokedAt: null,

    sharedData,
    customPrivacy: effectivePrivacy,

    pipelineStage: 'newMatches',

    metadata: {
      lastInteraction: new Date(),
      messagesSent: options.message ? 1 : 0
    }
  }

  // Save connection
  const connectionFilePath = getConnectionFilePath(connectionId)
  await saveToFile(connectionFilePath, connection)

  // Update match status
  await updateFile(getMatchFilePath(matchId), (match) => {
    match.status = 'accepted'
    match.acceptedAt = new Date()
    match.connectionId = connectionId
    return match
  })

  // Update candidate profile
  await updateFile(getUserFilePath('individual', userId), (profile) => {
    profile.connections.push({
      connectionId,
      companyId: match.companyId,
      jobId: match.jobId,
      status: 'active'
    })
    profile.matches.accepted.push(matchId)
    profile.matches.pending = profile.matches.pending.filter(id => id !== matchId)
    profile.updatedAt = new Date()
    return profile
  })

  // Prepare notifications
  const notifications = [
    {
      recipientId: match.companyId,
      type: 'new_candidate_match',
      matchId,
      connectionId,
      candidateName: effectivePrivacy.showRealName
        ? candidate.profile.name
        : `Anonymous Candidate`,
      message: `New candidate accepted match for ${job.details.title}`,
      createdAt: new Date()
    }
  ]

  // Handle initial message if provided
  let initialMessage = null
  if (options.message) {
    initialMessage = {
      messageId: `msg_${Date.now()}`,
      connectionId,
      senderId: userId,
      recipientId: match.companyId,
      content: options.message,
      sentAt: new Date()
    }
  }

  return {
    match: {
      ...match,
      status: 'accepted',
      acceptedAt: new Date()
    },
    connection,
    notifications,
    initialMessage
  }
}

/**
 * Reject a match (private, company not notified)
 * @param {string} matchId - Match ID
 * @param {string} userId - User ID (must be candidate)
 * @param {object} options - Optional settings
 * @param {string} options.reason - Private rejection reason
 * @returns {object} - Updated match
 */
export async function rejectMatch(matchId, userId, options = {}) {
  const match = await getMatchById(matchId)

  if (!match) {
    throw new Error('Match not found')
  }

  // Verify user is the candidate
  if (match.candidateId !== userId) {
    throw new Error('Unauthorized: Only candidate can reject match')
  }

  // Check match status
  if (match.status !== 'pending') {
    throw new Error(`Cannot reject match with status: ${match.status}`)
  }

  // Update match status
  const updatedMatch = await updateFile(getMatchFilePath(matchId), (match) => {
    match.status = 'rejected'
    match.rejectedAt = new Date()
    if (options.reason) {
      match.rejectionReason = options.reason
      match.reasonPrivate = true // Never shown to company
    }
    return match
  })

  // Update candidate profile
  await updateFile(getUserFilePath('individual', userId), (profile) => {
    profile.matches.rejected.push(matchId)
    profile.matches.pending = profile.matches.pending.filter(id => id !== matchId)
    profile.updatedAt = new Date()
    return profile
  })

  return {
    ...updatedMatch,
    companyNotified: false // Privacy: company never knows about rejection
  }
}

/**
 * Customize privacy settings for a specific connection
 * @param {string} connectionId - Connection ID
 * @param {object} privacyUpdates - Privacy settings to update
 * @returns {object} - Updated connection
 */
export async function customizeMatchPrivacy(connectionId, privacyUpdates) {
  return await updateFile(getConnectionFilePath(connectionId), (connection) => {
    connection.customPrivacy = {
      ...connection.customPrivacy,
      ...privacyUpdates
    }

    // Update sharedData array based on new privacy settings
    if (privacyUpdates.shareDiagnosis === false) {
      connection.sharedData = connection.sharedData.filter(field => field !== 'diagnosis')
    } else if (privacyUpdates.shareDiagnosis === true && !connection.sharedData.includes('diagnosis')) {
      connection.sharedData.push('diagnosis')
    }

    if (privacyUpdates.shareTherapistContact === false) {
      connection.sharedData = connection.sharedData.filter(field => field !== 'therapist')
    } else if (privacyUpdates.shareTherapistContact === true && !connection.sharedData.includes('therapist')) {
      connection.sharedData.push('therapist')
    }

    connection.metadata.lastPrivacyUpdate = new Date()
    connection.updatedAt = new Date()

    return connection
  })
}

/**
 * Revoke consent for a connection
 * @param {string} connectionId - Connection ID
 * @param {string} userId - User ID (must be candidate)
 * @param {object} options - Optional settings
 * @param {string} options.reason - Private revocation reason
 * @returns {object} - Result with updated connection, notifications
 */
export async function revokeConsent(connectionId, userId, options = {}) {
  const connectionFilePath = getConnectionFilePath(connectionId)
  const connection = await readFromFile(connectionFilePath)

  if (!connection) {
    throw new Error('Connection not found')
  }

  // Verify user is the candidate
  if (connection.candidateId !== userId) {
    throw new Error('Unauthorized: Only candidate can revoke consent')
  }

  // Check if already revoked
  if (connection.status === 'revoked') {
    throw new Error('Connection already revoked')
  }

  // Check if can revoke (cannot revoke after hired)
  if (connection.pipelineStage === 'hired') {
    throw new Error('Cannot revoke after hiring is complete')
  }

  // Update connection status
  const updatedConnection = await updateFile(connectionFilePath, (connection) => {
    connection.status = 'revoked'
    connection.revokedAt = new Date()
    if (options.reason) {
      connection.revokedReason = options.reason
    }
    return connection
  })

  // Update candidate profile
  await updateFile(getUserFilePath('individual', userId), (profile) => {
    profile.connections = profile.connections.map(conn =>
      conn.connectionId === connectionId
        ? { ...conn, status: 'revoked' }
        : conn
    )
    profile.updatedAt = new Date()
    return profile
  })

  // Prepare notifications for company
  const notifications = [
    {
      recipientId: connection.companyId,
      type: 'candidate_withdrew',
      connectionId,
      message: 'Candidate withdrew from process'
      // Note: Reason is NOT included (privacy)
    }
  ]

  return {
    ...updatedConnection,
    notifications
  }
}

/**
 * Revoke specific data permission without ending connection
 * @param {string} connectionId - Connection ID
 * @param {Array<string>} dataFields - Data fields to revoke
 * @returns {object} - Updated connection
 */
export async function revokeDataPermission(connectionId, dataFields) {
  return await updateFile(getConnectionFilePath(connectionId), (connection) => {
    // Remove specified fields from sharedData
    connection.sharedData = connection.sharedData.filter(
      field => !dataFields.includes(field)
    )

    // Update privacy settings accordingly
    if (dataFields.includes('diagnosis')) {
      connection.customPrivacy.shareDiagnosis = false
    }

    connection.metadata.lastDataRevocation = new Date()
    connection.updatedAt = new Date()

    return connection
  })
}

/**
 * Revoke all active connections for a user
 * @param {string} userId - User ID
 * @returns {object} - Result with revoked connections
 */
export async function revokeAllConsents(userId) {
  const candidate = await getIndividualProfile(userId)

  if (!candidate) {
    throw new Error('User not found')
  }

  const revokedConnections = []

  for (const conn of candidate.connections) {
    if (conn.status === 'active') {
      try {
        const revoked = await revokeConsent(conn.connectionId, userId)
        revokedConnections.push(revoked)
      } catch (error) {
        console.error(`Failed to revoke connection ${conn.connectionId}:`, error)
      }
    }
  }

  return {
    revokedConnections
  }
}

/**
 * Get privacy preview for a match (before accepting)
 * @param {string} matchId - Match ID
 * @param {string} userId - User ID
 * @returns {object} - Privacy preview showing what will be shared
 */
export async function getMatchPrivacyPreview(matchId, userId) {
  const match = await getMatchById(matchId)

  if (!match || match.candidateId !== userId) {
    throw new Error('Match not found or unauthorized')
  }

  const candidate = await getIndividualProfile(userId)

  // Default sharing based on current privacy settings
  const companyWillSee = ['name', 'email', 'skills', 'assessment', 'accommodations', 'experience']

  const companyWillNotSee = ['Real name', 'Diagnosis', 'Therapist contact']

  if (candidate.privacy.showRealName) {
    companyWillNotSee.splice(companyWillNotSee.indexOf('Real name'), 1)
  }

  if (candidate.privacy.shareDiagnosis) {
    companyWillSee.push('diagnosis')
    companyWillNotSee.splice(companyWillNotSee.indexOf('Diagnosis'), 1)
  }

  if (candidate.privacy.shareTherapistContact && candidate.profile.therapistId) {
    companyWillSee.push('therapist')
    companyWillNotSee.splice(companyWillNotSee.indexOf('Therapist contact'), 1)
  }

  return {
    companyWillSee,
    companyWillNotSee,
    canCustomize: true,
    message: 'You can customize these settings for this specific connection when accepting the match'
  }
}

/**
 * Create connection (used internally)
 * @param {object} data - Connection data
 * @returns {object} - Created connection
 */
export async function createConnection(data) {
  const connectionId = generateConnectionId()

  const connection = {
    connectionId,
    ...data,
    status: 'active',
    consentGivenAt: new Date(),
    createdAt: new Date()
  }

  const connectionFilePath = getConnectionFilePath(connectionId)
  await saveToFile(connectionFilePath, connection)

  return connection
}

/**
 * Get connection by ID
 * @param {string} connectionId - Connection ID
 * @returns {object|null} - Connection or null
 */
export async function getConnection(connectionId) {
  const connectionFilePath = getConnectionFilePath(connectionId)
  return await readFromFile(connectionFilePath)
}

/**
 * Check if connection exists between candidate and company
 * @param {string} candidateId - Candidate user ID
 * @param {string} companyId - Company ID
 * @returns {object|null} - Active connection or null
 */
export async function getActiveConnection(candidateId, companyId) {
  const { getConnectionsForUser } = await import('./storage.js')
  const connections = await getConnectionsForUser(candidateId)

  return connections.find(
    conn => conn.companyId === companyId && conn.status === 'active'
  ) || null
}

/**
 * Update connection pipeline stage
 * @param {string} connectionId - Connection ID
 * @param {string} newStage - New pipeline stage
 * @returns {object} - Updated connection
 */
export async function updateConnectionStage(connectionId, newStage) {
  const validStages = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected']

  if (!validStages.includes(newStage)) {
    throw new Error(`Invalid pipeline stage: ${newStage}`)
  }

  return await updateFile(getConnectionFilePath(connectionId), (connection) => {
    connection.pipelineStage = newStage
    connection.metadata.lastStageUpdate = new Date()
    connection.updatedAt = new Date()
    return connection
  })
}

// ============================================================
// Therapist Consent Functions (UC-009)
// ============================================================

/**
 * Request therapist access (individual initiates)
 * @param {string} individualId - Individual user ID
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Result with consent request status
 */
export async function requestTherapistAccess(individualId, therapistId) {
  const individual = await getIndividualProfile(individualId)

  if (!individual) {
    throw new Error('Individual not found')
  }

  // Check if individual allows therapist access
  if (!individual.privacy.allowTherapistAccess) {
    throw new Error('Therapist access not enabled in privacy settings')
  }

  // Import therapist functions
  const { getTherapist, addClientToTherapist } = await import('./therapists.js')

  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Check if therapist is verified
  if (therapist.status !== 'active' || therapist.verificationStatus !== 'verified') {
    throw new Error('Therapist not verified')
  }

  // Add client to therapist
  await addClientToTherapist(therapistId, individualId)

  return {
    success: true,
    therapistId,
    individualId,
    consentGivenAt: new Date(),
    accessLevel: 'full' // Therapists get full access to client data
  }
}

/**
 * Revoke therapist access (individual revokes)
 * @param {string} individualId - Individual user ID
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Result with revocation status
 */
export async function revokeTherapistAccess(individualId, therapistId) {
  const individual = await getIndividualProfile(individualId)

  if (!individual) {
    throw new Error('Individual not found')
  }

  // Import therapist functions
  const { getTherapist, removeClientFromTherapist } = await import('./therapists.js')

  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Check if individual is actually a client
  if (!therapist.clients.includes(individualId)) {
    throw new Error('Individual is not a client of this therapist')
  }

  // Remove client from therapist (this also updates individual profile)
  await removeClientFromTherapist(therapistId, individualId)

  return {
    success: true,
    therapistId,
    individualId,
    revokedAt: new Date(),
    accessRevoked: true
  }
}

/**
 * Request recommendation consent (therapist asks client)
 * @param {string} therapistId - Therapist ID
 * @param {string} individualId - Individual user ID
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} - Consent request status
 */
export async function requestRecommendationConsent(therapistId, individualId, companyId, jobId) {
  const { getTherapist } = await import('./therapists.js')
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Check if individual is a client
  if (!therapist.clients.includes(individualId)) {
    throw new Error('Individual is not a client of this therapist')
  }

  const individual = await getIndividualProfile(individualId)
  const company = await getCompany(companyId)

  if (!individual || !company) {
    throw new Error('Individual or company not found')
  }

  // Create consent request (pending client approval)
  const consentRequest = {
    requestId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'recommendation',
    therapistId,
    individualId,
    companyId,
    jobId,
    status: 'pending',
    consentRequested: true,
    pendingClientApproval: true,
    requestedAt: new Date()
  }

  // In a real implementation, this would be saved and sent to client
  // For now, we return the request object

  return consentRequest
}

/**
 * Recommend candidate to company (requires prior consent)
 * @param {string} therapistId - Therapist ID
 * @param {string} individualId - Individual user ID
 * @param {string} companyId - Company ID
 * @returns {object} - Recommendation result
 */
export async function recommendCandidateToCompany(therapistId, individualId, companyId) {
  // This always throws unless there's explicit consent
  // In a real implementation, we'd check for approved consent requests
  throw new Error('Client consent required for recommendation')
}

/**
 * Change therapist (individual switches to new therapist)
 * @param {string} individualId - Individual user ID
 * @param {string} newTherapistId - New therapist ID
 * @returns {object} - Result with change status
 */
export async function changeTherapist(individualId, newTherapistId) {
  const individual = await getIndividualProfile(individualId)

  if (!individual) {
    throw new Error('Individual not found')
  }

  const { getTherapist, addClientToTherapist, removeClientFromTherapist } = await import('./therapists.js')

  // Get current therapist from individual profile
  const currentTherapistId = individual.profile.therapistId

  // Remove from current therapist if exists
  if (currentTherapistId) {
    const currentTherapist = await getTherapist(currentTherapistId)
    if (currentTherapist && currentTherapist.clients.includes(individualId)) {
      await removeClientFromTherapist(currentTherapistId, individualId)
    }
  }

  // Add to new therapist
  const newTherapist = await getTherapist(newTherapistId)

  if (!newTherapist) {
    throw new Error('New therapist not found')
  }

  if (newTherapist.status !== 'active') {
    throw new Error('New therapist is not active')
  }

  await addClientToTherapist(newTherapistId, individualId)

  return {
    success: true,
    previousTherapistId: currentTherapistId,
    newTherapistId,
    changedAt: new Date()
  }
}

// Aliases for API compatibility
export { acceptMatch as grantConsent }
export { rejectMatch as rejectConsent }
