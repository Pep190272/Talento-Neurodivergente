/**
 * AI-Powered Matching Algorithm
 * UC-004: Matching between Candidates and Job Postings
 *
 * CORE BUSINESS LOGIC - Heart of the Marketplace
 *
 * Matching Weights:
 * - Skills: 40%
 * - Accommodations: 30%
 * - Work Preferences: 20%
 * - Location: 10%
 */

import {
  generateMatchId,
  calculateArrayMatch,
  hasCommonElements,
  generateAnonymizedName,
  addDays
} from './utils.js'

import {
  saveToFile,
  readFromFile,
  getMatchFilePath,
  getMatchesForJob,
  getMatchesForCandidate,
  updateFile,
  findAll
} from './storage.js'

import { getVisibleIndividuals } from './individuals.js'
import { getJobPosting, getAllOpenJobs } from './companies.js'

// Matching configuration
const MATCH_THRESHOLD = 60 // Minimum score to create match
const MATCH_EXPIRATION_DAYS = 7

const WEIGHTS = {
  skills: 40,
  accommodations: 30,
  preferences: 20,
  location: 10
}

/**
 * Calculate match score between candidate and job
 * @param {string} candidateId - Candidate user ID
 * @param {string} jobId - Job ID
 * @returns {object} - Match object with score and breakdown
 */
export async function calculateMatch(candidateId, jobId) {
  const { getIndividualProfile } = await import('./individuals.js')
  const candidate = await getIndividualProfile(candidateId)
  const job = await getJobPosting(jobId)

  if (!candidate || !job) {
    throw new Error('Candidate or job not found')
  }

  // Privacy check: candidate must be visible in search
  if (!candidate.privacy.visibleInSearch) {
    return null
  }

  // Assessment requirement: candidate must have completed assessment
  if (!candidate.assessment.completed) {
    return null
  }

  // Calculate score breakdown
  const scoreBreakdown = {}

  // 1. Skills Match (40%)
  const candidateSkills = [
    ...candidate.profile.skills,
    ...candidate.assessment.technicalSkills
  ]
  const jobSkills = job.details.skills

  scoreBreakdown.skills = calculateSkillsMatch(candidateSkills, jobSkills)

  // 2. Accommodations Match (30%)
  const candidateNeeds = candidate.profile.accommodationsNeeded
  const jobOffers = job.details.accommodations

  scoreBreakdown.accommodations = calculateAccommodationsMatch(candidateNeeds, jobOffers)

  // 3. Preferences Match (20%)
  scoreBreakdown.preferences = calculatePreferencesMatch(
    candidate.profile.preferences,
    job.details
  )

  // 4. Location Match (10%)
  scoreBreakdown.location = calculateLocationMatch(
    candidate.profile.location,
    candidate.profile.preferences?.workMode,
    job.details.location,
    job.details.workMode
  )

  // Calculate total score (weighted average)
  const totalScore = Math.round(
    (scoreBreakdown.skills * WEIGHTS.skills +
      scoreBreakdown.accommodations * WEIGHTS.accommodations +
      scoreBreakdown.preferences * WEIGHTS.preferences +
      scoreBreakdown.location * WEIGHTS.location) /
      100
  )

  // Generate AI justification (simplified - can be enhanced with OpenAI)
  const aiJustification = generateMatchJustification(
    candidate,
    job,
    scoreBreakdown,
    totalScore
  )

  // Create match object
  const matchId = generateMatchId()

  const match = {
    matchId,
    candidateId,
    jobId,
    companyId: job.companyId,
    score: totalScore,
    scoreBreakdown,
    aiJustification,
    status: 'pending', // pending/accepted/rejected/expired
    createdAt: new Date(),
    expiresAt: addDays(MATCH_EXPIRATION_DAYS),
    candidateNotified: false,
    companyCanView: false,

    // Anonymized candidate data (before consent)
    candidateData: {
      userId: candidateId,
      name: candidate.privacy.showRealName
        ? candidate.profile.name
        : generateAnonymizedName(candidateId),
      skills: candidate.profile.skills,
      accommodationsNeeded: candidate.profile.accommodationsNeeded,
      assessmentScore: candidate.assessment.score,
      experience: candidate.profile.experience.map(exp => ({
        title: exp.title,
        years: exp.years
      }))
      // Never include: email, diagnosis, real name (if privacy setting)
    },

    matchingMethod: 'keyword', // Can be 'semantic' when using OpenAI
    needsRecalculation: false
  }

  return match
}

/**
 * Calculate skills match score using semantic matching (with fallback)
 * @param {Array<string>} candidateSkills - Candidate skills
 * @param {Array<string>} jobSkills - Required job skills
 * @returns {number} - Match score (0-100)
 */
function calculateSkillsMatch(candidateSkills, jobSkills) {
  if (!candidateSkills || !jobSkills || jobSkills.length === 0) {
    return 0
  }

  // Keyword-based matching (fallback)
  const exactMatches = jobSkills.filter(jobSkill =>
    candidateSkills.some(candidateSkill =>
      candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())
    )
  )

  const matchPercentage = (exactMatches.length / jobSkills.length) * 100

  // Bonus for exceeding requirements
  if (candidateSkills.length > jobSkills.length) {
    return Math.min(100, matchPercentage + 10)
  }

  return Math.round(matchPercentage)
}

/**
 * Calculate accommodations match score
 * @param {Array<string>} needs - Candidate accommodation needs
 * @param {Array<string>} offers - Job offered accommodations
 * @returns {number} - Match score (0-100)
 */
function calculateAccommodationsMatch(needs, offers) {
  if (!needs || needs.length === 0) {
    return 100 // No specific needs = perfect match
  }

  if (!offers || offers.length === 0) {
    return 0 // No accommodations offered
  }

  const metNeeds = needs.filter(need =>
    offers.some(offer =>
      offer.toLowerCase().includes(need.toLowerCase()) ||
      need.toLowerCase().includes(offer.toLowerCase())
    )
  )

  return Math.round((metNeeds.length / needs.length) * 100)
}

/**
 * Calculate preferences match score
 * @param {object} preferences - Candidate preferences
 * @param {object} jobDetails - Job details
 * @returns {number} - Match score (0-100)
 */
function calculatePreferencesMatch(preferences, jobDetails) {
  if (!preferences || Object.keys(preferences).length === 0) {
    return 50 // Neutral if no preferences specified
  }

  let matchPoints = 0
  let totalPoints = 0

  // Work mode preference
  if (preferences.workMode) {
    totalPoints += 40
    if (preferences.workMode === jobDetails.workMode) {
      matchPoints += 40
    } else if (preferences.workMode === 'hybrid' && jobDetails.workMode !== 'on-site') {
      matchPoints += 20
    }
  }

  // Flexible hours
  if (preferences.flexibleHours !== undefined) {
    totalPoints += 30
    if (preferences.flexibleHours === true && jobDetails.accommodations?.includes('Flexible hours')) {
      matchPoints += 30
    }
  }

  // Team size preference
  if (preferences.teamSize) {
    totalPoints += 30
    if (preferences.teamSize === jobDetails.teamSize) {
      matchPoints += 30
    } else if (
      (preferences.teamSize === 'small' && jobDetails.teamSize !== 'large') ||
      (preferences.teamSize === 'large' && jobDetails.teamSize !== 'small')
    ) {
      matchPoints += 15
    }
  }

  return totalPoints > 0 ? Math.round((matchPoints / totalPoints) * 100) : 50
}

/**
 * Calculate location match score
 * @param {string} candidateLocation - Candidate location
 * @param {string} candidateWorkMode - Candidate preferred work mode
 * @param {string} jobLocation - Job location
 * @param {string} jobWorkMode - Job work mode
 * @returns {number} - Match score (0-100)
 */
function calculateLocationMatch(candidateLocation, candidateWorkMode, jobLocation, jobWorkMode) {
  // If job is fully remote, location doesn't matter
  if (jobWorkMode === 'remote') {
    return 100
  }

  // If candidate wants remote and job is on-site, poor match
  if (candidateWorkMode === 'remote' && jobWorkMode === 'on-site') {
    return 0
  }

  // If both are in same location
  if (candidateLocation && jobLocation) {
    const candidateLower = candidateLocation.toLowerCase()
    const jobLower = jobLocation.toLowerCase()

    if (candidateLower === jobLower) {
      return 100
    }

    // Check if same city (basic check)
    const candidateCity = candidateLower.split(',')[0].trim()
    const jobCity = jobLower.split(',')[0].trim()

    if (candidateCity === jobCity) {
      return 100
    }

    // Different locations but hybrid work mode
    if (jobWorkMode === 'hybrid') {
      return 50
    }

    return 20 // Different locations, on-site required
  }

  return 50 // Neutral if location not specified
}

/**
 * Generate match justification text
 * @param {object} candidate - Candidate profile
 * @param {object} job - Job posting
 * @param {object} scoreBreakdown - Score breakdown
 * @param {number} totalScore - Total match score
 * @returns {string} - Justification text
 */
function generateMatchJustification(candidate, job, scoreBreakdown, totalScore) {
  const reasons = []

  if (scoreBreakdown.skills >= 80) {
    reasons.push(
      `Strong skills match (${scoreBreakdown.skills}%) with ${job.details.title} requirements`
    )
  } else if (scoreBreakdown.skills >= 60) {
    reasons.push(`Good skills alignment with core requirements`)
  }

  if (scoreBreakdown.accommodations >= 80) {
    reasons.push(`All accommodation needs met by this position`)
  } else if (scoreBreakdown.accommodations >= 60) {
    reasons.push(`Most accommodation needs are supported`)
  }

  if (scoreBreakdown.preferences >= 80) {
    reasons.push(`Work preferences align well with job structure`)
  }

  if (scoreBreakdown.location >= 80) {
    reasons.push(`Location and work mode are compatible`)
  }

  if (reasons.length === 0) {
    return `This is a ${totalScore >= 70 ? 'good' : 'moderate'} match based on overall compatibility.`
  }

  return reasons.join('. ') + '.'
}

/**
 * Run matching for a specific job (all eligible candidates)
 * @param {string} jobId - Job ID
 * @returns {Array<object>} - Array of created matches (score >= threshold)
 */
export async function runMatchingForJob(jobId) {
  const job = await getJobPosting(jobId)

  if (!job || job.status !== 'open') {
    return []
  }

  const candidates = await getVisibleIndividuals()

  const matches = []

  for (const candidate of candidates) {
    try {
      const match = await calculateMatch(candidate.userId, jobId)

      if (match && match.score >= MATCH_THRESHOLD) {
        // Save match to file
        const matchFilePath = getMatchFilePath(match.matchId)
        await saveToFile(matchFilePath, match)

        matches.push(match)
      }
    } catch (error) {
      console.error(`Error matching candidate ${candidate.userId} with job ${jobId}:`, error)
    }
  }

  // Check for warnings
  if (matches.length === 0) {
    matches.warnings = [
      {
        type: 'no_eligible_candidates',
        suggestion: 'Adjust job requirements or accommodations to attract more candidates'
      }
    ]
  }

  return matches
}

/**
 * Run matching for a specific candidate (all open jobs)
 * @param {string} candidateId - Candidate user ID
 * @returns {Array<object>} - Array of created matches (score >= threshold)
 */
export async function runMatchingForCandidate(candidateId) {
  const { getIndividualProfile } = await import('./individuals.js')
  const candidate = await getIndividualProfile(candidateId)

  if (!candidate || !candidate.assessment.completed) {
    return []
  }

  const jobs = await getAllOpenJobs()

  const matches = []

  for (const job of jobs) {
    try {
      const match = await calculateMatch(candidateId, job.jobId)

      if (match && match.score >= MATCH_THRESHOLD) {
        // Save match to file
        const matchFilePath = getMatchFilePath(match.matchId)
        await saveToFile(matchFilePath, match)

        matches.push(match)
      }
    } catch (error) {
      console.error(`Error matching candidate ${candidateId} with job ${job.jobId}:`, error)
    }
  }

  return matches
}

/**
 * Get match by ID
 * @param {string} matchId - Match ID
 * @returns {object|null} - Match object or null
 */
export async function getMatchById(matchId) {
  const matchFilePath = getMatchFilePath(matchId)
  return await readFromFile(matchFilePath)
}

/**
 * Get matches by job ID
 * @param {string} jobId - Job ID
 * @returns {Array<object>} - Array of matches
 */
export async function getMatchesByJobId(jobId) {
  return await getMatchesForJob(jobId)
}

/**
 * Get matches by candidate ID
 * @param {string} candidateId - Candidate user ID
 * @returns {Array<object>} - Array of matches
 */
export async function getMatchesByCandidateId(candidateId) {
  return await getMatchesForCandidate(candidateId)
}

/**
 * Recalculate matches for a candidate (after profile update)
 * @param {string} candidateId - Candidate user ID
 * @returns {Array<object>} - Array of recalculated matches
 */
export async function recalculateMatches(candidateId) {
  // Get existing matches
  const existingMatches = await getMatchesForCandidate(candidateId)

  const recalculated = []

  for (const existingMatch of existingMatches) {
    if (existingMatch.status === 'pending') {
      // Recalculate score
      const newMatch = await calculateMatch(candidateId, existingMatch.jobId)

      if (newMatch && newMatch.score >= MATCH_THRESHOLD) {
        // Update match
        const matchFilePath = getMatchFilePath(existingMatch.matchId)
        await updateFile(matchFilePath, (match) => {
          match.score = newMatch.score
          match.scoreBreakdown = newMatch.scoreBreakdown
          match.aiJustification = newMatch.aiJustification
          match.updatedAt = new Date()
          return match
        })

        recalculated.push(newMatch)
      } else {
        // Score below threshold, expire match
        await expireMatch(existingMatch.matchId)
      }
    }
  }

  return recalculated
}

/**
 * Expire a match
 * @param {string} matchId - Match ID
 */
async function expireMatch(matchId) {
  const matchFilePath = getMatchFilePath(matchId)
  await updateFile(matchFilePath, (match) => {
    match.status = 'expired'
    match.expiredAt = new Date()
    return match
  })
}

/**
 * Check and expire matches that are past expiration date
 * @param {string} matchId - Match ID
 * @returns {object} - Updated match
 */
export async function checkMatchExpiration(matchId) {
  const match = await getMatchById(matchId)

  if (!match) {
    throw new Error('Match not found')
  }

  if (match.status === 'pending' && new Date() > new Date(match.expiresAt)) {
    await expireMatch(matchId)
    match.status = 'expired'
  }

  return match
}

/**
 * Process all expired matches (batch job)
 */
export async function processExpiredMatches() {
  const allMatches = await findAll('matches', match => match.status === 'pending')

  for (const match of allMatches) {
    if (new Date() > new Date(match.expiresAt)) {
      await expireMatch(match.matchId)
    }
  }
}

/**
 * Invalidate all matches for a job (when job is closed)
 * @param {string} jobId - Job ID
 */
export async function invalidateMatchesForJob(jobId) {
  const matches = await getMatchesForJob(jobId)

  for (const match of matches) {
    if (match.status === 'pending') {
      await expireMatch(match.matchId)
    }
  }
}

/**
 * Invalidate all matches for a candidate (when account deactivated)
 * @param {string} candidateId - Candidate user ID
 */
export async function invalidateMatchesForCandidate(candidateId) {
  const matches = await getMatchesForCandidate(candidateId)

  for (const match of matches) {
    if (match.status === 'pending') {
      await expireMatch(match.matchId)
    }
  }
}
