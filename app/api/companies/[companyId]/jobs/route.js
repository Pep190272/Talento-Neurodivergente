/**
 * API Routes for Company Job Postings
 * POST /api/companies/:companyId/jobs - Create new job posting
 * GET /api/companies/:companyId/jobs - List all jobs for company
 */

import { NextResponse } from 'next/server'
import {
  getCompany,
  createJobPosting,
  getCompanyJobs
} from '@/lib/companies'

/**
 * POST /api/companies/:companyId/jobs
 * Create a new job posting for a company
 *
 * @param {string} companyId - Company ID
 * @body {object} jobData - Job posting data
 * @body {string} jobData.title - Job title (required)
 * @body {string} jobData.description - Job description (required)
 * @body {Array<string>} jobData.requiredSkills - Required skills (optional)
 * @body {object} jobData.accommodations - Accommodations offered (optional)
 * @body {string} jobData.location - Job location (optional)
 * @body {string} jobData.workMode - Work mode: remote, hybrid, onsite (optional)
 *
 * @returns {object} 201 - Created job posting
 * @returns {object} 400 - Validation error
 * @returns {object} 404 - Company not found
 * @returns {object} 500 - Server error
 */
export async function POST(request, { params }) {
  try {
    const { companyId } = await params
    const jobData = await request.json()

    // Check if company exists
    const company = await getCompany(companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Basic validation
    if (!jobData.title) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    if (!jobData.description) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Create job posting
    const job = await createJobPosting(companyId, jobData)

    return NextResponse.json(
      {
        success: true,
        data: job
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating job posting:', error)

    // Handle specific errors
    if (error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/companies/:companyId/jobs
 * Get all job postings for a company
 *
 * @param {string} companyId - Company ID
 * @query {string} status - Filter by status: active, closed, all (default: active)
 *
 * @returns {object} 200 - List of job postings
 * @returns {object} 404 - Company not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { companyId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    // Check if company exists
    const company = await getCompany(companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get company jobs
    const jobs = await getCompanyJobs(companyId, { status })

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length
    })

  } catch (error) {
    console.error('Error fetching company jobs:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
