/**
 * API Routes for Consent Revoke
 * POST /api/consent/revoke - Revoke existing consent
 */

import { NextRequest, NextResponse } from 'next/server'
import { revokeConsent } from '@/lib/consent'

/**
 * POST /api/consent/revoke
 * Revoke previously granted consent for data sharing
 *
 * @body {string} userId - User/Candidate ID (required)
 * @body {string} companyId - Company ID (required)
 * @body {string} jobId - Job ID (required)
 *
 * @returns {object} 200 - Consent revoked successfully
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - Consent not found
 * @returns {object} 500 - Server error
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, jobId } = await request.json()

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

    // Revoke consent
    const consent = await revokeConsent(userId, companyId, jobId)

    return NextResponse.json({
      success: true,
      data: consent,
      message: 'Consent revoked successfully'
    })

  } catch (error) {
    console.error('Error revoking consent:', error)

    // Handle specific errors
    if ((error as Error).message.includes('not found')) {
      return NextResponse.json(
        { error: 'Consent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
