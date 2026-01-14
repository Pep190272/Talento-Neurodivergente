/**
 * API Routes for Candidate Matching
 * GET /api/matching/candidates/:userId - Get job matches for a candidate
 */

import { NextResponse } from 'next/server'
import { getIndividualProfile } from '@/lib/individuals'
import { findMatchesForCandidate } from '@/lib/matching'

/**
 * GET /api/matching/candidates/:userId
 * Find job matches for a specific candidate
 *
 * @param {string} userId - User/Candidate ID
 * @query {number} minScore - Minimum match score (0-1) to include in results
 * @query {number} limit - Maximum number of results to return
 *
 * @returns {object} 200 - Array of job matches with scores
 * @returns {object} 404 - Candidate not found
 * @returns {object} 500 - Server error
 */
export async function GET(request, { params }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const limit = parseInt(searchParams.get('limit') || '0')

    // Check if candidate exists
    const profile = await getIndividualProfile(userId)
    if (!profile) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      )
    }

    // Find matches
    let matches = await findMatchesForCandidate(userId)

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
    console.error('Error finding matches for candidate:', error)

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
