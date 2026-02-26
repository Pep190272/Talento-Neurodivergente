/**
 * API Routes for Consent Accept
 * POST /api/consent/accept - Accept consent for data sharing
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { grantConsent } from '@/lib/consent'

/**
 * POST /api/consent/accept
 * Grant consent for data sharing between candidate and company
 *
 * @body {string} userId - User/Candidate ID (required)
 * @body {string} companyId - Company ID (required)
 * @body {string} jobId - Job ID (required)
 * @body {string} consentType - Type of consent (required)
 *
 * @returns {object} 200 - Consent granted successfully
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, companyId, jobId, consentType } = await request.json()

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    if (!consentType) {
      return NextResponse.json(
        { error: 'consentType is required' },
        { status: 400 }
      )
    }

    // Grant consent
    const consent = await grantConsent(userId, companyId, jobId, consentType)

    return NextResponse.json({
      success: true,
      data: consent,
      message: 'Consent granted successfully'
    })

  } catch (error) {
    console.error('Error granting consent:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
