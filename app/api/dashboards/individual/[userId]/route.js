/**
 * API Routes for Individual Dashboard
 * GET /api/dashboards/individual/:userId - Get individual dashboard data
 */

import { NextResponse } from 'next/server'
import { getIndividualDashboard } from '@/lib/dashboards'

/**
 * GET /api/dashboards/individual/:userId
 * Get dashboard data for an individual candidate
 *
 * @param {string} userId - User/Candidate ID
 * @returns {object} 200 - Dashboard data with profile, stats, matches, and consents
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await params

    // Get dashboard data
    const dashboard = await getIndividualDashboard(userId)

    if (!dashboard) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dashboard
    })

  } catch (error) {
    console.error('Error fetching individual dashboard:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
