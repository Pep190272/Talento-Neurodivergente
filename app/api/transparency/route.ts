/**
 * AI Transparency Log API — Issue #88
 * GET /api/transparency?matchingId=xxx
 * GET /api/transparency?userId=xxx
 *
 * EU AI Act Art. 13: Transparency obligations for providers of high-risk AI systems.
 * Provides candidates and reviewers with a full audit trail of AI decisions.
 *
 * Returns:
 *   - Algorithm version used
 *   - Factors considered and their weights
 *   - Human oversight records
 *   - Contest/appeal history
 *   - Right to explanation (GDPR Art. 22)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, AuthenticationError, ValidationError, NotFoundError } from '@/lib/errors'
import { getAIAuditTrailForMatching } from '@/lib/audit'
import prisma from '@/lib/prisma'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const { searchParams } = new URL(req.url)
  const matchingId = searchParams.get('matchingId')
  const userId = searchParams.get('userId')

  if (matchingId) {
    return await getMatchingTransparencyLog(matchingId, session.user.id)
  }

  if (userId) {
    // Users can only view their own transparency logs
    if (session.user.id !== userId && (session.user as Record<string, unknown>).type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return await getUserTransparencyLog(userId)
  }

  throw new ValidationError('Either matchingId or userId query parameter is required')
})

// ─── Matching Transparency Log ───────────────────────────────────────────────

async function getMatchingTransparencyLog(matchingId: string, requesterId: string) {
  const matching = await prisma.matching.findUnique({
    where: { id: matchingId },
    include: {
      job: { select: { title: true, companyId: true, accommodations: true, skills: true } },
    },
  })

  if (!matching) throw new NotFoundError('Matching', matchingId)

  // Authorization: candidate, company, or admin can view
  const isCandidate = matching.individualId === requesterId
  const isCompany = matching.companyId === requesterId
  if (!isCandidate && !isCompany) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get audit trail from AuditLog table
  const auditTrail = await getAIAuditTrailForMatching(matchingId)

  const factors = matching.aiFactors as Record<string, number> | null

  const transparencyLog = {
    matchingId: matching.id,
    aiSystemInfo: {
      name: matching.aiSystemName,
      version: matching.algorithmVersion,
      type: 'High-risk AI system (EU AI Act Annex III — Employment)',
      provider: 'DiversIA Platform',
    },
    decision: {
      score: matching.aiScore,
      status: matching.status,
      createdAt: matching.createdAt,
      explanation: matching.aiExplanation,
    },
    factors: {
      breakdown: factors ?? {},
      weights: {
        skills: '40%',
        accommodations: '30%',
        preferences: '20%',
        location: '10%',
      },
      dataUsed: [
        'Candidate skills (self-reported)',
        'Candidate accommodation needs (self-reported)',
        'Candidate work preferences (self-reported)',
        'Candidate location (self-reported)',
        'Job required skills',
        'Job offered accommodations',
        'Job work mode and location',
      ],
      dataNotUsed: [
        'Candidate diagnosis (GDPR Art. 9 — special category data excluded from scoring)',
        'Candidate age',
        'Candidate gender',
        'Candidate ethnicity',
        'Candidate photo/appearance',
      ],
    },
    humanOversight: {
      required: matching.humanOversightRequired,
      reviewedBy: matching.reviewedBy,
      reviewedAt: matching.reviewedAt,
      reviewNotes: isCandidate ? undefined : matching.reviewNotes,  // Notes hidden from candidate
    },
    contestInfo: {
      canContest: matching.status !== 'WITHDRAWN',
      contested: !!matching.contestedAt,
      contestedAt: matching.contestedAt,
      contestReason: matching.contestReason,
      contestResolution: matching.contestResolution,
      contestResolvedAt: matching.contestResolvedAt,
      howToContest: 'Submit a contest request via POST /api/matching/contest with your matchingId and reason.',
    },
    rights: {
      rightToExplanation: 'GDPR Art. 22 — You have the right to obtain meaningful information about the logic involved in automated decision-making.',
      rightToContest: 'EU AI Act Art. 22 — You have the right to contest AI-assisted decisions that significantly affect you.',
      rightToHumanReview: 'EU AI Act Art. 14 — All matching decisions are subject to mandatory human oversight before action is taken.',
      rightToDataAccess: 'GDPR Art. 15 — You can request all data held about you via GET /api/individuals/{userId}/gdpr/export.',
    },
    auditTrail: auditTrail.map(log => ({
      eventType: log.eventType,
      timestamp: log.timestamp,
      details: log.details,
    })),
  }

  return NextResponse.json({ success: true, data: transparencyLog })
}

// ─── User Transparency Log ──────────────────────────────────────────────────

async function getUserTransparencyLog(userId: string) {
  // Get all matchings for this user
  const matchings = await prisma.matching.findMany({
    where: { individualId: userId },
    include: {
      job: { select: { title: true, companyId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const summary = {
    userId,
    totalAIDecisions: matchings.length,
    decisionsBreakdown: {
      pending: matchings.filter(m => m.status === 'PENDING').length,
      approved: matchings.filter(m => m.status === 'APPROVED').length,
      rejected: matchings.filter(m => m.status === 'REJECTED').length,
      withdrawn: matchings.filter(m => m.status === 'WITHDRAWN').length,
      contested: matchings.filter(m => m.status === 'CONTESTED').length,
    },
    aiSystem: {
      name: 'DiversIA-Matching',
      currentVersion: 'keyword-v1',
      classification: 'High-risk AI system (EU AI Act Annex III)',
    },
    decisions: matchings.map(m => ({
      matchingId: m.id,
      jobTitle: m.job.title,
      score: m.aiScore,
      status: m.status,
      algorithmVersion: m.algorithmVersion,
      createdAt: m.createdAt,
      humanReviewed: !!m.reviewedBy,
      contested: !!m.contestedAt,
    })),
    rights: {
      rightToExplanation: 'GDPR Art. 22',
      rightToContest: 'EU AI Act Art. 22',
      rightToHumanReview: 'EU AI Act Art. 14',
      rightToDataDeletion: 'GDPR Art. 17',
      rightToDataPortability: 'GDPR Art. 20',
    },
  }

  return NextResponse.json({ success: true, data: summary })
}
