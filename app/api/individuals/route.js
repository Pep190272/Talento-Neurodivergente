/**
 * API Routes for Individual (Candidate) Profiles
 * POST /api/individuals - Create new individual profile
 */

import { NextResponse } from 'next/server'
import { createIndividualProfile } from '@/lib/individuals'

/**
 * POST /api/individuals
 * Create a new individual (candidate) profile
 *
 * @body {object} data - Profile data
 * @body {string} data.email - Email (required)
 * @body {object} data.profile - Profile information
 * @body {string} data.profile.name - Full name (required)
 * @body {Array<string>} data.profile.diagnoses - Diagnoses (optional)
 * @body {Array<string>} data.profile.skills - Skills (optional)
 * @body {object} data.privacy - Privacy settings (optional)
 *
 * @returns {object} 201 - Created profile
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
export async function POST(request) {
  try {
    const data = await request.json()

    // Basic validation
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!data.profile?.name) {
      return NextResponse.json(
        { error: 'Profile name is required' },
        { status: 400 }
      )
    }

    // Create profile using our lib module
    const profile = await createIndividualProfile(data)

    return NextResponse.json(
      {
        success: true,
        data: profile
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating individual profile:', error)

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      )
    }

    if (error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
