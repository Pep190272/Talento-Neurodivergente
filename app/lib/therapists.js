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

  if (!data.profile) {
    throw new Error('Profile is required')
  }

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

  // Validate certifications
  if (!Array.isArray(data.profile.certifications) || data.profile.certifications.length === 0) {
    throw new Error('At least one certification is required')
  }

  // Validate each certification
  for (const cert of data.profile.certifications) {
    // Check for expired certifications
    if (cert.expiryDate) {
      const expiryDate = new Date(cert.expiryDate)
      if (expiryDate < new Date()) {
        throw new Error('Certification has expired')
      }
    }
  }

  // Generate unique therapist ID
  const therapistId = generateUserId('therapist')

  // Check if certification is from recognized body
  const recognizedBodies = [
    'State Board of Psychology',
    'American Psychological Association',
    'National Board for Certified Counselors'
  ]

  const hasRecognizedCert = data.profile.certifications.some(cert =>
    recognizedBodies.includes(cert.issuingBody)
  )

  // Validate certification (simulated)
  const certificationValidation = {
    validated: hasRecognizedCert,
    checkedAt: new Date()
  }

  // Check neurodiversity experience
  const neurodiversityExperience = data.profile.neurodiversityExperience || 0
  const badges = []
  const warnings = []

  if (neurodiversityExperience === 0) {
    badges.push('new_to_neurodiversity')
    warnings.push({
      type: 'limited_experience',
      message: 'Limited neurodiversity experience'
    })
  }

  // Create therapist object
  const therapist = {
    therapistId,
    email,
    userType: 'therapist',
    status: 'pending_verification',
    createdAt: new Date(),
    updatedAt: new Date(),

    profile: {
      name: sanitizeInput(data.profile.name || ''),
      certifications: data.profile.certifications.map(cert => ({
        title: sanitizeInput(cert.title || ''),
        licenseNumber: sanitizeInput(cert.licenseNumber || ''),
        issuingBody: sanitizeInput(cert.issuingBody || cert.issuer || ''),
        expiryDate: cert.expiryDate || null
      })),
      specializations: data.profile.specializations || [],
      neurodiversityExperience: neurodiversityExperience,
      experienceYears: data.profile.experienceYears || 0,
      approach: data.profile.approach || null,
      services: data.profile.services || [],
      rates: data.profile.rates || undefined,
      languages: data.profile.languages || ['English'],
      location: data.profile.location || null,
      bio: sanitizeInput(data.profile.bio || ''),
      acceptingNewClients: true
    },

    certificationValidation,
    additionalDocumentationRequired: !hasRecognizedCert,
    badges: badges.length > 0 ? badges : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,

    clients: [],
    companyPartners: [],
    pendingRequests: [],

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
 * @param {object} options - Verification options
 * @param {string} options.verifiedBy - Admin ID who verified
 * @param {string} options.notes - Verification notes
 * @param {string} options.status - 'active' or 'rejected'
 * @param {string} options.reason - Rejection reason (if rejected)
 * @returns {object} - Updated therapist profile
 */
export async function verifyTherapist(therapistId, options = {}) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    const isRejected = options.status === 'rejected'

    if (isRejected) {
      therapist.status = 'rejected'
      therapist.rejectionReason = options.reason || null
      therapist.rejectedAt = new Date()
    } else {
      therapist.status = 'active'
      therapist.verificationStatus = 'verified'
      therapist.verifiedAt = new Date()
      therapist.welcomeEmailSent = true
      therapist.redirectTo = '/dashboard/therapist'
    }

    if (options.verifiedBy) {
      therapist.verifiedBy = options.verifiedBy
    }

    if (options.notes) {
      therapist.verificationNotes = options.notes
    }

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
 * @returns {object} - Object with individualClients, companyClients, and suggestions
 */
export async function getTherapistClients(therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const { getIndividualProfile } = await import('./individuals.js')

  // Get individual clients
  const individualClients = await Promise.all(
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

  // Get company clients
  const { getCompany } = await import('./companies.js')
  const companyClients = await Promise.all(
    therapist.companyPartners.map(async (companyId) => {
      const company = await getCompany(companyId)

      if (!company) {
        return null
      }

      return {
        companyId: company.companyId,
        name: company.name,
        contractStartDate: company.therapistContract?.startDate || null
      }
    })
  )

  // Generate suggestions for therapists with no clients
  const suggestions = []
  const filteredIndividuals = individualClients.filter(c => c !== null)
  const filteredCompanies = companyClients.filter(c => c !== null)

  if (filteredIndividuals.length === 0 && filteredCompanies.length === 0) {
    suggestions.push({
      type: 'get_started',
      message: 'How to get your first clients'
    })
  }

  return {
    individualClients: filteredIndividuals,
    companyClients: filteredCompanies,
    suggestions
  }
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

  const clientsData = await getTherapistClients(therapistId)
  const individualClients = clientsData.individualClients || []

  // Calculate metrics
  const activeClients = individualClients.filter(c => c.activeMatches > 0)
  const clientsWithCompleteAssessment = individualClients.filter(c => c.assessmentCompleted)

  // Get pending requests (companies requesting onboarding support)
  const pendingRequests = therapist.pendingRequests || []

  return {
    therapistId,
    therapist: therapist.profile,
    verificationStatus: therapist.verificationStatus,
    clients: {
      total: individualClients.length,
      active: activeClients.length,
      capacity: therapist.availability.maxClients,
      acceptingNew: therapist.profile.acceptingNewClients
    },
    metrics: {
      assessmentCompletionRate: individualClients.length > 0
        ? Math.round((clientsWithCompleteAssessment.length / individualClients.length) * 100)
        : 0,
      totalActiveMatches: individualClients.reduce((sum, c) => sum + c.activeMatches, 0),
      sessionsCompleted: therapist.metadata.sessionsCompleted,
      satisfactionScore: therapist.metadata.clientSatisfactionScore
    },
    recentClients: individualClients.slice(0, 5),
    pendingRequests,
    resources: {
      gamesLibrary: '/resources/games',
      quizzesLibrary: '/resources/quizzes'
    }
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
