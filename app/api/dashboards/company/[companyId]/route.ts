/**
 * API Routes for Company Dashboard
 * GET /api/dashboards/company/:companyId - Get company dashboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findCompanyByUserId } from '@/lib/repositories/company.repository'
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
export async function GET(request: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId } = await params

    const company = await findCompanyByUserId(session.user.id)
    if (!company || company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
