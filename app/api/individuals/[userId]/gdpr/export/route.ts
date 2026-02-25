/**
 * GDPR Data Portability — GET /api/individuals/[userId]/gdpr/export
 *
 * GDPR Art. 20 — Right to Data Portability.
 * Returns all personal data for the authenticated user in structured format.
 *
 * Supported formats: ?format=json (default) | ?format=csv
 *
 * Data included:
 *   - Account & profile
 *   - Connections (active and revoked)
 *   - Matchings (with score and status)
 *   - Audit log entries where this user is the subject
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getIndividualProfile } from '@/lib/individuals'
import { logDataAccess } from '@/lib/audit'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ userId: string }> }

function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ]
  return lines.join('\n')
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Only the owner can export their own data
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only export your own data' },
        { status: 403 }
      )
    }

    const profile = await getIndividualProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch connections
    const connections = await prisma.connection.findMany({
      where: { individualId: profile.individualId },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch matchings
    const matchings = await prisma.matching.findMany({
      where: { individualId: profile.individualId },
      select: {
        id: true,
        jobId: true,
        companyId: true,
        aiScore: true,
        aiExplanation: true,
        algorithmVersion: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        rejectedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch audit log entries where this user is the subject (GDPR Art. 15)
    const auditEntries = await prisma.auditLog.findMany({
      where: {
        details: { path: ['targetUser'], equals: userId },
      },
      select: {
        id: true,
        eventType: true,
        details: true,
        ipAddress: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 500, // Safety cap
    })

    // Log this export (GDPR Art. 5 — transparency)
    await logDataAccess({
      action: 'data_exported',
      accessedBy: userId,
      targetUser: userId,
      dataAccessed: ['profile', 'connections', 'matchings', 'audit_logs'],
      dataType: 'GDPR_Export',
      sensitivityLevel: 'high',
      reason: 'gdpr_art20_data_portability',
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    })

    const format = request.nextUrl.searchParams.get('format') ?? 'json'

    // ── JSON export ────────────────────────────────────────────────────────────
    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        gdprArticle: 'Art. 20 — Right to Data Portability',
        subject: {
          userId: profile.userId,
          email: profile.email,
          userType: profile.userType,
          createdAt: profile.createdAt,
          status: profile.status,
        },
        profile: {
          name: profile.profile.name,
          location: profile.profile.location,
          bio: profile.profile.bio,
          skills: profile.profile.skills,
          experience: profile.profile.experience,
          education: profile.profile.education,
          accommodationsNeeded: profile.profile.accommodationsNeeded,
          preferences: profile.profile.preferences,
          diagnoses: profile.profile.diagnoses,
          // Note: diagnoses are stored encrypted (AES-256-GCM) — contact support to decrypt
        },
        privacy: profile.privacy,
        assessment: profile.assessment,
        connections: connections.map(c => ({
          connectionId: c.id,
          type: c.type,
          companyId: c.companyId,
          status: c.status,
          sharedData: c.sharedData,
          consentGivenAt: c.consentGivenAt,
          revokedAt: c.revokedAt,
          revokedReason: c.revokedReason,
          pipelineStage: c.pipelineStage,
          createdAt: c.createdAt,
        })),
        matchings: matchings.map(m => ({
          matchId: m.id,
          jobId: m.jobId,
          companyId: m.companyId,
          aiScore: m.aiScore,
          aiExplanation: m.aiExplanation,
          algorithmVersion: m.algorithmVersion,
          status: m.status,
          expiresAt: m.expiresAt,
          acceptedAt: m.acceptedAt,
          rejectedAt: m.rejectedAt,
          createdAt: m.createdAt,
        })),
        auditLog: auditEntries.map(e => ({
          id: e.id,
          eventType: e.eventType,
          details: e.details,
          ipAddress: e.ipAddress,
          timestamp: e.timestamp,
        })),
        notes: {
          encryptedFields: 'diagnoses, accommodationsNeeded, and medicalHistory are stored encrypted (AES-256-GCM). Contact support@diversia.app to request plaintext.',
          retentionPolicy: 'Audit logs are retained for 7 years per GDPR Art. 5.1.e and EU AI Act Art. 12.',
        },
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="diversia-gdpr-export-${userId}-${Date.now()}.json"`,
        },
      })
    }

    // ── CSV export ─────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const profileRow: Record<string, unknown> = {
        userId: profile.userId,
        email: profile.email,
        name: profile.profile.name,
        location: profile.profile.location,
        bio: profile.profile.bio,
        skills: profile.profile.skills.join('; '),
        accommodationsNeeded: profile.profile.accommodationsNeeded.join('; '),
        createdAt: profile.createdAt,
        status: profile.status,
      }

      const connectionsRows = connections.map(c => ({
        connectionId: c.id,
        type: c.type,
        companyId: c.companyId,
        status: c.status,
        sharedData: c.sharedData.join('; '),
        consentGivenAt: c.consentGivenAt,
        revokedAt: c.revokedAt,
        pipelineStage: c.pipelineStage,
        createdAt: c.createdAt,
      }))

      const matchingsRows = matchings.map(m => ({
        matchId: m.id,
        jobId: m.jobId,
        companyId: m.companyId,
        aiScore: m.aiScore,
        status: m.status,
        acceptedAt: m.acceptedAt,
        rejectedAt: m.rejectedAt,
        createdAt: m.createdAt,
      }))

      const sections = [
        '# SECTION: PROFILE',
        toCSV([profileRow], Object.keys(profileRow)),
        '',
        '# SECTION: CONNECTIONS',
        connectionsRows.length > 0
          ? toCSV(connectionsRows, Object.keys(connectionsRows[0]))
          : 'No connections',
        '',
        '# SECTION: MATCHINGS',
        matchingsRows.length > 0
          ? toCSV(matchingsRows, Object.keys(matchingsRows[0]))
          : 'No matchings',
        '',
        `# Exported at: ${new Date().toISOString()}`,
        '# GDPR Art. 20 — Right to Data Portability — DiversIA',
      ]

      return new NextResponse(sections.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="diversia-gdpr-export-${userId}-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format. Use ?format=json or ?format=csv' }, { status: 400 })

  } catch (error) {
    console.error('[GDPR Export]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
