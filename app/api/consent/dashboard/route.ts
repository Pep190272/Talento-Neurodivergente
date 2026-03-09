/**
 * GDPR Granular Consent Management Dashboard API — Issue #58
 * GET /api/consent/dashboard — Get all consents for logged-in user
 * PUT /api/consent/dashboard — Update granular consent settings
 *
 * GDPR Art. 7: Conditions for consent
 * GDPR Art. 6: Lawfulness of processing
 *
 * Provides candidates with a centralized view of all their data sharing
 * consents, what data is shared with whom, and granular controls to
 * modify or revoke specific consents.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, AuthenticationError, ValidationError } from '@/lib/errors'
import { logDataAccess } from '@/lib/audit'
import prisma from '@/lib/prisma'

// ─── GET: Consent Dashboard ─────────────────────────────────────────────────

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const userId = session.user.id

  // Get all connections (active consents) for this user
  const connections = await prisma.connection.findMany({
    where: {
      individualId: userId,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get individual privacy settings
  const individual = await prisma.individual.findUnique({
    where: { userId },
    select: {
      privacy: true,
      diagnoses: true,
      accommodationsNeeded: true,
    },
  })

  // Map connections to consent entries
  const consents = connections.map(conn => {
    const customPrivacy = (conn.customPrivacy ?? {}) as Record<string, boolean>
    return {
      connectionId: conn.id,
      type: conn.type,
      companyId: conn.companyId,
      therapistId: conn.therapistId,
      status: conn.status,
      pipelineStage: conn.pipelineStage,
      consentGivenAt: conn.consentGivenAt,
      revokedAt: conn.revokedAt,
      revokedReason: conn.revokedReason,
      sharedData: conn.sharedData,
      granularConsents: {
        showRealName: customPrivacy.showRealName ?? true,
        shareDiagnosis: customPrivacy.shareDiagnosis ?? false,
        shareTherapistContact: customPrivacy.shareTherapistContact ?? false,
        shareAssessmentDetails: customPrivacy.shareAssessmentDetails ?? false,
        shareAccommodationNeeds: customPrivacy.shareAccommodationNeeds ?? true,
        shareSkills: customPrivacy.shareSkills ?? true,
        shareExperience: customPrivacy.shareExperience ?? true,
      },
      lastUpdated: conn.updatedAt,
    }
  })

  const privacySettings = (individual?.privacy ?? {}) as Record<string, unknown>

  return NextResponse.json({
    success: true,
    data: {
      userId,
      globalPrivacy: {
        visibleInSearch: privacySettings.visibleInSearch ?? true,
        showRealName: privacySettings.showRealName ?? true,
        shareDiagnosis: privacySettings.shareDiagnosis ?? false,
        shareTherapistContact: privacySettings.shareTherapistContact ?? false,
        shareAssessmentDetails: privacySettings.shareAssessmentDetails ?? false,
      },
      consents,
      summary: {
        totalConnections: connections.length,
        activeConsents: connections.filter(c => c.status === 'active').length,
        revokedConsents: connections.filter(c => c.status === 'revoked').length,
        dataCategories: {
          sensitiveDataShared: consents.some(c => c.granularConsents.shareDiagnosis),
          therapistContactShared: consents.some(c => c.granularConsents.shareTherapistContact),
        },
      },
      rights: {
        modify: 'PUT /api/consent/dashboard — Update specific consent settings',
        revoke: 'POST /api/consent/revoke — Revoke an active consent',
        export: `GET /api/individuals/${userId}/gdpr/export — Export all your data`,
        delete: `DELETE /api/individuals/${userId}/gdpr/delete — Request data deletion`,
        complaint: 'Contact your national Data Protection Authority',
      },
    },
  })
})

// ─── PUT: Update Granular Consents ───────────────────────────────────────────

export const PUT = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const body = await req.json()
  const { connectionId, globalPrivacy, granularConsents } = body

  // Update global privacy settings
  if (globalPrivacy) {
    const allowed = ['visibleInSearch', 'showRealName', 'shareDiagnosis', 'shareTherapistContact', 'shareAssessmentDetails']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (typeof globalPrivacy[key] === 'boolean') {
        updates[key] = globalPrivacy[key]
      }
    }

    if (Object.keys(updates).length > 0) {
      const individual = await prisma.individual.findUnique({
        where: { userId: session.user.id },
        select: { id: true, privacy: true },
      })

      if (individual) {
        const currentPrivacy = (individual.privacy ?? {}) as Record<string, unknown>
        await prisma.individual.update({
          where: { id: individual.id },
          data: {
            privacy: JSON.parse(JSON.stringify({ ...currentPrivacy, ...updates })),
          },
        })

        await logDataAccess({
          action: 'consent_given',
          accessedBy: session.user.id,
          targetUser: session.user.id,
          dataAccessed: Object.keys(updates),
          reason: 'privacy_settings_updated',
        })
      }
    }
  }

  // Update connection-specific (granular) consents
  if (connectionId && granularConsents) {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) throw new ValidationError('Connection not found')
    if (connection.individualId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentPrivacy = (connection.customPrivacy ?? {}) as Record<string, boolean>
    const allowed = ['showRealName', 'shareDiagnosis', 'shareTherapistContact', 'shareAssessmentDetails', 'shareAccommodationNeeds', 'shareSkills', 'shareExperience']
    const updates: Record<string, boolean> = {}
    for (const key of allowed) {
      if (typeof granularConsents[key] === 'boolean') {
        updates[key] = granularConsents[key]
      }
    }

    // Determine shared data fields based on consent
    const sharedData: string[] = ['name']
    if (updates.shareSkills ?? currentPrivacy.shareSkills ?? true) sharedData.push('skills')
    if (updates.shareExperience ?? currentPrivacy.shareExperience ?? true) sharedData.push('experience')
    if (updates.shareAccommodationNeeds ?? currentPrivacy.shareAccommodationNeeds ?? true) sharedData.push('accommodations')
    if (updates.shareDiagnosis ?? currentPrivacy.shareDiagnosis ?? false) sharedData.push('diagnosis')
    if (updates.shareAssessmentDetails ?? currentPrivacy.shareAssessmentDetails ?? false) sharedData.push('assessment')
    if (updates.shareTherapistContact ?? currentPrivacy.shareTherapistContact ?? false) sharedData.push('therapist_contact')

    await prisma.connection.update({
      where: { id: connectionId },
      data: {
        customPrivacy: { ...currentPrivacy, ...updates },
        sharedData,
      },
    })

    await logDataAccess({
      action: 'consent_given',
      accessedBy: session.user.id,
      targetUser: session.user.id,
      dataAccessed: Object.keys(updates),
      reason: `consent_updated_connection_${connectionId}`,
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Consent settings updated successfully',
  })
})
