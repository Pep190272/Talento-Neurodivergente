/**
 * API Routes for Individual Privacy Settings
 * PATCH /api/individuals/:userId/privacy - Update privacy settings
 */

import { NextResponse } from 'next/server'
import {
  getIndividualProfile,
  updatePrivacySettings
} from '@/lib/individuals'

/**
 * PATCH /api/individuals/:userId/privacy
 * Update privacy settings for individual
 *
 * @param {string} userId - User ID
 * @body {object} privacy - Privacy settings to update
 * @body {boolean} privacy.visibleInSearch - Visible in matching
 * @body {boolean} privacy.showRealName - Show real name or anonymized
 * @body {boolean} privacy.shareDiagnosis - Share diagnosis by default
 * @body {boolean} privacy.shareTherapistContact - Share therapist contact
 * @body {boolean} privacy.shareAssessmentDetails - Share assessment details
 *
 * @returns {object} 200 - Updated profile with new privacy settings
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function PATCH(request, { params }) {
  try {
    const { userId } = await params
    const privacyUpdates = await request.json()

    const { updatePrivacySettings, getIndividualProfile } = await import('@/lib/individuals')

    // Check if profile exists
    const existing = await getIndividualProfile(userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update privacy settings
    const updatedProfile = await updatePrivacySettings(userId, privacyUpdates)

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Privacy settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating privacy settings:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
