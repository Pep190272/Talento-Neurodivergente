/**
 * API Routes for Company Profile by ID
 * GET /api/companies/:companyId - Get company profile
 * PATCH /api/companies/:companyId - Update company profile
 */

import { NextResponse } from 'next/server'
import {
  getCompany,
  updateCompany
} from '@/lib/companies'

/**
 * GET /api/companies/:companyId
 * Get company profile by ID
 *
 * @param {string} companyId - Company ID
 * @returns {object} 200 - Company profile
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { companyId } = await params

    const company = await getCompany(companyId)

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company
    })

  } catch (error) {
    console.error('Error fetching company profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/companies/:companyId
 * Update company profile
 *
 * @param {string} companyId - Company ID
 * @body {object} updates - Fields to update
 * @body {object} updates.profile - Profile updates
 * @body {object} updates.contact - Contact updates
 *
 * @returns {object} 200 - Updated company profile
 * @returns {object} 404 - Profile not found
 * @returns {object} 500 - Server error
 */
export async function PATCH(request, { params }) {
  try {
    const { companyId } = await params
    const updates = await request.json()

    // Check if company exists
    const existing = await getCompany(companyId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Update company profile
    const updatedCompany = await updateCompany(companyId, updates)

    return NextResponse.json({
      success: true,
      data: updatedCompany
    })

  } catch (error) {
    console.error('Error updating company profile:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
