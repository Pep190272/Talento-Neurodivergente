/**
 * API Routes for Consent Reject
 * POST /api/consent/reject - Reject consent for data sharing
 */

import { NextRequest, NextResponse } from 'next/server'
import { rejectConsent } from '@/lib/consent'

/**
 * POST /api/consent/reject
 * Reject consent for data sharing between candidate and company
 *
 * @body {string} userId - User/Candidate ID (required)
 * @body {string} companyId - Company ID (required)
 * @body {string} jobId - Job ID (required)
 * @body {string} consentType - Type of consent (required)
 *
 * @returns {object} 200 - Consent rejected successfully
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, jobId, consentType } = await request.json()

    // Validation
    if (!userId || !companyId || !jobId || !consentType) {
      return NextResponse.json(
        { error: 'userId, companyId, jobId, and consentType are required' },
        { status: 400 }
      )
    }

    // Reject consent
    const consent = await rejectConsent(userId, companyId, jobId, consentType)

    return NextResponse.json({
      success: true,
      data: consent,
      message: 'Consent rejected successfully'
    })

  } catch (error) {
    console.error('Error rejecting consent:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
