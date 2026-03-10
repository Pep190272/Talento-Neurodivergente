/**
 * AI Decision Appeal/Contest API — Issue #57
 * POST /api/matching/contest
 *
 * EU AI Act Art. 22 + GDPR Art. 22: Right to contest automated decisions.
 * Allows candidates to formally contest AI matching decisions.
 *
 * Flow:
 *   1. Candidate submits contest with reason
 *   2. System marks matching as CONTESTED
 *   3. Human reviewer is notified
 *   4. Reviewer resolves contest (approve/reject override)
 *   5. Candidate is notified of resolution
 *
 * GET /api/matching/contest?matchingId=xxx — Get contest status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, AuthenticationError, ValidationError, NotFoundError, ConflictError } from '@/lib/errors'
import { logDataAccess } from '@/lib/audit'
import prisma from '@/lib/prisma'

// ─── POST: Submit Contest ────────────────────────────────────────────────────

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const body = await req.json()
  const { matchingId, reason, requestedOutcome } = body

  if (!matchingId) throw new ValidationError('matchingId is required')
  if (!reason || reason.trim().length < 10) {
    throw new ValidationError('A detailed reason is required (minimum 10 characters)')
  }

  // Get matching
  const matching = await prisma.matching.findUnique({ where: { id: matchingId } })
  if (!matching) throw new NotFoundError('Matching', matchingId)

  // Authorization: only the candidate can contest
  if (matching.individualId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Can't contest already contested or resolved matches
  if (matching.status === 'CONTESTED') {
    throw new ConflictError('This matching decision has already been contested')
  }
  if (matching.contestResolvedAt) {
    throw new ConflictError('This contest has already been resolved')
  }
  // Can't contest withdrawn matches
  if (matching.status === 'WITHDRAWN') {
    throw new ValidationError('Cannot contest a withdrawn matching')
  }

  // Update matching to CONTESTED status
  const updated = await prisma.matching.update({
    where: { id: matchingId },
    data: {
      status: 'CONTESTED',
      contestedAt: new Date(),
      contestReason: reason.trim(),
    },
  })

  // Log the contest in audit trail (EU AI Act Art. 12)
  await logDataAccess({
    action: 'ai_decision_made',
    accessedBy: session.user.id,
    targetUser: session.user.id,
    aiDecisionId: matchingId,
    aiSystemName: 'DiversIA-Matching',
    reason: `contest_submitted: ${requestedOutcome ?? 'reconsideration'}`,
    dataAccessed: ['matching_score', 'ai_factors', 'contest_reason'],
    userNotified: true,
  })

  return NextResponse.json({
    success: true,
    data: {
      matchingId: updated.id,
      status: 'CONTESTED',
      contestedAt: updated.contestedAt,
      message: 'Your contest has been registered. A human reviewer will evaluate your case. ' +
        'You will be notified when the review is complete. ' +
        'This is your right under EU AI Act Art. 22 and GDPR Art. 22.',
      nextSteps: [
        'A qualified human reviewer will examine the AI decision',
        'The reviewer will consider your stated reason',
        'You will receive notification of the outcome',
        'The original decision will be reconsidered',
      ],
      transparencyUrl: `/api/transparency?matchingId=${matchingId}`,
    },
  })
})

// ─── GET: Contest Status ─────────────────────────────────────────────────────

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const { searchParams } = new URL(req.url)
  const matchingId = searchParams.get('matchingId')

  if (!matchingId) throw new ValidationError('matchingId query parameter is required')

  const matching = await prisma.matching.findUnique({
    where: { id: matchingId },
    include: {
      job: { select: { title: true } },
    },
  })

  if (!matching) throw new NotFoundError('Matching', matchingId)

  // Authorization check
  if (matching.individualId !== session.user.id && (session.user as Record<string, unknown>).type !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    success: true,
    data: {
      matchingId: matching.id,
      jobTitle: matching.job.title,
      currentStatus: matching.status,
      originalScore: matching.aiScore,
      contested: !!matching.contestedAt,
      contestedAt: matching.contestedAt,
      contestReason: matching.contestReason,
      resolved: !!matching.contestResolvedAt,
      contestResolvedAt: matching.contestResolvedAt,
      contestResolution: matching.contestResolution,
      humanReviewRequired: matching.humanOversightRequired,
      reviewedBy: matching.reviewedBy ? 'Human Reviewer (anonymized)' : null,
      reviewedAt: matching.reviewedAt,
    },
  })
})
