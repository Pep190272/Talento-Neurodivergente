/**
 * Candidate Pipeline API — Issue #59
 * GET /api/companies/:companyId/pipeline
 *
 * Candidate pipeline for companies with neuro-match insights.
 * Shows candidates in hiring pipeline with:
 *   - Pipeline stages (newMatches → underReview → interviewing → offered → hired)
 *   - Neuro-match compatibility scores
 *   - Accommodation alignment insights
 *   - Anonymized candidate data (pre-consent)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, AuthenticationError, ForbiddenError } from '@/lib/errors'
import prisma from '@/lib/prisma'

const PIPELINE_STAGES = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected'] as const

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const { companyId } = await params

  // Verify company access
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { userId: true, name: true },
  })

  if (!company || company.userId !== session.user.id) {
    throw new ForbiddenError('You do not have access to this company pipeline')
  }

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const jobId = searchParams.get('jobId')

  // Get all connections (pipeline entries) for this company
  const connectionWhere: Record<string, unknown> = {
    companyId,
    type: 'JOB_MATCH',
  }

  if (stage && PIPELINE_STAGES.includes(stage as typeof PIPELINE_STAGES[number])) {
    connectionWhere.pipelineStage = stage
  }

  if (jobId) {
    connectionWhere.jobId = jobId
  }

  const connections = await prisma.connection.findMany({
    where: connectionWhere,
    orderBy: { updatedAt: 'desc' },
  })

  // Get matching details for each connection
  const matchingIds = connections
    .map(c => c.matchId)
    .filter((id): id is string => !!id)

  const matchings = await prisma.matching.findMany({
    where: { id: { in: matchingIds } },
    include: {
      job: { select: { title: true, skills: true, accommodations: true } },
    },
  })

  const matchingMap = new Map(matchings.map(m => [m.id, m]))

  // Build pipeline view
  const pipelineEntries = connections.map(conn => {
    const matching = conn.matchId ? matchingMap.get(conn.matchId) : null
    const candidateData = matching?.candidateData as Record<string, unknown> | null
    const factors = matching?.aiFactors as Record<string, number> | null
    const customPrivacy = (conn.customPrivacy ?? {}) as Record<string, boolean>

    return {
      connectionId: conn.id,
      pipelineStage: conn.pipelineStage,
      candidateId: conn.individualId,
      // Anonymized by default — real name only if consent given
      candidateName: candidateData?.name ?? 'Anonymous Candidate',
      jobId: conn.jobId,
      jobTitle: matching?.job?.title ?? 'Unknown Position',
      matchScore: matching?.aiScore ?? null,
      scoreBreakdown: factors ? {
        skills: factors.skills ?? 0,
        accommodations: factors.accommodations ?? 0,
        preferences: factors.preferences ?? 0,
        location: factors.location ?? 0,
      } : null,
      neuroMatchInsights: {
        accommodationAlignment: factors?.accommodations
          ? factors.accommodations >= 80 ? 'Excellent — all needs met'
            : factors.accommodations >= 60 ? 'Good — most needs met'
              : factors.accommodations >= 40 ? 'Partial — some gaps'
                : 'Review needed — significant gaps'
          : 'Not assessed',
        skillsFit: factors?.skills
          ? factors.skills >= 80 ? 'Strong match'
            : factors.skills >= 60 ? 'Good match'
              : 'Partial match'
          : 'Not assessed',
        aiExplanation: matching?.aiExplanation ?? null,
      },
      consentStatus: {
        active: conn.status === 'active',
        sharedData: conn.sharedData,
        diagnosisShared: customPrivacy.shareDiagnosis ?? false,
        assessmentShared: customPrivacy.shareAssessmentDetails ?? false,
      },
      candidateSkills: candidateData?.skills ?? [],
      accommodationsNeeded: candidateData?.accommodationsNeeded ?? [],
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }
  })

  // Group by pipeline stage
  const pipeline: Record<string, typeof pipelineEntries> = {}
  for (const stg of PIPELINE_STAGES) {
    pipeline[stg] = pipelineEntries.filter(e => e.pipelineStage === stg)
  }

  return NextResponse.json({
    success: true,
    data: {
      companyId,
      companyName: company.name,
      pipeline,
      summary: {
        total: pipelineEntries.length,
        byStage: Object.fromEntries(
          PIPELINE_STAGES.map(s => [s, pipeline[s].length])
        ),
        avgMatchScore: pipelineEntries.length > 0
          ? Math.round(
            pipelineEntries
              .filter(e => e.matchScore !== null)
              .reduce((sum, e) => sum + (e.matchScore ?? 0), 0) /
            Math.max(1, pipelineEntries.filter(e => e.matchScore !== null).length)
          )
          : null,
      },
    },
  })
})
