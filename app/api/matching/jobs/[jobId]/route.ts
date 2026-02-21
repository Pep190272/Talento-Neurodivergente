/**
 * API Routes for Job Matching
 * GET /api/matching/jobs/:jobId - Get candidate matches for a job
 */

import { NextRequest, NextResponse } from 'next/server'
import { getJobPosting } from '@/lib/companies'
import { findMatchesForJob } from '@/lib/matching'

/**
 * GET /api/matching/jobs/:jobId
 * Find candidate matches for a specific job posting
 *
 * @param {string} jobId - Job ID
 * @query {number} minScore - Minimum match score (0-1) to include in results
 * @query {number} limit - Maximum number of results to return
 *
 * @returns {object} 200 - Array of candidate matches with scores
 * @returns {object} 404 - Job not found
 * @returns {object} 500 - Server error
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const { searchParams } = new URL(request.url)
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const limit = parseInt(searchParams.get('limit') || '0')

    // Check if job exists
    const job = await getJobPosting(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    // Find matches
    let matches = await findMatchesForJob(jobId)

    // Apply filters
    if (minScore > 0) {
      matches = matches.filter(match => match.score >= minScore)
    }

    if (limit > 0) {
      matches = matches.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length
    })

  } catch (error) {
    console.error('Error finding matches for job:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
