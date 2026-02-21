/**
 * API Routes for Individual Job Posting by ID
 * GET /api/companies/:companyId/jobs/:jobId - Get job details
 * PATCH /api/companies/:companyId/jobs/:jobId - Update job posting
 * DELETE /api/companies/:companyId/jobs/:jobId - Close job posting
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getJobPosting,
  updateJobPosting,
  closeJob
} from '@/lib/companies'

type RouteParams = { params: Promise<{ companyId: string; jobId: string }> }

/**
 * GET /api/companies/:companyId/jobs/:jobId
 * Get job posting details
 *
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} 200 - Job posting details
 * @returns {object} 404 - Job not found
 * @returns {object} 500 - Server error
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { companyId, jobId } = await params

    const job = await getJobPosting(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to this company
    if (job.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job does not belong to this company' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: job
    })

  } catch (error) {
    console.error('Error fetching job posting:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/companies/:companyId/jobs/:jobId
 * Update job posting
 *
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @body {object} updates - Fields to update
 * @body {string} updates.title - Job title
 * @body {string} updates.description - Job description
 * @body {Array<string>} updates.requiredSkills - Required skills
 * @body {object} updates.accommodations - Accommodations offered
 * @body {string} updates.status - Job status
 *
 * @returns {object} 200 - Updated job posting
 * @returns {object} 404 - Job not found
 * @returns {object} 403 - Forbidden (job belongs to another company)
 * @returns {object} 500 - Server error
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { companyId, jobId } = await params
    const updates = await request.json()

    // Check if job exists
    const existing = await getJobPosting(jobId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to this company
    if (existing.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job does not belong to this company' },
        { status: 403 }
      )
    }

    // Update job posting
    const updatedJob = await updateJobPosting(jobId, updates)

    return NextResponse.json({
      success: true,
      data: updatedJob
    })

  } catch (error) {
    console.error('Error updating job posting:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/companies/:companyId/jobs/:jobId
 * Close job posting (soft delete - marks as closed)
 *
 * @param {string} companyId - Company ID
 * @param {string} jobId - Job ID
 * @returns {object} 200 - Job closed successfully
 * @returns {object} 404 - Job not found
 * @returns {object} 403 - Forbidden (job belongs to another company)
 * @returns {object} 500 - Server error
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { companyId, jobId } = await params

    // Check if job exists
    const existing = await getJobPosting(jobId)
    if (!existing) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    // Verify job belongs to this company
    if (existing.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Job does not belong to this company' },
        { status: 403 }
      )
    }

    // Close job (soft delete)
    await closeJob(jobId)

    return NextResponse.json({
      success: true,
      message: 'Job posting closed successfully'
    })

  } catch (error) {
    console.error('Error closing job posting:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
