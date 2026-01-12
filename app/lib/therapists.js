/**
 * Therapist Profile and Client Management
 * UC-008: Therapist Registration
 * UC-009: Therapist Support Tools
 *
 * Handles therapist accounts supporting both individuals and companies
 */

import {
  generateUserId,
  isValidEmail,
  sanitizeInput,
  validateRequiredFields,
  deepClone
} from './utils.js'

import {
  saveToFile,
  readFromFile,
  getUserFilePath,
  findUserByEmail,
  updateFile,
  initializeDataStructure
} from './storage.js'

/**
 * Create new therapist profile
 * @param {object} data - Therapist data
 * @param {string} data.email - Email (required, unique)
 * @param {object} data.profile - Profile information
 * @param {string} data.profile.name - Full name (required)
 * @param {Array<object>} data.profile.certifications - Professional certifications (required)
 * @param {Array<string>} data.profile.specializations - Areas of specialization (required)
 * @param {Array<string>} data.profile.languages - Languages spoken
 * @param {string} data.profile.location - Location
 * @param {string} data.profile.bio - Professional bio
 * @returns {object} - Created therapist profile
 */
export async function createTherapist(data) {
  await initializeDataStructure()

  // Validate required fields
  validateRequiredFields(data, ['email'])
  validateRequiredFields(data.profile || {}, ['name', 'certifications', 'specializations'])

  const email = data.email.toLowerCase().trim()

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format')
  }

  // Check for duplicate email
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new Error('Email already exists')
  }

  // Validate certifications (must have license number)
  if (!Array.isArray(data.profile.certifications) || data.profile.certifications.length === 0) {
    throw new Error('At least one professional certification is required')
  }

  for (const cert of data.profile.certifications) {
    if (!cert.licenseNumber) {
      throw new Error('License number required for all certifications')
    }
  }

  // Validate specializations
  if (!Array.isArray(data.profile.specializations) || data.profile.specializations.length === 0) {
    throw new Error('At least one specialization is required')
  }

  // Generate unique therapist ID
  const therapistId = generateUserId('therapist')

  // Create therapist object
  const therapist = {
    therapistId,
    email,
    userType: 'therapist',
    status: 'active',
    verificationStatus: 'pending', // Requires admin verification
    createdAt: new Date(),
    updatedAt: new Date(),

    profile: {
      name: sanitizeInput(data.profile.name),
      certifications: data.profile.certifications.map(cert => ({
        title: sanitizeInput(cert.title),
        licenseNumber: sanitizeInput(cert.licenseNumber),
        issuer: sanitizeInput(cert.issuer || ''),
        expiryDate: cert.expiryDate || null
      })),
      specializations: data.profile.specializations,
      languages: data.profile.languages || ['English'],
      location: data.profile.location || null,
      bio: sanitizeInput(data.profile.bio || ''),
      yearsOfExperience: data.profile.yearsOfExperience || null,
      acceptingNewClients: true,
      consultationFee: data.profile.consultationFee || null
    },

    clients: [],
    companyPartners: [],

    availability: {
      status: 'available',
      maxClients: data.availability?.maxClients || 20,
      currentClients: 0
    },

    metadata: {
      lastLogin: new Date(),
      sessionsCompleted: 0,
      clientSatisfactionScore: null,
      averageResponseTime: null
    }
  }

  // Save to file
  const filePath = getUserFilePath('therapist', therapistId)
  await saveToFile(filePath, therapist)

  return therapist
}

/**
 * Get therapist profile by therapist ID
 * @param {string} therapistId - Therapist ID
 * @returns {object|null} - Therapist profile or null
 */
export async function getTherapist(therapistId) {
  const filePath = getUserFilePath('therapist', therapistId)
  return await readFromFile(filePath)
}

/**
 * Update therapist profile
 * @param {string} therapistId - Therapist ID
 * @param {object} updates - Fields to update
 * @returns {object} - Updated therapist profile
 */
export async function updateTherapist(therapistId, updates) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (currentTherapist) => {
    const updatedTherapist = deepClone(currentTherapist)

    if (updates.profile) {
      updatedTherapist.profile = {
        ...updatedTherapist.profile,
        ...updates.profile
      }

      // Sanitize string fields
      if (updates.profile.name) {
        updatedTherapist.profile.name = sanitizeInput(updates.profile.name)
      }
      if (updates.profile.bio) {
        updatedTherapist.profile.bio = sanitizeInput(updates.profile.bio)
      }
    }

    if (updates.availability) {
      updatedTherapist.availability = {
        ...updatedTherapist.availability,
        ...updates.availability
      }
    }

    updatedTherapist.updatedAt = new Date()

    return updatedTherapist
  })
}

/**
 * Verify therapist (admin action)
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Updated therapist profile
 */
export async function verifyTherapist(therapistId) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    therapist.verificationStatus = 'verified'
    therapist.verifiedAt = new Date()
    therapist.updatedAt = new Date()
    return therapist
  })
}

/**
 * Add client to therapist (individual user)
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Individual user ID
 * @returns {object} - Updated therapist profile
 */
export async function addClientToTherapist(therapistId, clientId) {
  const filePath = getUserFilePath('therapist', therapistId)

  const updatedTherapist = await updateFile(filePath, (therapist) => {
    // Check if already a client
    if (therapist.clients.includes(clientId)) {
      throw new Error('Client already added')
    }

    // Check if accepting new clients
    if (!therapist.profile.acceptingNewClients) {
      throw new Error('Therapist not accepting new clients')
    }

    // Check capacity
    if (therapist.availability.currentClients >= therapist.availability.maxClients) {
      throw new Error('Therapist at maximum capacity')
    }

    therapist.clients.push(clientId)
    therapist.availability.currentClients += 1
    therapist.updatedAt = new Date()

    return therapist
  })

  // Also update individual's profile with therapist ID
  const { addTherapistToIndividual } = await import('./individuals.js')
  await addTherapistToIndividual(clientId, therapistId)

  return updatedTherapist
}

/**
 * Remove client from therapist
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Individual user ID
 * @returns {object} - Updated therapist profile
 */
export async function removeClientFromTherapist(therapistId, clientId) {
  const filePath = getUserFilePath('therapist', therapistId)

  const updatedTherapist = await updateFile(filePath, (therapist) => {
    therapist.clients = therapist.clients.filter(id => id !== clientId)
    therapist.availability.currentClients = Math.max(0, therapist.availability.currentClients - 1)
    therapist.updatedAt = new Date()
    return therapist
  })

  // Also remove therapist from individual's profile
  const { removeTherapistFromIndividual } = await import('./individuals.js')
  await removeTherapistFromIndividual(clientId)

  return updatedTherapist
}

/**
 * Add company partner to therapist
 * @param {string} therapistId - Therapist ID
 * @param {string} companyId - Company ID
 * @returns {object} - Updated therapist profile
 */
export async function addCompanyPartner(therapistId, companyId) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    if (therapist.companyPartners.includes(companyId)) {
      throw new Error('Company already a partner')
    }

    therapist.companyPartners.push(companyId)
    therapist.updatedAt = new Date()

    return therapist
  })
}

/**
 * Remove company partner from therapist
 * @param {string} therapistId - Therapist ID
 * @param {string} companyId - Company ID
 * @returns {object} - Updated therapist profile
 */
export async function removeCompanyPartner(therapistId, companyId) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    therapist.companyPartners = therapist.companyPartners.filter(id => id !== companyId)
    therapist.updatedAt = new Date()
    return therapist
  })
}

/**
 * Get client data for therapist (with privacy considerations)
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Individual user ID
 * @returns {object} - Client profile data
 */
export async function getClientDataForTherapist(therapistId, clientId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Verify therapist-client relationship
  if (!therapist.clients.includes(clientId)) {
    throw new Error('Not authorized to access this client')
  }

  // Get full client profile (therapists have elevated access)
  const { getIndividualProfile } = await import('./individuals.js')
  const client = await getIndividualProfile(clientId)

  if (!client) {
    throw new Error('Client not found')
  }

  // Therapists can see all client data including diagnoses
  return {
    userId: client.userId,
    name: client.profile.name,
    email: client.email,
    diagnoses: client.profile.diagnoses,
    accommodationsNeeded: client.profile.accommodationsNeeded,
    assessment: client.assessment,
    matches: client.matches,
    connections: client.connections,
    profile: client.profile
  }
}

/**
 * Get all clients for a therapist
 * @param {string} therapistId - Therapist ID
 * @returns {Array<object>} - Array of client summaries
 */
export async function getTherapistClients(therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const { getIndividualProfile } = await import('./individuals.js')

  const clients = await Promise.all(
    therapist.clients.map(async (clientId) => {
      const client = await getIndividualProfile(clientId)

      if (!client) {
        return null
      }

      // Return summary for list view
      return {
        userId: client.userId,
        name: client.profile.name,
        diagnoses: client.profile.diagnoses,
        assessmentCompleted: client.assessment.completed,
        activeMatches: client.matches.pending.length + client.matches.accepted.length,
        lastActive: client.metadata.lastLogin
      }
    })
  )

  return clients.filter(client => client !== null)
}

/**
 * Get therapist dashboard data
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Dashboard data with client metrics
 */
export async function getTherapistDashboard(therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const clients = await getTherapistClients(therapistId)

  // Calculate metrics
  const activeClients = clients.filter(c => c.activeMatches > 0)
  const clientsWithCompleteAssessment = clients.filter(c => c.assessmentCompleted)

  return {
    therapistId,
    therapist: therapist.profile,
    verificationStatus: therapist.verificationStatus,
    clients: {
      total: clients.length,
      active: activeClients.length,
      capacity: therapist.availability.maxClients,
      acceptingNew: therapist.profile.acceptingNewClients
    },
    metrics: {
      assessmentCompletionRate: clients.length > 0
        ? Math.round((clientsWithCompleteAssessment.length / clients.length) * 100)
        : 0,
      totalActiveMatches: clients.reduce((sum, c) => sum + c.activeMatches, 0),
      sessionsCompleted: therapist.metadata.sessionsCompleted,
      satisfactionScore: therapist.metadata.clientSatisfactionScore
    },
    recentClients: clients.slice(0, 5) // Most recent 5
  }
}

/**
 * Log therapy session (for metrics)
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Client ID
 * @param {object} sessionData - Session metadata
 * @returns {object} - Updated therapist profile
 */
export async function logTherapySession(therapistId, clientId, sessionData) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    if (!therapist.clients.includes(clientId)) {
      throw new Error('Not authorized to log session for this client')
    }

    therapist.metadata.sessionsCompleted += 1
    therapist.metadata.lastSessionDate = new Date()
    therapist.updatedAt = new Date()

    return therapist
  })
}

/**
 * Get all verified therapists (for matching)
 * @returns {Array<object>} - Array of verified therapist profiles
 */
export async function getVerifiedTherapists() {
  const { readAllFromDirectory } = await import('./storage.js')
  const allTherapists = await readAllFromDirectory('users/therapists')

  return allTherapists.filter(
    therapist =>
      therapist.status === 'active' &&
      therapist.verificationStatus === 'verified' &&
      therapist.profile.acceptingNewClients
  )
}

/**
 * Search therapists by specialization
 * @param {string} specialization - Specialization to search for
 * @returns {Array<object>} - Array of matching therapists
 */
export async function searchTherapistsBySpecialization(specialization) {
  const verifiedTherapists = await getVerifiedTherapists()

  return verifiedTherapists.filter(therapist =>
    therapist.profile.specializations.some(spec =>
      spec.toLowerCase().includes(specialization.toLowerCase())
    )
  )
}
