/**
 * GDPR Right to Erasure — DELETE /api/individuals/[userId]/gdpr/delete
 *
 * GDPR Art. 17 — Right to be Forgotten (complete cascade).
 *
 * What gets deleted/anonymized:
 *   - Individual profile PII (name, diagnoses, location, medical, skills)
 *   - User record (email → anonymized)
 *   - Active connections → revoked (consent withdrawn)
 *   - Pending matchings → WITHDRAWN, candidateData cleared
 *   - All matching candidateData PII snapshots cleared
 *
 * What is RETAINED (legal obligation):
 *   - Audit log entries (7 years — GDPR Art. 5 + EU AI Act Art. 12)
 *   - Anonymized Individual/Matching/Connection rows (statistical integrity)
 *
 * Requires: confirmation body { confirm: "DELETE_MY_ACCOUNT" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIndividualProfile, deleteUserAccount } from '@/lib/individuals'
import { logDataAccess, logDataDeletion } from '@/lib/audit'

type RouteParams = { params: Promise<{ userId: string }> }

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Only the owner can delete their own data
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own account' },
        { status: 403 }
      )
    }

    // Require explicit confirmation
    const body = await request.json().catch(() => ({}))
    if (body.confirm !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Send { "confirm": "DELETE_MY_ACCOUNT" } to proceed',
          gdprArticle: 'Art. 17 — Right to Erasure',
        },
        { status: 400 }
      )
    }

    const profile = await getIndividualProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? undefined

    // Execute full cascade anonymization (Sprint 4: enhanced from basic soft-delete)
    await deleteUserAccount(userId)

    // Audit log — GDPR Art. 17 deletion event (retained for 7 years)
    await logDataDeletion({
      deletedUserId: userId,
      requestedBy: userId,
      ipAddress: ip,
    })

    await logDataAccess({
      action: 'data_deleted',
      accessedBy: userId,
      targetUser: userId,
      dataAccessed: ['profile', 'connections', 'matchings', 'all_pii'],
      dataType: 'GDPR_Erasure',
      sensitivityLevel: 'high',
      reason: 'gdpr_art17_right_to_erasure',
      ipAddress: ip,
      userNotified: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Your account has been anonymized. All personal data has been erased.',
      retained: [
        'Audit logs (7-year legal obligation — GDPR Art. 5 + EU AI Act Art. 12)',
        'Anonymized records for statistical compliance',
      ],
      gdprArticle: 'Art. 17 — Right to Erasure',
      erasedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[GDPR Delete]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
