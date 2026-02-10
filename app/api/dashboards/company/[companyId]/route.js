/**
 * API Routes for Company Dashboard
 * GET /api/dashboards/company/:companyId - Get company dashboard data
 */

import { NextResponse } from 'next/server'
import { getCompanyDashboard } from '@/lib/dashboards'

/**
 * GET /api/dashboards/company/:companyId
 * Get dashboard data for a company
 *
 * @param {string} companyId - Company ID
 * @returns {object} 200 - Dashboard data with profile, stats, jobs, and matches
 * @returns {object} 404 - Company not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { companyId } = await params

    // Get dashboard data
    const dashboard = await getCompanyDashboard(companyId)

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dashboard
    })

  } catch (error) {
    console.error('Error fetching company dashboard:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
