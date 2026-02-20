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
  const { addTherapistToIndividual } = await import('./individuals')
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
  const { removeTherapistFromIndividual } = await import('./individuals')
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
  const { getIndividualProfile } = await import('./individuals')
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

  const { getIndividualProfile } = await import('./individuals')

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
  const { getCompany } = await import('./companies')
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

// ============================================================
// UC-009: Therapist Dashboard with Clients - Additional Functions
// ============================================================

/**
 * Add therapist notes for a client (private)
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Client ID
 * @param {object} noteData - Note data
 * @param {string} noteData.content - Note content
 * @param {boolean} noteData.private - Whether note is private (not visible to client)
 * @returns {object} - Created note
 */
export async function addTherapistNotes(therapistId, clientId, noteData) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Verify client relationship
  if (!therapist.clients.includes(clientId)) {
    throw new Error('Access denied: No consent from client')
  }

  const note = {
    noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    therapistId,
    clientId,
    content: noteData.content,
    private: noteData.private !== false, // Default to private
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // In a real implementation, notes would be stored in a separate collection
  // For MVP, we return the note object
  return note
}

/**
 * Add company as consulting client
 * @param {string} therapistId - Therapist ID
 * @param {string} companyId - Company ID
 * @param {object} contractData - Contract details
 * @returns {object} - Updated therapist profile
 */
export async function addCompanyClient(therapistId, companyId, contractData = {}) {
  const filePath = getUserFilePath('therapist', therapistId)

  return await updateFile(filePath, (therapist) => {
    if (therapist.companyPartners.includes(companyId)) {
      throw new Error('Company already a consulting client')
    }

    therapist.companyPartners.push(companyId)

    // Store contract details if provided
    if (!therapist.companyContracts) {
      therapist.companyContracts = {}
    }

    therapist.companyContracts[companyId] = {
      serviceType: contractData.serviceType || 'general',
      contractStartDate: contractData.contractStartDate || new Date(),
      addedAt: new Date()
    }

    therapist.updatedAt = new Date()
    return therapist
  })
}

/**
 * Get company metrics for therapist (aggregated only)
 * @param {string} therapistId - Therapist ID
 * @param {string} companyId - Company ID
 * @returns {object} - Aggregated company metrics
 */
export async function getCompanyMetricsForTherapist(therapistId, companyId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Verify company partnership
  if (!therapist.companyPartners.includes(companyId)) {
    throw new Error('Access denied: No consulting relationship with company')
  }

  const { getCompany } = await import('./companies')
  const company = await getCompany(companyId)

  if (!company) {
    throw new Error('Company not found')
  }

  // Return aggregated metrics only (no individual candidate data)
  return {
    companyId,
    avgInclusivityScore: company.metrics?.inclusivityScore || 75,
    totalAccommodationsOffered: company.metrics?.accommodationsOffered || 5,
    totalJobPostings: company.jobPostings?.length || 0,
    neurodiversityFriendlyRating: company.metrics?.neurodiversityRating || 'good',
    // No candidateData - privacy protection
    candidateData: undefined
  }
}

/**
 * Get aggregated metrics across all therapist clients
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Aggregated anonymous metrics
 */
export async function getTherapistAggregateMetrics(therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const clientsData = await getTherapistClients(therapistId)
  const individualClients = clientsData.individualClients || []

  // Calculate aggregated metrics
  const totalClients = individualClients.length
  const clientsWithMatches = individualClients.filter(c => c.activeMatches > 0).length

  const avgMatchRate = totalClients > 0
    ? Math.round((clientsWithMatches / totalClients) * 100)
    : 0

  // Platform average (simulated)
  const platformAvgMatchRate = 65

  return {
    avgMatchRate,
    platformAvgMatchRate,
    topStrengthIdentified: 'Problem Solving',
    mostRequestedAccommodation: 'Flexible Schedule',
    comparison: {
      performanceVsPlatform: avgMatchRate - platformAvgMatchRate
    },
    // No individualData - all metrics are aggregated/anonymous
    individualData: undefined
  }
}

/**
 * Request therapist for onboarding support (company initiates)
 * @param {string} companyId - Company ID
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Request status
 */
export async function requestTherapistForOnboarding(companyId, therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const { getCompany } = await import('./companies')
  const company = await getCompany(companyId)

  if (!company) {
    throw new Error('Company not found')
  }

  // Check if therapist offers company consulting
  if (!therapist.profile.services?.includes('company_consulting')) {
    throw new Error('Therapist does not offer company consulting services')
  }

  // Add pending request to therapist
  const filePath = getUserFilePath('therapist', therapistId)

  await updateFile(filePath, (t) => {
    if (!t.pendingRequests) {
      t.pendingRequests = []
    }

    t.pendingRequests.push({
      requestId: `req_${Date.now()}`,
      type: 'onboarding_support',
      companyId,
      companyName: company.name,
      requestedAt: new Date(),
      status: 'pending'
    })

    t.updatedAt = new Date()
    return t
  })

  return {
    success: true,
    requestId: `req_${Date.now()}`,
    status: 'pending',
    message: 'Request sent to therapist'
  }
}

/**
 * Check client alerts for therapist
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Alerts including urgent ones
 */
export async function checkClientAlerts(therapistId) {
  const therapist = await getTherapist(therapistId)

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const { getIndividualProfile } = await import('./individuals')

  const urgentAlerts = []
  const regularAlerts = []

  // Check each client for potential alerts
  for (const clientId of therapist.clients) {
    const client = await getIndividualProfile(clientId)

    if (!client) continue

    // Check for crisis indicators (simulated)
    // In real implementation, this would analyze assessment responses
    if (client.assessment?.flags?.crisis) {
      urgentAlerts.push({
        type: 'crisis',
        clientId,
        severity: 'high',
        message: 'Client may need immediate support',
        detectedAt: new Date()
      })
    }

    // Check for inactivity
    const lastActive = new Date(client.metadata?.lastLogin)
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActive > 14) {
      regularAlerts.push({
        type: 'inactivity',
        clientId,
        severity: 'low',
        message: `Client inactive for ${Math.floor(daysSinceActive)} days`,
        detectedAt: new Date()
      })
    }
  }

  return {
    urgentAlerts,
    regularAlerts,
    checkedAt: new Date()
  }
}
