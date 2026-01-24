/**
 * Company Profile and Job Posting Management
 * UC-003: Company Registration & Job Posting
 *
 * Handles company accounts and inclusive job postings
 */

import {
  generateUserId,
  generateJobId,
  isValidEmail,
  sanitizeInput,
  validateRequiredFields,
  deepClone,
  addDays
} from './utils.js'

import {
  saveToFile,
  readFromFile,
  getUserFilePath,
  getJobFilePath,
  findUserByEmail,
  updateFile,
  findAll,
  initializeDataStructure
} from './storage.js'

// Import LLM for job analysis
import { analyzeJobInclusivity as llmAnalyze } from './llm.js'
import { validateJobAnalysis } from './schemas/job-analysis.js'

/**
 * Create new company profile
 * @param {object} data - Company data
 * @param {string} data.email - Company email (required, unique)
 * @param {string} data.name - Company name (required)
 * @param {string} data.industry - Industry sector
 * @param {string} data.size - Company size
 * @param {string} data.location - Company location
 * @param {string} data.website - Company website
 * @param {string} data.description - Company description
 * @returns {object} - Created company profile
 */
export async function createCompany(data) {
  await initializeDataStructure()

  // Validate required fields
  validateRequiredFields(data, ['email'])

  if (!data.name) {
    throw new Error('Company name is required')
  }

  const email = data.email.toLowerCase().trim()

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format')
  }

  // Check for duplicate email
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new Error('Company email already exists')
  }

  // Generate unique company ID
  const companyId = generateUserId('company')

  // Create company object (flat structure for easier access)
  const company = {
    companyId,
    email,
    userType: 'company',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Company info (flat structure)
    name: sanitizeInput(data.name),
    industry: data.industry || null,
    size: data.size || null,
    location: data.location || null,
    website: data.website || null,
    description: sanitizeInput(data.description || ''),
    contact: data.contact || null,
    diversityCommitment: data.diversityCommitment || null,
    neurodiversityPrograms: data.neurodiversityPrograms || [],

    jobs: [],

    pipeline: {
      newMatches: [],
      underReview: [],
      interviewing: [],
      offered: [],
      hired: [],
      rejected: []
    },

    metadata: {
      lastLogin: new Date(),
      jobsPosted: 0,
      candidatesHired: 0,
      averageTimeToHire: null
    },

    // Integration metadata
    redirectTo: '/dashboard/company'
  }

  // Save to file
  const filePath = getUserFilePath('company', companyId)
  await saveToFile(filePath, company)

  return company
}

/**
 * Get company profile by company ID
 * @param {string} companyId - Company ID
 * @returns {object|null} - Company profile or null
 */
export async function getCompany(companyId) {
  const filePath = getUserFilePath('company', companyId)
  return await readFromFile(filePath)
}

/**
 * Update company profile
 * @param {string} companyId - Company ID
 * @param {object} updates - Fields to update
 * @returns {object} - Updated company profile
 */
export async function updateCompany(companyId, updates) {
  const filePath = getUserFilePath('company', companyId)

  return await updateFile(filePath, (currentCompany) => {
    const updatedCompany = deepClone(currentCompany)

    if (updates.profile) {
      updatedCompany.profile = {
        ...updatedCompany.profile,
        ...updates.profile
      }

      // Sanitize string fields
      if (updates.profile.name) {
        updatedCompany.profile.name = sanitizeInput(updates.profile.name)
      }
      if (updates.profile.description) {
        updatedCompany.profile.description = sanitizeInput(updates.profile.description)
      }
    }

    updatedCompany.updatedAt = new Date()

    return updatedCompany
  })
}

/**
 * Create job posting
 * @param {string} companyId - Company ID
 * @param {object} jobData - Job posting data
 * @param {string} jobData.title - Job title (required)
 * @param {string} jobData.description - Job description
 * @param {Array<string>} jobData.skills - Required skills
 * @param {Array<string>} jobData.accommodations - Offered accommodations (required, min 1)
 * @param {string} jobData.salaryRange - Salary range
 * @param {string} jobData.location - Job location
 * @param {string} jobData.workMode - Work mode (remote/hybrid/on-site)
 * @returns {object} - Created job posting with matching triggered flag
 */
export async function createJobPosting(companyId, jobData) {
  // Validate required fields
  validateRequiredFields(jobData, ['title', 'skills', 'accommodations'])

  // Require at least one accommodation
  if (!Array.isArray(jobData.accommodations) || jobData.accommodations.length === 0) {
    throw new Error('At least one accommodation is required')
  }

  // Analyze job inclusivity
  const inclusivityAnalysis = await analyzeJobInclusivity(jobData)

  if (inclusivityAnalysis.hasDiscriminatoryLanguage) {
    throw new Error(
      `Discriminatory language detected: ${inclusivityAnalysis.issues.map(i => i.text).join(', ')}`
    )
  }

  // Generate job ID
  const jobId = generateJobId()

  // Create job object (flat structure for easier access)
  const job = {
    jobId,
    companyId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,

    // Job details (flat structure)
    title: sanitizeInput(jobData.title),
    description: sanitizeInput(jobData.description || ''),
    skills: jobData.skills,
    accommodations: jobData.accommodations,
    salaryRange: jobData.salaryRange || null,
    location: jobData.location || null,
    workMode: jobData.workMode || 'remote',
    benefits: jobData.benefits || [],
    teamSize: jobData.teamSize || null,
    reportingStructure: jobData.reportingStructure || null,
    visibility: jobData.visibility || 'public',

    inclusivityScore: inclusivityAnalysis.score,
    inclusivityAnalysis,

    matches: {
      pending: [],
      accepted: []
    },

    pipeline: {
      newMatches: [],
      underReview: [],
      interviewing: [],
      offered: [],
      hired: [],
      rejected: []
    },

    metadata: {
      views: 0,
      applicants: 0,
      averageMatchScore: null
    }
  }

  // Save job to file
  const jobFilePath = getJobFilePath(jobId)
  await saveToFile(jobFilePath, job)

  // Add job to company's jobs list
  await updateFile(getUserFilePath('company', companyId), (company) => {
    company.jobs.push(jobId)
    company.metadata.jobsPosted += 1
    company.updatedAt = new Date()
    return company
  })

  // Flag to trigger matching
  job.matchingTriggered = true

  return job
}

/**
 * Get job posting by job ID
 * @param {string} jobId - Job ID
 * @returns {object|null} - Job posting or null
 */
export async function getJobPosting(jobId) {
  const filePath = getJobFilePath(jobId)
  return await readFromFile(filePath)
}

/**
 * Update job posting
 * @param {string} jobId - Job ID
 * @param {object} updates - Fields to update
 * @returns {object} - Updated job posting
 */
export async function updateJobPosting(jobId, updates) {
  const filePath = getJobFilePath(jobId)

  return await updateFile(filePath, (currentJob) => {
    const updatedJob = deepClone(currentJob)

    if (updates.details) {
      updatedJob.details = {
        ...updatedJob.details,
        ...updates.details
      }

      // Sanitize string fields
      if (updates.details.title) {
        updatedJob.details.title = sanitizeInput(updates.details.title)
      }
      if (updates.details.description) {
        updatedJob.details.description = sanitizeInput(updates.details.description)
      }
    }

    updatedJob.updatedAt = new Date()

    return updatedJob
  })
}

/**
 * Close job posting
 * @param {string} jobId - Job ID
 * @returns {object} - Updated job posting
 */
export async function closeJob(jobId) {
  const filePath = getJobFilePath(jobId)

  return await updateFile(filePath, (job) => {
    job.status = 'closed'
    job.closedAt = new Date()
    job.updatedAt = new Date()
    return job
  })
}

/**
 * Get all jobs for a company
 * @param {string} companyId - Company ID
 * @returns {Array<object>} - Array of job postings
 */
export async function getCompanyJobs(companyId) {
  const company = await getCompany(companyId)

  if (!company) {
    return []
  }

  const jobs = await Promise.all(
    company.jobs.map(async (jobId) => {
      return await getJobPosting(jobId)
    })
  )

  return jobs.filter(job => job !== null)
}

/**
 * Get all open job postings
 * @returns {Array<object>} - Array of open job postings
 */
export async function getAllOpenJobs() {
  const allJobs = await findAll('jobs', job => job.status === 'open')
  return allJobs
}

/**
 * Analyze job posting for inclusivity and discriminatory language
 * Uses LLM (Ollama/Gemma 2B) for advanced analysis with fallback
 * 
 * @param {object} jobData - Job posting data
 * @returns {object} - Analysis result with score, issues, suggestions
 */
export async function analyzeJobInclusivity(jobData) {
  try {
    // Call LLM for analysis
    const rawAnalysis = await llmAnalyze(jobData)

    // Validate response with Zod
    const validatedAnalysis = validateJobAnalysis(rawAnalysis)

    // Transform to expected format for backward compatibility
    return {
      score: validatedAnalysis.score,
      hasDiscriminatoryLanguage: validatedAnalysis.discriminatoryLanguage,
      issues: validatedAnalysis.issues.map(issue => ({
        type: issue.type,
        text: issue.term,
        severity: issue.severity,
        suggestion: `Address ${issue.type} bias: "${issue.term}"`
      })),
      suggestions: [validatedAnalysis.suggestions],
      accommodationsCount: validatedAnalysis.accommodations.count,
      accommodationsQuality: validatedAnalysis.accommodations.quality,
      llmPowered: !validatedAnalysis.fallback // Flag indicating LLM was used
    }

  } catch (error) {
    console.warn('LLM analysis failed, using fallback:', error.message)

    // Fallback to basic hardcoded analysis
    const text = `${jobData.title} ${jobData.description || ''}`.toLowerCase()

    const discriminatoryTerms = [
      { term: 'young', type: 'age' },
      { term: 'energetic', type: 'age' },
      { term: 'rockstar', type: 'gender' },
      { term: 'ninja', type: 'gender' },
      { term: 'guru', type: 'cultural' },
      { term: 'native speaker', type: 'cultural' },
      { term: 'recent graduate', type: 'age' },
      { term: 'digital native', type: 'age' }
    ]

    const issues = []

    discriminatoryTerms.forEach(({ term, type }) => {
      if (text.includes(term)) {
        issues.push({
          type,
          text: term,
          severity: 'high',
          suggestion: `Replace "${term}" with more inclusive language`
        })
      }
    })

    // Check for required accommodations
    if (!jobData.accommodations || jobData.accommodations.length === 0) {
      issues.push({
        type: 'missing_accommodations',
        severity: 'high',
        suggestion: 'Add workplace accommodations to make job more inclusive'
      })
    }

    // Calculate inclusivity score
    let score = 100

    // Deduct for issues
    score -= issues.filter(i => i.severity === 'high').length * 20
    score -= issues.filter(i => i.severity === 'medium').length * 10

    // Bonus for accommodations
    if (jobData.accommodations && jobData.accommodations.length >= 3) {
      score += 10
    }

    // Bonus for remote work (accessibility)
    if (jobData.workMode === 'remote') {
      score += 10
    }

    score = Math.max(0, Math.min(100, score))

    const suggestions = []

    if (score < 80) {
      suggestions.push('Add more accommodations to improve inclusivity')
    }

    if (!jobData.workMode || jobData.workMode === 'on-site') {
      suggestions.push('Consider offering remote or hybrid work for better accessibility')
    }

    if (!jobData.description || jobData.description.length < 100) {
      suggestions.push('Add detailed job description to help candidates understand requirements')
    }

    return {
      hasDiscriminatoryLanguage: issues.some(i => i.severity === 'high'),
      issues,
      score,
      suggestions,
      llmPowered: false // Fallback analysis
    }
  }
}

/**
 * Get matches for a specific job
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {Array<object>} - Array of match objects
 */
export async function getMatchesForCompany(companyId, jobId) {
  const { getMatchesForJob } = await import('./storage.js')
  const matches = await getMatchesForJob(jobId)

  // Filter out rejected matches (privacy - candidate shouldn't be visible after rejection)
  return matches.filter(match => match.status !== 'rejected')
}

/**
 * Get company pipeline for a specific job
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} - Pipeline with candidates at each stage
 */
export async function getCompanyPipeline(companyId, jobId) {
  const job = await getJobPosting(jobId)

  if (!job || job.companyId !== companyId) {
    throw new Error('Job not found or unauthorized')
  }

  return job.pipeline
}

/**
 * Update pipeline stage for a candidate
 * @param {string} connectionId - Connection ID
 * @param {string} newStage - New pipeline stage
 * @returns {object} - Updated connection
 */
export async function updatePipelineStage(connectionId, newStage) {
  const validStages = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected']

  if (!validStages.includes(newStage)) {
    throw new Error(`Invalid pipeline stage: ${newStage}`)
  }

  // This will be fully implemented in consent.js
  // For now, return mock response
  return {
    connectionId,
    stage: newStage,
    updatedAt: new Date()
  }
}

/**
 * Get candidate data for company (respects privacy and consent)
 * @param {string} companyId - Company ID
 * @param {string} candidateId - Candidate user ID
 * @returns {object} - Candidate data based on connection permissions
 */
export async function getCandidateDataForCompany(companyId, candidateId) {
  // Verify active connection exists
  const { getConnectionsForUser } = await import('./storage.js')
  const connections = await getConnectionsForUser(candidateId)

  const activeConnection = connections.find(
    conn => conn.companyId === companyId && conn.status === 'active'
  )

  if (!activeConnection) {
    throw new Error('No active connection exists')
  }

  // Get profile data respecting permissions
  const { getProfileForCompany } = await import('./individuals.js')
  return await getProfileForCompany(candidateId, activeConnection.connectionId)
}

/**
 * Get connection for company view
 * @param {string} companyId - Company ID
 * @param {string} connectionId - Connection ID
 * @returns {object} - Connection data
 */
export async function getConnectionForCompany(companyId, connectionId) {
  const { readFromFile, getConnectionFilePath } = await import('./storage.js')
  const connection = await readFromFile(getConnectionFilePath(connectionId))

  if (!connection) {
    throw new Error('Connection not found')
  }

  if (connection.companyId !== companyId) {
    throw new Error('Unauthorized access')
  }

  if (connection.status === 'revoked') {
    throw new Error('Access revoked by candidate')
  }

  return connection
}

/**
 * Get company dashboard data
 * @param {string} companyId - Company ID
 * @returns {object} - Dashboard data with pipeline and metrics
 */
export async function getCompanyDashboard(companyId) {
  const company = await getCompany(companyId)

  if (!company) {
    throw new Error('Company not found')
  }

  const jobs = await getCompanyJobs(companyId)

  // Aggregate pipeline across all jobs
  const aggregatedPipeline = {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: []
  }

  for (const job of jobs) {
    if (job.status === 'open') {
      Object.keys(aggregatedPipeline).forEach(stage => {
        if (job.pipeline[stage]) {
          aggregatedPipeline[stage].push(...job.pipeline[stage])
        }
      })
    }
  }

  return {
    companyId,
    company: company.profile,
    jobs: {
      total: jobs.length,
      open: jobs.filter(j => j.status === 'open').length,
      closed: jobs.filter(j => j.status === 'closed').length
    },
    pipeline: aggregatedPipeline,
    metrics: {
      totalCandidates: Object.values(aggregatedPipeline)
        .reduce((sum, stage) => sum + stage.length, 0),
      candidatesHired: company.metadata.candidatesHired,
      averageTimeToHire: company.metadata.averageTimeToHire
    }
  }
}

/**
 * Get company by ID (alias for compatibility)
 * @param {string} companyId - Company ID
 * @returns {object|null} - Company profile or null
 */
export async function getCompanyById(companyId) {
  return await getCompany(companyId)
}

/**
 * Get job by ID (alias for compatibility)
 * @param {string} jobId - Job ID
 * @returns {object|null} - Job posting or null
 */
export async function getJobById(jobId) {
  return await getJobPosting(jobId)
}
