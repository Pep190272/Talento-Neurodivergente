/**
 * API Routes for Company Profiles
 * POST /api/companies - Create new company profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createCompany } from '@/lib/companies'

/**
 * POST /api/companies
 * Create a new company profile
 *
 * @body {object} data - Company data
 * @body {string} data.email - Email (required)
 * @body {object} data.profile - Company information
 * @body {string} data.profile.companyName - Company name (required)
 * @body {string} data.profile.industry - Industry sector (optional)
 * @body {string} data.profile.size - Company size (optional)
 * @body {object} data.contact - Contact person info (optional)
 *
 * @returns {object} 201 - Created company profile
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Basic validation
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!data.profile?.companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Create company profile using our lib module
    const company = await createCompany(data)

    return NextResponse.json(
      {
        success: true,
        data: company
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating company profile:', error)

    // Handle specific errors
    if ((error as Error).message.includes('already exists')) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 409 } // Conflict
      )
    }

    if ((error as Error).message.includes('required')) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
