/**
 * Dashboard Data Aggregation Module — Prisma implementation
 * UC-006: Individual Dashboard
 * UC-007: Company Dashboard
 * UC-009: Therapist Dashboard
 *
 * Migrated from dashboards.js → dashboards.ts (Prisma 7 / PostgreSQL)
 * Maintains same public API for backward compatibility.
 *
 * Decisión de migración (2026-02-20):
 * - storage.js getConnectionsForUser → prisma.connection.findMany (indexed)
 * - storage.js getAuditLogsForUser → audit.ts getUserAuditLog (Prisma)
 * - Fix: company.profile.name → company.name (bug en versión JS)
 * - Provides metrics and insights while respecting privacy
 */

import prisma from './prisma'
import {
  getIndividualProfile,
  calculateProfileCompletion,
} from './individuals'

import {
  getCompany,
  getCompanyJobs,
  getCandidateDataForCompany,
} from './companies'

import {
  getTherapist,
  getTherapistClients,
} from './therapists'

import {
  getMatchesByCandidateId,
  getMatchesByJobId,
} from './matching'

// ─── Individual Dashboard ─────────────────────────────────────────────────────

/**
 * Get Individual (Candidate) Dashboard
 * UC-006: Metrics, profile completion, matches, connections
 */
export async function getIndividualDashboard(userId: string) {
  const profile = await getIndividualProfile(userId)
  if (!profile) throw new Error('Individual profile not found')

  const profileCompletion = await calculateProfileCompletion(userId)

  // Get matches
  const allMatches = await getMatchesByCandidateId(userId)
  const pendingMatches = allMatches.filter(m => m.status === 'pending')
  const acceptedMatches = allMatches.filter(m => m.status === 'accepted')
  const rejectedMatches = allMatches.filter(m => m.status === 'rejected')

  // Get connections via Prisma (replaces storage.js getConnectionsForUser)
  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { individualId: profile.individualId },
        { individualId: userId },
      ],
      status: 'active',
    },
  })

  // Group connections by pipeline stage
  const pipelineBreakdown = {
    newMatches: connections.filter(c => c.pipelineStage === 'newMatches').length,
    underReview: connections.filter(c => c.pipelineStage === 'underReview').length,
    interviewing: connections.filter(c => c.pipelineStage === 'interviewing').length,
    offered: connections.filter(c => c.pipelineStage === 'offered').length,
    hired: connections.filter(c => c.pipelineStage === 'hired').length,
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
      expiresAt: match.expiresAt,
    }))

  return {
    userId,
    profile: {
      name: profile.profile.name,
      email: profile.email,
      location: profile.profile.location,
      therapistId: profile.profile.therapistId,
    },
    profileCompletion: (profileCompletion as Record<string, unknown>).percentage,
    completionBreakdown: (profileCompletion as Record<string, unknown>).breakdown,
    missingSteps: (profileCompletion as Record<string, unknown>).missingSteps,
    matches: {
      pending: pendingMatches.length,
      accepted: acceptedMatches.length,
      rejected: rejectedMatches.length,
      total: allMatches.length,
    },
    connections: {
      total: connections.length,
      pipelineBreakdown,
    },
    recentMatches,
    metadata: {
      memberSince: profile.createdAt,
      lastActive: profile.metadata.lastLogin,
      profileViews: profile.metadata.profileViews,
    },
  }
}

// ─── Company Dashboard ────────────────────────────────────────────────────────

/**
 * Get Company Dashboard
 * UC-007: Jobs, pipeline, candidate metrics
 */
export async function getCompanyDashboard(companyId: string) {
  const company = await getCompany(companyId)
  if (!company) throw new Error('Company not found')

  const jobs = await getCompanyJobs(companyId)
  const openJobs = jobs.filter(j => (j as Record<string, unknown>).status === 'active' || (j as Record<string, unknown>).status === 'open')
  const closedJobs = jobs.filter(j => (j as Record<string, unknown>).status === 'closed')

  // Aggregate pipeline across all jobs
  const aggregatedPipeline: Record<string, Array<Record<string, unknown>>> = {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: [],
  }

  let totalMatches = 0
  let totalCandidates = 0

  for (const job of openJobs) {
    const jobId = (job as Record<string, unknown>).jobId as string
    const matches = await getMatchesByJobId(jobId)
    totalMatches += matches.length

    // Get connections for this job via Prisma
    const jobConnections = await prisma.connection.findMany({
      where: { companyId, jobId, status: 'active' },
    })

    totalCandidates += jobConnections.length

    // Group by pipeline stage
    for (const conn of jobConnections) {
      const stage = conn.pipelineStage
      if (aggregatedPipeline[stage]) {
        aggregatedPipeline[stage].push({
          connectionId: conn.id,
          candidateId: conn.individualId,
          jobId: conn.jobId,
          consentGivenAt: conn.consentGivenAt,
          pipelineStage: conn.pipelineStage,
        })
      }
    }
  }

  // Get recent candidates (respecting privacy)
  const recentCandidates: Array<Record<string, unknown>> = []
  for (const connection of aggregatedPipeline.newMatches.slice(0, 5)) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, connection.candidateId as string)
      recentCandidates.push({
        connectionId: connection.connectionId,
        candidateId: connection.candidateId,
        jobId: connection.jobId,
        name: (candidateData as Record<string, unknown>).name,
        skills: (candidateData as Record<string, unknown>).skills,
        matchScore: null,
        acceptedAt: connection.consentGivenAt,
      })
    } catch {
      continue
    }
  }

  // Pipeline counts
  const pipelineCounts = Object.entries(aggregatedPipeline).reduce((acc, [stage, candidates]) => {
    acc[stage] = candidates.length
    return acc
  }, {} as Record<string, number>)

  return {
    companyId,
    company: {
      // FIX: era company.profile.name (bug), ahora company.name (correcto post-Prisma)
      name: company.name,
      industry: company.industry,
      location: company.location,
    },
    jobs: {
      total: jobs.length,
      open: openJobs.length,
      closed: closedJobs.length,
    },
    pipeline: pipelineCounts,
    metrics: {
      totalMatches,
      totalCandidates,
      candidatesHired: (company.metadata as Record<string, unknown>)?.candidatesHired ?? 0,
      averageTimeToHire: (company.metadata as Record<string, unknown>)?.averageTimeToHire ?? null,
    },
    recentCandidates,
    metadata: {
      memberSince: company.createdAt,
      lastActive: (company.metadata as Record<string, unknown>)?.lastLogin ?? null,
    },
  }
}

// ─── Therapist Dashboard ──────────────────────────────────────────────────────

/**
 * Get Therapist Dashboard
 * UC-009: Clients, support metrics
 */
export async function getTherapistDashboard(therapistId: string) {
  const therapist = await getTherapist(therapistId)
  if (!therapist) throw new Error('Therapist not found')

  const clientsData = await getTherapistClients(therapistId)
  const clients = clientsData.individualClients || []

  const activeClients = clients.filter(c => c.activeMatches > 0)
  const clientsWithCompleteAssessment = clients.filter(c => c.assessmentCompleted)

  const clientsByStatus = {
    searching: clients.filter(c => c.activeMatches === 0 && c.assessmentCompleted).length,
    matched: clients.filter(c => c.activeMatches > 0).length,
    notReady: clients.filter(c => !c.assessmentCompleted).length,
  }

  const totalActiveMatches = clients.reduce((sum, c) => sum + (c.activeMatches || 0), 0)

  return {
    therapistId,
    therapist: {
      name: therapist.profile.name,
      specializations: therapist.profile.specializations,
      verificationStatus: therapist.verificationStatus,
    },
    clients: {
      total: clients.length,
      active: activeClients.length,
      capacity: therapist.availability.maxClients,
      acceptingNew: therapist.profile.acceptingNewClients,
      breakdown: clientsByStatus,
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
      satisfactionScore: therapist.metadata.clientSatisfactionScore,
    },
    recentClients: clients
      .sort((a, b) => new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime())
      .slice(0, 5)
      .map(client => ({
        userId: client.userId,
        name: client.name,
        diagnoses: client.diagnoses,
        activeMatches: client.activeMatches,
        lastActive: client.lastActive,
      })),
    metadata: {
      memberSince: therapist.createdAt,
      lastActive: therapist.metadata.lastLogin,
    },
  }
}

// ─── Company Views ────────────────────────────────────────────────────────────

/**
 * Get matches for company (specific job) — respects privacy
 */
export async function getMatchesForCompany(companyId: string, jobId: string) {
  const { getJobPosting } = await import('./companies')
  const job = await getJobPosting(jobId)

  if (!job || job.companyId !== companyId) throw new Error('Job not found or unauthorized')

  const matches = await getMatchesByJobId(jobId)
  const visibleMatches = matches.filter(m => m.status !== 'rejected')
  const acceptedMatches = visibleMatches.filter(m => m.status === 'accepted')

  const matchesWithCandidateData: Array<Record<string, unknown>> = []

  for (const match of acceptedMatches) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, match.candidateId)
      matchesWithCandidateData.push({
        matchId: match.matchId,
        score: match.score,
        scoreBreakdown: match.scoreBreakdown,
        status: match.status,
        acceptedAt: match.acceptedAt,
        candidate: candidateData,
      })
    } catch {
      continue
    }
  }

  return {
    jobId,
    totalMatches: visibleMatches.length,
    acceptedMatches: acceptedMatches.length,
    pendingMatches: visibleMatches.filter(m => m.status === 'pending').length,
    matches: matchesWithCandidateData,
  }
}

/**
 * Get connection for company view — respects privacy
 */
export async function getConnectionForCompany(companyId: string, connectionId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } })

  if (!connection) throw new Error('Connection not found')
  if (connection.companyId !== companyId) throw new Error('Unauthorized access')
  if (connection.status === 'revoked') throw new Error('Access revoked by candidate')

  const candidateData = await getCandidateDataForCompany(companyId, connection.individualId ?? '')
  const metadata = (connection.metadata as unknown as Record<string, unknown>) ?? {}

  return {
    connectionId: connection.id,
    candidateId: connection.individualId,
    jobId: connection.jobId,
    status: connection.status,
    pipelineStage: connection.pipelineStage,
    consentGivenAt: connection.consentGivenAt,
    sharedData: connection.sharedData,
    candidate: candidateData,
    metadata,
  }
}

/**
 * Get company pipeline for specific job
 */
export async function getCompanyPipeline(companyId: string, jobId: string) {
  const { getJobPosting } = await import('./companies')
  const job = await getJobPosting(jobId)

  if (!job || job.companyId !== companyId) throw new Error('Job not found or unauthorized')

  const jobConnections = await prisma.connection.findMany({
    where: { companyId, jobId, status: 'active' },
  })

  const pipeline: Record<string, Array<Record<string, unknown>>> = {
    newMatches: [],
    underReview: [],
    interviewing: [],
    offered: [],
    hired: [],
    rejected: [],
  }

  for (const connection of jobConnections) {
    try {
      const candidateData = await getCandidateDataForCompany(companyId, connection.individualId ?? '')
      const metadata = (connection.metadata as unknown as Record<string, unknown>) ?? {}

      const candidateInfo = {
        connectionId: connection.id,
        candidateId: connection.individualId,
        name: (candidateData as Record<string, unknown>).name,
        skills: (candidateData as Record<string, unknown>).skills,
        movedToStageAt: metadata.lastStageUpdate || connection.consentGivenAt,
      }

      const stage = connection.pipelineStage
      if (pipeline[stage]) {
        pipeline[stage].push(candidateInfo)
      }
    } catch {
      continue
    }
  }

  return {
    jobId,
    pipeline,
    counts: Object.entries(pipeline).reduce((acc, [stage, candidates]) => {
      acc[stage] = candidates.length
      return acc
    }, {} as Record<string, number>),
  }
}

// ─── Audit Log View ───────────────────────────────────────────────────────────

/**
 * Get audit log view for user (GDPR transparency)
 * Now queries Prisma directly instead of storage.js (which was broken post-migration)
 */
export async function getUserAuditLog(userId: string, filters: {
  startDate?: string
  endDate?: string
  dataType?: string
} = {}) {
  const { getUserAuditLog: getAuditLog } = await import('./audit')
  const auditResult = await getAuditLog(userId)

  let entries = auditResult.entries || []

  // Apply filters
  if (filters.startDate) {
    entries = entries.filter((log: Record<string, unknown>) =>
      new Date(log.timestamp as string) >= new Date(filters.startDate!)
    )
  }

  if (filters.endDate) {
    entries = entries.filter((log: Record<string, unknown>) =>
      new Date(log.timestamp as string) <= new Date(filters.endDate!)
    )
  }

  if (filters.dataType) {
    entries = entries.filter((log: Record<string, unknown>) => {
      const dataAccessed = (log.details as Record<string, unknown>)?.dataAccessed as string[]
      return dataAccessed?.includes(filters.dataType!)
    })
  }

  // Enrich with company/therapist names
  const enrichedEntries = []
  for (const log of entries) {
    try {
      let accessedByName = 'Unknown'
      const details = (log as Record<string, unknown>).details as Record<string, unknown>
      const accessedBy = details?.accessedBy as string

      if (accessedBy) {
        if (accessedBy.startsWith('comp_')) {
          const company = await getCompany(accessedBy)
          accessedByName = company ? company.name : 'Unknown Company'
        } else if (accessedBy.startsWith('ther_')) {
          const therapist = await getTherapist(accessedBy)
          accessedByName = therapist ? therapist.profile.name : 'Unknown Therapist'
        }
      }

      enrichedEntries.push({ ...log, accessedByName })
    } catch {
      enrichedEntries.push(log)
    }
  }

  return {
    userId,
    totalEntries: enrichedEntries.length,
    entries: enrichedEntries,
  }
}
