/**
 * Audit Logging Module (Prisma Implementation)
 * UC-017: Audit Log de Acceso a Datos Sensibles
 *
 * CRITICAL: GDPR Compliance, Data Transparency
 * Retention: 7 years (legal requirement)
 */

import prisma from './prisma'
import { addYears } from './utils.js'

/**
 * Log data access event
 * @param {object} event - Access event data
 */
export async function logDataAccess(event) {
  // Map legacy actions to Prisma Enum
  let eventType = 'PROFILE_VIEWED' // Default fallback

  const actionMap = {
    'user_login': 'USER_LOGIN',
    'user_logout': 'USER_LOGOUT',
    'password_changed': 'PASSWORD_CHANGED',
    'matching_executed': 'MATCHING_EXECUTED',
    'matching_reviewed': 'MATCHING_REVIEWED',
    'profile_viewed': 'PROFILE_VIEWED',
    'therapist_access': 'PROFILE_VIEWED', // Aggregated
    'data_exported': 'DATA_EXPORTED',
    'job_created': 'JOB_CREATED'
  }

  if (event.action && actionMap[event.action]) {
    eventType = actionMap[event.action]
  }

  const timestamp = event.timestamp || new Date()

  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: event.accessedBy, // Actor
        eventType: eventType,
        details: {
          targetUser: event.targetUser,
          dataAccessed: event.dataAccessed,
          dataType: event.dataType,
          sensitivityLevel: event.sensitivityLevel,
          reason: event.reason,
          originalAction: event.action
        },
        ipAddress: event.ipAddress || null, // Ensure your schema has ipAddress
        timestamp: timestamp,
        retentionUntil: addYears(7, timestamp),
        userNotified: true
      }
    })
    return auditLog
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Fallback? We shouldn't fail the main request if audit fails, but we should log it hard.
    return null
  }
}

/**
 * Get audit log for specific user
 */
export async function getUserAuditLog(userId, options = {}) {
  // Query Prisma where targetUser in details matches or userId matches (if actor)
  // For "My Data Access History", we want logs where I am the TARGET.
  // Prisma JSON filter support is key here.

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        path: ['details', 'targetUser'],
        equals: userId
      },
      orderBy: { timestamp: 'desc' }
    })

    // Enrich/Filter logic can be added here

    return {
      userId,
      totalEntries: logs.length,
      entries: logs
    }
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    return { userId, totalEntries: 0, entries: [] }
  }
}

// Helpers wrappers
export async function logTherapistAccess(therapistId, clientId) {
  return await logDataAccess({
    accessedBy: therapistId,
    targetUser: clientId,
    dataAccessed: ['diagnosis', 'assessment', 'profile', 'matches'],
    reason: 'client_review',
    action: 'therapist_access'
  })
}

export async function logProfileView(companyId, candidateId) {
  return await logDataAccess({
    accessedBy: companyId,
    targetUser: candidateId,
    dataAccessed: ['profile', 'skills', 'assessment'],
    reason: 'pipeline_review',
    action: 'profile_viewed'
  })
}
