/**
 * API Routes for Individual Profile by ID
 * GET /api/individuals/:userId - Get individual profile
 * PATCH /api/individuals/:userId - Update individual profile
 * DELETE /api/individuals/:userId - Delete individual account (GDPR)
 */

import { NextResponse } from 'next/server'
import {
  getIndividualProfile,
  updateIndividualProfile,
  deleteUserAccount
} from '@/lib/individuals'

/**
 * GET /api/individuals/:userId
 * Get individual profile by user ID
 *
 * @param {string} userId - User ID
 * @returns {object} 200 - Individual profile
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { userId } = params

    const profile = await getIndividualProfile(userId)

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Error fetching individual profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/individuals/:userId
 * Update individual profile
 *
 * @param {string} userId - User ID
 * @body {object} updates - Fields to update
 * @body {object} updates.profile - Profile updates
 * @body {object} updates.privacy - Privacy updates
 * @body {object} updates.assessment - Assessment updates
 *
 * @returns {object} 200 - Updated profile
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function PATCH(request, { params }) {
  try {
    const { userId } = params
    const updates = await request.json()

    // Check if profile exists
    const existing = await getIndividualProfile(userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update profile
    const updatedProfile = await updateIndividualProfile(userId, updates)

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Error updating individual profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/individuals/:userId
 * Delete individual account (GDPR right to erasure)
 * Performs soft delete - anonymizes data but keeps audit trail
 *
 * @param {string} userId - User ID
 * @returns {object} 200 - Account deleted
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = params

    // Check if profile exists
    const existing = await getIndividualProfile(userId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Soft delete (anonymize data, keep audit trail)
    await deleteUserAccount(userId)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Audit logs retained for compliance.'
    })

  } catch (error) {
    console.error('Error deleting individual account:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
