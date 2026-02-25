/**
 * Consent Management — GET /api/individuals/[userId]/consents
 *
 * Returns all connections (consents) for the authenticated user:
 * active, revoked, and their associated job/company details.
 *
 * Used by the Consent Management UI (GDPR Art. 7 — granular consent control).
 * The DELETE /api/consent/revoke route handles individual revocations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIndividualProfile } from '@/lib/individuals'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ userId: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own consents' },
        { status: 403 }
      )
    }

    const profile = await getIndividualProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch all connections with job info for context
    const connections = await prisma.connection.findMany({
      where: { individualId: profile.individualId },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch company names for context (best-effort — don't fail if missing)
    const companyIds = [...new Set(connections.map(c => c.companyId).filter(Boolean))] as string[]
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, industry: true },
    })
    const companyMap = new Map(companies.map(c => [c.id, c]))

    // Fetch job titles for context
    const jobIds = [...new Set(connections.map(c => c.jobId).filter(Boolean))] as string[]
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, title: true },
    })
    const jobMap = new Map(jobs.map(j => [j.id, j]))

    type CompanyRow = { id: string; name: string; industry: string | null }
    type JobRow = { id: string; title: string }
    const typedCompanyMap = companyMap as Map<string, CompanyRow>
    const typedJobMap = jobMap as Map<string, JobRow>

    const formatted = connections.map(c => {
      const company = c.companyId ? typedCompanyMap.get(c.companyId) ?? null : null
      const job = c.jobId ? typedJobMap.get(c.jobId) ?? null : null

      return {
        connectionId: c.id,
        status: c.status,             // 'active' | 'revoked'
        pipelineStage: c.pipelineStage,
        company: company
          ? { id: company.id, name: company.name, industry: company.industry }
          : { id: c.companyId, name: 'Unknown', industry: null },
        job: job
          ? { id: job.id, title: job.title }
          : { id: c.jobId, title: 'Unknown position' },
        sharedData: c.sharedData,
        customPrivacy: c.customPrivacy,
        consentGivenAt: c.consentGivenAt,
        revokedAt: c.revokedAt,
        revokedReason: c.revokedReason,
        createdAt: c.createdAt,
        // Actions available to the user
        canRevoke: c.status === 'active' && c.pipelineStage !== 'hired',
        revokeEndpoint: `POST /api/consent/revoke`,
        revokeBody: { connectionId: c.id },
      }
    })

    const active = formatted.filter(c => c.status === 'active')
    const revoked = formatted.filter(c => c.status === 'revoked')

    return NextResponse.json({
      userId,
      summary: {
        total: formatted.length,
        active: active.length,
        revoked: revoked.length,
      },
      active,
      revoked,
      gdprInfo: {
        article: 'Art. 7 — Conditions for consent',
        rightToRevoke: 'You may revoke consent for any active connection at any time. Use the revokeEndpoint provided per connection.',
        rightToErasure: 'To delete all your data, use DELETE /api/individuals/{userId}/gdpr/delete',
        rightToPortability: 'To export all your data, use GET /api/individuals/{userId}/gdpr/export',
      },
    })

  } catch (error) {
    console.error('[Consents API]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
