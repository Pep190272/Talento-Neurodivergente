/**
 * API Routes for Individual Dashboard
 * GET /api/dashboards/individual/:userId - Get individual dashboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
