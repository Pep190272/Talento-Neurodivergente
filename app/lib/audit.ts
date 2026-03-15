/**
 * Audit Logging Module
 * UC-017: Audit Log de Acceso a Datos Sensibles
 *
 * GDPR Art. 5.1.f — Integridad y confidencialidad
 * EU AI Act Art. 12 — Registro de eventos de sistemas de IA de alto riesgo
 * Retención: 7 años (requisito legal)
 */

import { AuditEventType, type Prisma } from '@prisma/client'
import prisma from './prisma'
import { addYears } from './utils.js'

// ============================================================
// TIPOS
// ============================================================

interface AuditEvent {
  action: string
  accessedBy?: string   // userId del actor
  targetUser?: string   // userId del afectado
  dataAccessed?: string[]
  dataType?: string
  sensitivityLevel?: string
  reason?: string
  ipAddress?: string
  timestamp?: Date
  userNotified?: boolean
  // Campos EU AI Act
  aiSystemName?: string
  aiDecisionId?: string
  algorithmVersion?: string
}

// Mapeo de acciones legacy a AuditEventType del schema
const ACTION_MAP: Record<string, AuditEventType> = {
  user_login:              AuditEventType.USER_LOGIN,
  user_logout:             AuditEventType.USER_LOGOUT,
  password_changed:        AuditEventType.PASSWORD_CHANGED,
  account_deactivated:     AuditEventType.ACCOUNT_DEACTIVATED,
  profile_viewed:          AuditEventType.PROFILE_VIEWED,
  therapist_access:        AuditEventType.THERAPIST_ACCESS,
  data_exported:           AuditEventType.DATA_EXPORTED,
  data_deleted:            AuditEventType.DATA_DELETED,
  data_breach_notified:    AuditEventType.DATA_BREACH_NOTIFIED,
  consent_given:           AuditEventType.CONSENT_GIVEN,
  consent_revoked:         AuditEventType.CONSENT_REVOKED,
  matching_executed:       AuditEventType.MATCHING_EXECUTED,
  matching_reviewed:       AuditEventType.MATCHING_REVIEWED,
  ai_decision_made:        AuditEventType.AI_DECISION_MADE,
  ai_decision_overridden:  AuditEventType.AI_DECISION_OVERRIDDEN,
  bias_check_executed:     AuditEventType.BIAS_CHECK_EXECUTED,
  job_created:             AuditEventType.JOB_CREATED,
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

/**
 * Registra un evento de auditoría en la base de datos.
 * No lanza excepciones — siempre intenta guardar y falla silenciosamente
 * para no interrumpir el flujo principal del usuario.
 */
export async function logDataAccess(event: AuditEvent) {
  const eventType: AuditEventType =
    ACTION_MAP[event.action] ?? AuditEventType.PROFILE_VIEWED

  const timestamp = event.timestamp ?? new Date()

  const details: Prisma.InputJsonValue = {
    targetUser:       event.targetUser    ?? null,
    dataAccessed:     event.dataAccessed  ?? [],
    dataType:         event.dataType      ?? null,
    sensitivityLevel: event.sensitivityLevel ?? null,
    reason:           event.reason        ?? null,
    originalAction:   event.action,
    // EU AI Act traceability
    aiSystemName:     event.aiSystemName  ?? null,
    aiDecisionId:     event.aiDecisionId  ?? null,
    algorithmVersion: event.algorithmVersion ?? null,
  }

  try {
    return await prisma.auditLog.create({
      data: {
        userId:         event.accessedBy ?? null,
        eventType,
        details,
        ipAddress:      event.ipAddress ?? null,
        userNotified:   event.userNotified ?? false,
        timestamp,
        retentionUntil: addYears(7, timestamp),
      },
    })
  } catch (error) {
    // Audit failure nunca debe romper la request principal
    console.error('[AuditLog] Failed to write audit entry:', error)
    return null
  }
}

// ============================================================
// CONSULTAS
// ============================================================

/**
 * Historial de auditoría de un usuario (como sujeto de datos).
 * GDPR Art. 15 — Derecho de acceso.
 */
export async function getUserAuditLog(userId: string) {
  try {
    // Búsqueda correcta con Prisma JSON filter (path dentro de details)
    const logs = await prisma.auditLog.findMany({
      where: {
        details: {
          path: ['targetUser'],
          equals: userId,
        },
      },
      orderBy: { timestamp: 'desc' },
    })

    return {
      userId,
      totalEntries: logs.length,
      entries: logs,
    }
  } catch (error) {
    console.error('[AuditLog] Error fetching user audit logs:', error)
    return { userId, totalEntries: 0, entries: [] }
  }
}

/**
 * Todos los eventos de IA para un matching concreto.
 * EU AI Act Art. 12 — Registro de sistemas de IA.
 */
export async function getAIAuditTrailForMatching(matchingId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: {
        eventType: {
          in: [
            AuditEventType.MATCHING_EXECUTED,
            AuditEventType.MATCHING_REVIEWED,
            AuditEventType.AI_DECISION_MADE,
            AuditEventType.AI_DECISION_OVERRIDDEN,
          ],
        },
        details: {
          path: ['aiDecisionId'],
          equals: matchingId,
        },
      },
      orderBy: { timestamp: 'asc' },
    })
  } catch (error) {
    console.error('[AuditLog] Error fetching AI audit trail:', error)
    return []
  }
}

// ============================================================
// HELPERS DE CONVENIENCIA
// ============================================================

export async function logTherapistAccess(therapistId: string, clientId: string, ipAddress?: string) {
  return logDataAccess({
    action:       'therapist_access',
    accessedBy:   therapistId,
    targetUser:   clientId,
    dataAccessed: ['diagnosis', 'assessment', 'profile', 'matches'],
    reason:       'client_review',
    ipAddress,
  })
}

export async function logProfileView(companyId: string, candidateId: string, ipAddress?: string) {
  return logDataAccess({
    action:       'profile_viewed',
    accessedBy:   companyId,
    targetUser:   candidateId,
    dataAccessed: ['profile', 'skills', 'assessment'],
    reason:       'pipeline_review',
    ipAddress,
  })
}

/**
 * Consulta de auditoría filtrada por usuario y tipo de acción.
 * Usado por tests de privacidad para verificar que accesos se registran.
 */
export async function getAuditLog(userId: string, actionFilter?: string) {
  try {
    const where: Prisma.AuditLogWhereInput = {
      details: {
        path: ['targetUser'],
        equals: userId,
      },
    }

    // Si hay filtro de acción, añadir condición sobre originalAction en details
    if (actionFilter) {
      where.AND = [
        {
          details: {
            path: ['originalAction'],
            equals: actionFilter,
          },
        },
      ]
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    })

    return logs.map(log => {
      const details = log.details as Record<string, unknown>
      return {
        id: log.id,
        action: details.originalAction ?? log.eventType,
        accessedBy: log.userId,
        targetUser: details.targetUser,
        dataAccessed: details.dataAccessed ?? [],
        dataType: details.dataType,
        sensitivityLevel: details.sensitivityLevel,
        reason: details.reason,
        timestamp: log.timestamp,
        connectionId: details.connectionId ?? null,
        ipAddress: log.ipAddress,
      }
    })
  } catch (error) {
    console.error('[AuditLog] Error fetching audit logs:', error)
    return []
  }
}

/**
 * Exportar log de auditoría completo para un usuario.
 * GDPR Art. 15 — Derecho de acceso: el sujeto puede pedir todos los registros
 * sobre su persona en formato estructurado y legible.
 */
export async function exportAuditLog(userId: string) {
  try {
    const logs = await getAuditLog(userId)
    const userLogs = await getUserAuditLog(userId)

    return {
      exportedAt: new Date(),
      userId,
      format: 'json',
      totalEntries: userLogs.totalEntries,
      entries: logs,
      metadata: {
        gdprArticle: 'Art. 15 - Right of Access',
        retentionPolicy: '7 years',
        exportRequestedAt: new Date(),
      },
    }
  } catch (error) {
    console.error('[AuditLog] Error exporting audit log:', error)
    return {
      exportedAt: new Date(),
      userId,
      format: 'json',
      totalEntries: 0,
      entries: [],
      metadata: { error: 'Export failed' },
    }
  }
}

/** EU AI Act Art. 22 — Notificación formal de decisión automatizada al candidato */
export async function logAIDecision(params: {
  matchingId: string
  candidateId: string
  aiScore: number
  algorithmVersion: string
  ipAddress?: string
}) {
  return logDataAccess({
    action:           'ai_decision_made',
    targetUser:       params.candidateId,
    aiDecisionId:     params.matchingId,
    algorithmVersion: params.algorithmVersion,
    aiSystemName:     'DiversIA-Matching',
    dataAccessed:     ['matching_score', 'ai_factors'],
    reason:           'automated_matching',
    userNotified:     true,
    ipAddress:        params.ipAddress,
  })
}

/** EU AI Act Art. 14 — Registro de revisión humana */
export async function logHumanOversight(params: {
  matchingId: string
  reviewerId: string
  decision: 'approved' | 'rejected' | 'overridden'
  notes?: string
  ipAddress?: string
}) {
  const action = params.decision === 'overridden'
    ? 'ai_decision_overridden'
    : 'matching_reviewed'

  return logDataAccess({
    action,
    accessedBy:   params.reviewerId,
    aiDecisionId: params.matchingId,
    reason:       `human_review_${params.decision}`,
    dataAccessed: ['matching_score', 'ai_factors', 'review_notes'],
    ipAddress:    params.ipAddress,
  })
}

/** GDPR Art. 17 — Derecho al olvido */
export async function logDataDeletion(params: {
  deletedUserId: string
  requestedBy: string
  ipAddress?: string
}) {
  return logDataAccess({
    action:      'data_deleted',
    accessedBy:  params.requestedBy,
    targetUser:  params.deletedUserId,
    reason:      'gdpr_right_to_erasure',
    ipAddress:   params.ipAddress,
    userNotified: true,
  })
}
