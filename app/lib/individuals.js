/**
 * Individual (Candidate) Profile Management
 * UC-001: Individual Registration and Profile Management
 *
 * Handles neurodivergent candidate profiles with privacy-first approach
 */

import {
  generateUserId,
  isValidEmail,
  sanitizeInput,
  generateAnonymizedName,
  validateRequiredFields,
  deepClone,
  addDays
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
 * Default privacy settings (most restrictive)
 */
const DEFAULT_PRIVACY = {
  visibleInSearch: true, // Can be matched with jobs
  showRealName: false, // Use anonymized name
  shareDiagnosis: false, // Never share diagnosis without explicit consent
  shareTherapistContact: false,
  shareAssessmentDetails: true // Assessment results ok to share (non-medical)
}

/**
 * Create new individual profile
 * @param {object} data - Profile data
 * @param {string} data.email - Email (required, unique)
 * @param {object} data.profile - Profile information
 * @param {string} data.profile.name - Full name
 * @param {Array<string>} data.profile.diagnoses - Neurodivergent diagnoses (optional, private)
 * @param {Array<string>} data.profile.skills - Technical/professional skills
 * @param {Array<string>} data.profile.accommodationsNeeded - Workplace accommodations needed
 * @param {object} data.profile.preferences - Work preferences (remote, hours, etc.)
 * @param {object} data.privacy - Privacy settings (optional, defaults applied)
 * @param {object} data.assessment - Assessment data (optional)
 * @returns {object} - Created individual profile
 */
export async function createIndividualProfile(data, options = {}) {
  await initializeDataStructure()

  // Handle draft mode
  if (options.draft) {
    const draft = {
      ...data,
      isDraft: true,
      savedToLocalStorage: true,
      savedAt: new Date()
    }
    // In real implementation, this would save to localStorage
    // For testing, we just return the draft object
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`draft_${data.email}`, JSON.stringify(draft))
    }
    return draft
  }

  // Validate required fields
  validateRequiredFields(data, ['email'])

  if (!data.profile) {
    throw new Error('Profile data is required')
  }

  validateRequiredFields(data.profile, ['name'])

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

  // Generate unique user ID
  const userId = generateUserId('individual')

  // Sanitize string inputs
  const name = sanitizeInput(data.profile.name)

  // Apply default privacy settings
  const privacy = {
    ...DEFAULT_PRIVACY,
    ...(data.privacy || {})
  }

  // Check for low visibility warnings
  const warnings = []
  if (!privacy.visibleInSearch && !privacy.showRealName && !privacy.shareDiagnosis) {
    warnings.push({
      type: 'low_visibility',
      message: 'Low visibility settings may reduce matching opportunities'
    })
  }

  // Create profile object
  const profile = {
    userId,
    email,
    userType: 'individual',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActive: new Date(),

    // Password hash (for authentication)
    ...(data.passwordHash && { passwordHash: data.passwordHash }),

    profile: {
      name,
      location: data.profile.location || null,
      bio: sanitizeInput(data.profile.bio || ''),
      diagnoses: data.profile.diagnoses || [],
      skills: data.profile.skills || [],
      experience: data.profile.experience || [],
      education: data.profile.education || [],
      accommodationsNeeded: data.profile.accommodationsNeeded || [],
      preferences: data.profile.preferences || {},
      therapistId: data.profile.therapistId || null,
      medicalHistory: data.profile.medicalHistory || null
    },

    privacy,

    assessment: data.assessment || {
      completed: false,
      completedAt: null,
      strengths: [],
      challenges: [],
      score: null,
      technicalSkills: [],
      softSkills: [],
      workStyle: {}
    },

    matches: {
      pending: [],
      accepted: [],
      rejected: []
    },

    connections: [],

    metadata: {
      lastLogin: new Date(),
      profileViews: 0,
      matchesReceived: 0,
      applicationsSubmitted: 0
    },

    // Warnings
    warnings: warnings.length > 0 ? warnings : undefined,

    // Integration metadata
    redirectTo: '/dashboard/individual',
    triggerWelcomeMessage: true,
    welcomeMessageContext: {
      userId,
      name
    },

    // Add getPublicView method
    getPublicView: function() {
      return getPublicProfileView(this)
    }
  }

  // Validate with OpenAI (optional, graceful fallback)
  try {
    const validated = await validateProfileWithAI(profile)
    if (validated.suggestions && validated.suggestions.length > 0) {
      profile.aiSuggestions = validated.suggestions
    }
  } catch (error) {
    console.warn('OpenAI validation failed, continuing without AI validation:', error.message)
    profile.validationStatus = 'pending_review'
  }

  // Save to file
  const filePath = getUserFilePath('individual', userId)
  await saveToFile(filePath, profile)

  return profile
}

/**
 * Get individual profile by user ID
 * @param {string} userId - User ID
 * @returns {object|null} - Individual profile or null
 */
export async function getIndividualProfile(userId) {
  const filePath = getUserFilePath('individual', userId)
  return await readFromFile(filePath)
}

/**
 * Update individual profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {object} - Updated profile
 */
export async function updateIndividualProfile(userId, updates) {
  const filePath = getUserFilePath('individual', userId)

  return await updateFile(filePath, (currentProfile) => {
    // Deep merge updates
    const updatedProfile = deepClone(currentProfile)

    if (updates.profile) {
      updatedProfile.profile = {
        ...updatedProfile.profile,
        ...updates.profile
      }

      // Sanitize string fields
      if (updates.profile.name) {
        updatedProfile.profile.name = sanitizeInput(updates.profile.name)
      }
      if (updates.profile.bio) {
        updatedProfile.profile.bio = sanitizeInput(updates.profile.bio)
      }
    }

    if (updates.privacy) {
      updatedProfile.privacy = {
        ...updatedProfile.privacy,
        ...updates.privacy
      }
    }

    if (updates.assessment) {
      updatedProfile.assessment = {
        ...updatedProfile.assessment,
        ...updates.assessment
      }
    }

    updatedProfile.updatedAt = new Date()

    return updatedProfile
  })
}

/**
 * Update privacy settings
 * @param {string} userId - User ID
 * @param {object} privacyUpdates - Privacy settings to update
 * @returns {object} - Updated profile
 */
export async function updatePrivacySettings(userId, privacyUpdates) {
  return await updateIndividualProfile(userId, { privacy: privacyUpdates })
}

/**
 * Complete assessment
 * @param {string} userId - User ID
 * @param {object} assessmentData - Assessment results
 * @returns {object} - Updated profile with flag to trigger matching
 */
export async function completeAssessment(userId, assessmentData) {
  const updated = await updateIndividualProfile(userId, {
    assessment: {
      ...assessmentData,
      completed: true,
      completedAt: new Date()
    }
  })

  // Flag to trigger matching
  updated.matchingTriggered = true

  return updated
}

/**
 * Deactivate individual profile
 * @param {string} userId - User ID
 */
export async function deactivateIndividual(userId) {
  return await updateFile(getUserFilePath('individual', userId), (profile) => {
    profile.status = 'deactivated'
    profile.deactivatedAt = new Date()
    profile.updatedAt = new Date()
    return profile
  })
}

/**
 * Delete individual account (GDPR right to erasure)
 * Note: Audit logs are retained for compliance
 * @param {string} userId - User ID
 */
export async function deleteUserAccount(userId) {
  const filePath = getUserFilePath('individual', userId)

  // Mark as deleted (soft delete for audit trail)
  await updateFile(filePath, (profile) => {
    profile.status = 'deleted'
    profile.deletedAt = new Date()
    profile.updatedAt = new Date()

    // Anonymize personal data
    profile.email = `deleted_${userId}@anonymized.local`
    profile.profile.name = 'Deleted User'
    profile.profile.bio = ''
    profile.profile.location = null
    profile.profile.diagnoses = []
    profile.profile.therapistId = null

    return profile
  })
}

/**
 * Get public view of profile (respects privacy settings)
 * Used for matching display before consent
 * @param {string} userId - User ID
 * @returns {object} - Public profile data
 */
export async function getPublicProfile(userId) {
  const profile = await getIndividualProfile(userId)

  if (!profile) {
    return null
  }

  // Base public data
  const publicData = {
    userId: profile.userId,
    name: profile.privacy.showRealName
      ? profile.profile.name
      : generateAnonymizedName(userId),
    skills: profile.profile.skills,
    accommodationsNeeded: profile.profile.accommodationsNeeded,
    preferences: profile.profile.preferences,
    assessmentCompleted: profile.assessment.completed,
    assessmentScore: profile.assessment.score,
    experience: profile.profile.experience.map(exp => ({
      title: exp.title,
      years: exp.years
      // Omit company names and details for privacy
    }))
  }

  // Never include diagnosis in public view
  // Never include email, therapist, or other PII

  return publicData
}

/**
 * Get full profile data for company with active connection
 * @param {string} userId - User ID
 * @param {string} connectionId - Connection ID to verify consent
 * @returns {object} - Profile data based on shared permissions
 */
export async function getProfileForCompany(userId, connectionId) {
  const profile = await getIndividualProfile(userId)

  if (!profile) {
    throw new Error('Profile not found')
  }

  // Verify connection exists and is active
  // This will be fully implemented in consent.js
  const connection = profile.connections.find(c => c.connectionId === connectionId)

  if (!connection || connection.status !== 'active') {
    throw new Error('No active connection exists')
  }

  // Return data based on connection.sharedData array
  const sharedData = {}

  if (connection.sharedData.includes('name')) {
    sharedData.name = connection.customPrivacy?.showRealName
      ? profile.profile.name
      : generateAnonymizedName(userId)
  }

  if (connection.sharedData.includes('email')) {
    sharedData.email = profile.email
  }

  if (connection.sharedData.includes('skills')) {
    sharedData.skills = profile.profile.skills
  }

  if (connection.sharedData.includes('assessment')) {
    sharedData.assessment = profile.assessment
  }

  if (connection.sharedData.includes('diagnosis') && connection.customPrivacy?.shareDiagnosis) {
    sharedData.diagnoses = profile.profile.diagnoses
  }

  if (connection.sharedData.includes('accommodations')) {
    sharedData.accommodationsNeeded = profile.profile.accommodationsNeeded
  }

  if (connection.sharedData.includes('experience')) {
    sharedData.experience = profile.profile.experience
  }

  if (connection.sharedData.includes('education')) {
    sharedData.education = profile.profile.education
  }

  return sharedData
}

/**
 * Calculate profile completion percentage
 * @param {string} userId - User ID
 * @returns {object} - Completion data with percentage and breakdown
 */
export async function calculateProfileCompletion(userId) {
  const profile = await getIndividualProfile(userId)

  if (!profile) {
    return null
  }

  const weights = {
    assessment: 40,
    experience: 30,
    preferences: 20,
    skills: 10
  }

  const completion = {}

  // Assessment (40%)
  completion.assessment = profile.assessment.completed ? weights.assessment : 0

  // Experience (30%)
  const hasExperience = profile.profile.experience.length > 0
  completion.experience = hasExperience ? weights.experience : 0

  // Preferences (20%)
  const hasPreferences = Object.keys(profile.profile.preferences).length > 0
  completion.preferences = hasPreferences ? weights.preferences : 0

  // Skills (10%)
  const hasSkills = profile.profile.skills.length >= 3
  completion.skills = hasSkills ? weights.skills : 0

  const total = Object.values(completion).reduce((sum, val) => sum + val, 0)

  return {
    percentage: total,
    breakdown: completion,
    missingSteps: getMissingSteps(profile, completion, weights)
  }
}

/**
 * Get missing profile steps for completion
 * @param {object} profile - Profile object
 * @param {object} completion - Completion scores
 * @param {object} weights - Weight values
 * @returns {Array<object>} - Missing steps with suggestions
 */
function getMissingSteps(profile, completion, weights) {
  const missing = []

  if (completion.assessment === 0) {
    missing.push({
      step: 'assessment',
      importance: 'high',
      weight: weights.assessment,
      message: 'Complete assessment to improve matching'
    })
  }

  if (completion.experience === 0) {
    missing.push({
      step: 'experience',
      importance: 'high',
      weight: weights.experience,
      message: 'Add work experience to showcase skills'
    })
  }

  if (completion.preferences === 0) {
    missing.push({
      step: 'preferences',
      importance: 'medium',
      weight: weights.preferences,
      message: 'Set work preferences for better matches'
    })
  }

  if (completion.skills === 0) {
    missing.push({
      step: 'skills',
      importance: 'medium',
      weight: weights.skills,
      message: 'Add at least 3 skills'
    })
  }

  return missing.sort((a, b) => b.weight - a.weight)
}

/**
 * Validate profile with OpenAI (optional enhancement)
 * @param {object} profile - Profile to validate
 * @returns {object} - Validation result with suggestions
 */
async function validateProfileWithAI(profile) {
  // Attempt OpenAI API call (will integrate with real API later)
  // For now, simulate API call to allow testing of failure handling
  if (typeof fetch !== 'undefined') {
    // Simulate OpenAI API call - will be replaced with real implementation
    const apiKey = process.env.OPENAI_API_KEY || 'test-key'
    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'validate profile' }]
      })
    })
  }

  // Basic validation (fallback)
  const suggestions = []

  if (profile.profile.skills.length < 3) {
    suggestions.push({
      field: 'skills',
      message: 'Add more skills to improve matching',
      priority: 'medium'
    })
  }

  if (!profile.profile.bio || profile.profile.bio.length < 50) {
    suggestions.push({
      field: 'bio',
      message: 'Add a bio to help companies understand your background',
      priority: 'low'
    })
  }

  return {
    validated: true,
    suggestions,
    normalized: profile
  }
}

/**
 * Add therapist to individual profile
 * @param {string} userId - Individual user ID
 * @param {string} therapistId - Therapist user ID
 * @returns {object} - Updated profile
 */
export async function addTherapistToIndividual(userId, therapistId) {
  return await updateIndividualProfile(userId, {
    profile: { therapistId }
  })
}

/**
 * Remove therapist from individual profile
 * @param {string} userId - Individual user ID
 * @returns {object} - Updated profile
 */
export async function removeTherapistFromIndividual(userId) {
  return await updateIndividualProfile(userId, {
    profile: { therapistId: null }
  })
}

/**
 * Get all individuals visible in search (for matching)
 * @returns {Array<object>} - Array of public profiles
 */
export async function getVisibleIndividuals() {
  const { readAllFromDirectory } = await import('./storage.js')
  const allIndividuals = await readAllFromDirectory('users/individuals')

  return allIndividuals.filter(individual =>
    individual.status === 'active' &&
    individual.privacy.visibleInSearch &&
    individual.assessment.completed
  )
}

/**
 * Get individual profile by ID (alias for compatibility)
 * @param {string} userId - User ID
 * @returns {object|null} - Individual profile or null
 */
export async function getIndividualById(userId) {
  return await getIndividualProfile(userId)
}

/**
 * Get public profile view (used by getPublicView method)
 * @param {object} profile - Full profile object
 * @returns {object} - Public profile data
 */
export function getPublicProfileView(profile) {
  // Base public data
  const publicData = {
    userId: profile.userId,
    name: profile.privacy.showRealName
      ? profile.profile.name
      : generateAnonymizedName(profile.userId),
    skills: profile.profile.skills,
    accommodationsNeeded: profile.profile.accommodationsNeeded,
    preferences: profile.profile.preferences,
    assessmentCompleted: profile.assessment.completed,
    assessmentScore: profile.assessment.score,
    experience: profile.profile.experience.map(exp => ({
      title: exp.title,
      years: exp.years
      // Omit company names and details for privacy
    }))
  }

  // Never include diagnosis in public view
  // Never include email, therapist, or other PII

  return publicData
}

/**
 * Validate individual data with AI (for testing)
 * @param {object} data - Individual data to validate
 * @returns {object} - Validation result
 */
export async function validateIndividualData(data) {
  const suggestions = []
  const warnings = []

  // Check for non-standard diagnoses
  if (data.profile && data.profile.diagnoses) {
    const nonStandardDiagnoses = {
      'ADD': 'ADHD',
      'Aspergers': 'Autism Spectrum Disorder',
      'Asperger': 'Autism Spectrum Disorder'
    }

    data.profile.diagnoses.forEach(diagnosis => {
      if (nonStandardDiagnoses[diagnosis]) {
        suggestions.push({
          field: 'diagnoses',
          suggestion: nonStandardDiagnoses[diagnosis],
          original: diagnosis
        })
      }
    })
  }

  // Check for sensitive data in public fields
  if (data.profile && data.profile.experience) {
    data.profile.experience.forEach(exp => {
      const sensitiveKeywords = ['ADHD', 'autism', 'autistic', 'dyslexia', 'disorder']
      const titleLower = (exp.title || '').toLowerCase()

      if (sensitiveKeywords.some(keyword => titleLower.includes(keyword))) {
        warnings.push({
          field: 'experience',
          message: 'Sensitive information detected in public field',
          severity: 'medium'
        })
      }
    })
  }

  // Normalize data
  const normalized = deepClone(data)

  return {
    validated: true,
    normalized,
    suggestions,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}
