/**
 * Dashboard Data Aggregation Module
 * UC-006: Individual Dashboard
 * UC-007: Company Dashboard
 * UC-009: Therapist Dashboard
 *
 * Provides metrics and insights while respecting privacy
 */

import {
  getIndividualProfile,
  calculateProfileCompletion,
  getPublicProfile
} from './individuals'

import {
  getCompany,
  getCompanyJobs,
  getCandidateDataForCompany
} from './companies.js'

import {
  getTherapist,
  getTherapistClients
} from './therapists.js'

import {
  getMatchesByCandidateId,
  getMatchesByJobId
} from './matching.js'

import {
  getConnectionsForUser
} from './storage.js'

/**
 * Get Individual (Candidate) Dashboard
 * UC-006: Metrics, profile completion, matches, connections
 * @param {string} userId - Individual user ID
 * @returns {object} - Dashboard data
 */
export async function getIndividualDashboard(userId) {
  const profile = await getIndividualProfile(userId)

  if (!profile) {
    throw new Error('Individual profile not found')
  }

  // Profile completion
  const profileCompletion = await calculateProfileCompletion(userId)

  // Get matches
  const allMatches = await getMatchesByCandidateId(userId)
  const pendingMatches = allMatches.filter(m => m.status === 'pending')
  const acceptedMatches = allMatches.filter(m => m.status === 'accepted')
  const rejectedMatches = allMatches.filter(m => m.status === 'rejected')

  // Get connections
  const connections = await getConnectionsForUser(userId)
  const activeConnections = connections.filter(c => c.status === 'active')

  // Group connections by pipeline stage
  const pipelineBreakdown = {
    newMatches: activeConnections.filter(c => c.pipelineStage === 'newMatches').length,
    underReview: activeConnections.filter(c => c.pipelineStage === 'underReview').length,
    interviewing: activeConnections.filter(c => c.pipelineStage === 'interviewing').length,
    offered: activeConnections.filter(c => c.pipelineStage === 'offered').length,
    hired: activeConnections.filter(c => c.pipelineStage === 'hired').length
  }

  // Recent matches (top 5 by score)
  const recentMatches = pendingMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(match => ({
      matchId: match.matchId,
      jobId: match.jobId,
      companyId: match.companyId,
      score: match.score,
      createdAt: match.createdAt,
      expiresAt: match.expiresAt
    }))

  return {
    userId,
    profile: {
      name: profile.profile.name,
      email: profile.email,
      location: profile.profile.location,
      therapistId: profile.profile.therapistId
    },
    profileCompletion: profileCompletion.percentage,
    completionBreakdown: profileCompletion.breakdown,
    missingSteps: profileCompletion.missingSteps,
    matches: {
      pending: pendingMatches.length,
      accepted: acceptedMatches.length,
      rejected: rejectedMatches.length,
      total: allMatches.length
    },
    connections: {
      total: activeConnections.length,
      pipelineBreakdown
    },
    recentMatches,
    metadata: {
      memberSince: profile.createdAt,
      lastActive: profile.metadata.lastLogin,
      profileViews: profile.metadata.profileViews
    }
  }
}

/**
 * Get Company Dashboard
 * UC-007: Jobs, pipeline, candidate metrics
 * @param {string} companyId - Company ID
 * @returns {object} - Dashboard data
 */
export async function getCompanyDashboard(companyId) {
  const company = await getCompany(companyId)

  if (!company) {
    throw new Error('Company not found')
  }

  // Get all jobs
  const jobs = await getCompanyJobs(companyId)
  const openJobs = jobs.filter(j => j.status === 'open')
  const closedJobs = jobs.filter(j => j.status === 'closed')

  // Aggregate pipeline across all jobs
  const aggregatedPipeline = {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: []
  }

  let totalMatches = 0
  let totalCandidates = 0

  for (const job of openJobs) {
    const matches = await getMatchesByJobId(job.jobId)
    const acceptedMatches = matches.filter(m => m.status === 'accepted')

    totalMatches += matches.length

    // Get connections for this job
    const connections = await getConnectionsForUser(companyId)
    const jobConnections = connections.filter(c => c.jobId === job.jobId && c.status === 'active')

    totalCandidates += jobConnections.length

    // Group by pipeline stage
    Object.keys(aggregatedPipeline).forEach(stage => {
      const stageConnections = jobConnections.filter(c => c.pipelineStage === stage)
      aggregatedPipeline[stage].push(...stageConnections)
    })
  }

  // Get recent matches (respecting privacy)
  const recentCandidates = []

  for (const connection of aggregatedPipeline.newMatches.slice(0, 5)) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, connection.candidateId)
      recentCandidates.push({
        connectionId: connection.connectionId,
        candidateId: connection.candidateId,
        jobId: connection.jobId,
        name: candidateData.name,
        skills: candidateData.skills,
        matchScore: connection.matchScore || null,
        acceptedAt: connection.consentGivenAt
      })
    } catch (error) {
      // Skip if cannot access (privacy or revoked)
      continue
    }
  }

  // Calculate metrics
  const pipelineCounts = Object.entries(aggregatedPipeline).reduce((acc, [stage, candidates]) => {
    acc[stage] = candidates.length
    return acc
  }, {})

  return {
    companyId,
    company: {
      name: company.profile.name,
      industry: company.profile.industry,
      location: company.profile.location
    },
    jobs: {
      total: jobs.length,
      open: openJobs.length,
      closed: closedJobs.length
    },
    pipeline: pipelineCounts,
    metrics: {
      totalMatches,
      totalCandidates,
      candidatesHired: company.metadata.candidatesHired,
      averageTimeToHire: company.metadata.averageTimeToHire || null
    },
    recentCandidates,
    metadata: {
      memberSince: company.createdAt,
      lastActive: company.metadata.lastLogin
    }
  }
}

/**
 * Get Therapist Dashboard
 * UC-009: Clients, support metrics
 * @param {string} therapistId - Therapist ID
 * @returns {object} - Dashboard data
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

  // Client status breakdown
  const clientsByStatus = {
    searching: clients.filter(c => c.activeMatches === 0 && c.assessmentCompleted).length,
    matched: clients.filter(c => c.activeMatches > 0).length,
    notReady: clients.filter(c => !c.assessmentCompleted).length
  }

  // Total active matches across all clients
  const totalActiveMatches = clients.reduce((sum, c) => sum + (c.activeMatches || 0), 0)

  return {
    therapistId,
    therapist: {
      name: therapist.profile.name,
      specializations: therapist.profile.specializations,
      verificationStatus: therapist.verificationStatus
    },
    clients: {
      total: clients.length,
      active: activeClients.length,
      capacity: therapist.availability.maxClients,
      acceptingNew: therapist.profile.acceptingNewClients,
      breakdown: clientsByStatus
    },
    metrics: {
      assessmentCompletionRate: clients.length > 0
        ? Math.round((clientsWithCompleteAssessment.length / clients.length) * 100)
        : 0,
      totalActiveMatches,
      averageMatchesPerClient: clients.length > 0
        ? Math.round(totalActiveMatches / clients.length)
        : 0,
      sessionsCompleted: therapist.metadata.sessionsCompleted,
      satisfactionScore: therapist.metadata.clientSatisfactionScore
    },
    recentClients: clients
      .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
      .slice(0, 5)
      .map(client => ({
        userId: client.userId,
        name: client.name,
        diagnoses: client.diagnoses,
        activeMatches: client.activeMatches,
        lastActive: client.lastActive
      })),
    metadata: {
      memberSince: therapist.createdAt,
      lastActive: therapist.metadata.lastLogin
    }
  }
}

/**
 * Get matches for company (specific job) - respects privacy
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} - Matches with privacy-filtered candidate data
 */
export async function getMatchesForCompany(companyId, jobId) {
  const job = await import('./companies.js').then(m => m.getJobPosting(jobId))

  if (!job || job.companyId !== companyId) {
    throw new Error('Job not found or unauthorized')
  }

  const matches = await getMatchesByJobId(jobId)

  // Filter out rejected matches (privacy)
  const visibleMatches = matches.filter(m => m.status !== 'rejected')

  // Only accepted matches have full connection data
  const acceptedMatches = visibleMatches.filter(m => m.status === 'accepted')

  const matchesWithCandidateData = []

  for (const match of acceptedMatches) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, match.candidateId)

      matchesWithCandidateData.push({
        matchId: match.matchId,
        score: match.score,
        scoreBreakdown: match.scoreBreakdown,
        status: match.status,
        acceptedAt: match.acceptedAt,
        candidate: candidateData
      })
    } catch (error) {
      // Skip if access revoked
      continue
    }
  }

  return {
    jobId,
    totalMatches: visibleMatches.length,
    acceptedMatches: acceptedMatches.length,
    pendingMatches: visibleMatches.filter(m => m.status === 'pending').length,
    matches: matchesWithCandidateData
  }
}

/**
 * Get connection for company view - respects privacy
 * @param {string} companyId - Company ID
 * @param {string} connectionId - Connection ID
 * @returns {object} - Connection with candidate data
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

  // Get candidate data respecting permissions
  const candidateData = await getCandidateDataForCompany(companyId, connection.candidateId)

  return {
    connectionId: connection.connectionId,
    candidateId: connection.candidateId,
    jobId: connection.jobId,
    status: connection.status,
    pipelineStage: connection.pipelineStage,
    consentGivenAt: connection.consentGivenAt,
    sharedData: connection.sharedData,
    candidate: candidateData,
    metadata: connection.metadata
  }
}

/**
 * Get company pipeline for specific job
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} - Pipeline with candidates at each stage
 */
export async function getCompanyPipeline(companyId, jobId) {
  const job = await import('./companies.js').then(m => m.getJobPosting(jobId))

  if (!job || job.companyId !== companyId) {
    throw new Error('Job not found or unauthorized')
  }

  const connections = await getConnectionsForUser(companyId)
  const jobConnections = connections.filter(c => c.jobId === jobId && c.status === 'active')

  const pipeline = {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: []
  }

  for (const connection of jobConnections) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, connection.candidateId)

      const candidateInfo = {
        connectionId: connection.connectionId,
        candidateId: connection.candidateId,
        name: candidateData.name,
        skills: candidateData.skills,
        movedToStageAt: connection.metadata.lastStageUpdate || connection.consentGivenAt
      }

      const stage = connection.pipelineStage
      if (pipeline[stage]) {
        pipeline[stage].push(candidateInfo)
      }
    } catch (error) {
      // Skip if access revoked
      continue
    }
  }

  return {
    jobId,
    pipeline,
    counts: Object.entries(pipeline).reduce((acc, [stage, candidates]) => {
      acc[stage] = candidates.length
      return acc
    }, {})
  }
}

/**
 * Get audit log view for user (GDPR transparency)
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters
 * @returns {object} - Audit log entries
 */
export async function getUserAuditLog(userId, filters = {}) {
  const { getAuditLogsForUser } = await import('./storage.js')
  let logs = await getAuditLogsForUser(userId)

  // Apply filters
  if (filters.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate))
  }

  if (filters.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate))
  }

  if (filters.dataType) {
    logs = logs.filter(log =>
      log.dataAccessed && log.dataAccessed.includes(filters.dataType)
    )
  }

  // Enrich with company names
  const enrichedLogs = []

  for (const log of logs) {
    try {
      let accessedByName = 'Unknown'

      if (log.accessedBy) {
        if (log.accessedBy.startsWith('comp_')) {
          const company = await getCompany(log.accessedBy)
          accessedByName = company ? company.profile.name : 'Unknown Company'
        } else if (log.accessedBy.startsWith('ther_')) {
          const therapist = await getTherapist(log.accessedBy)
          accessedByName = therapist ? therapist.profile.name : 'Unknown Therapist'
        }
      }

      enrichedLogs.push({
        ...log,
        accessedByName
      })
    } catch (error) {
      enrichedLogs.push(log)
    }
  }

  return {
    userId,
    totalEntries: enrichedLogs.length,
    entries: enrichedLogs
  }
}
