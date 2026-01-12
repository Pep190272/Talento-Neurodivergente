/**
 * Audit Logging Module
 * UC-017: Audit Log de Acceso a Datos Sensibles
 *
 * CRITICAL: GDPR Compliance, Data Transparency
 * Retention: 7 years (legal requirement)
 * Logs are NEVER deleted, even if user deletes account
 */

import {
  generateAuditId,
  classifySensitivity,
  determineDataType,
  addYears
} from './utils.js'

import {
  saveToFile,
  getAuditLogFilePath,
  getAuditLogsForUser,
  findAll
} from './storage.js'

/**
 * Log data access event
 * @param {object} event - Access event data
 * @param {string} event.accessedBy - Entity accessing the data (companyId/therapistId/adminId)
 * @param {string} event.targetUser - User whose data was accessed
 * @param {Array<string>} event.dataAccessed - Fields accessed
 * @param {string} event.reason - Reason for access (required)
 * @param {string} event.ipAddress - IP address (optional)
 * @param {Date} event.timestamp - Timestamp (optional, defaults to now)
 * @returns {object} - Created audit log entry
 */
export async function logDataAccess(event) {
  // Validate required fields
  if (!event.reason) {
    throw new Error('Reason is required for accessing sensitive data')
  }

  if (!event.accessedBy || !event.targetUser || !event.dataAccessed) {
    throw new Error('Missing required fields: accessedBy, targetUser, dataAccessed')
  }

  // Generate audit log ID
  const logId = generateAuditId()

  // Classify sensitivity and data type
  const sensitivityLevel = classifySensitivity(event.dataAccessed)
  const dataType = determineDataType(event.dataAccessed)

  // Create audit log entry
  const timestamp = event.timestamp || new Date()

  const auditLog = {
    logId,
    accessedBy: event.accessedBy,
    targetUser: event.targetUser,
    dataAccessed: event.dataAccessed,
    dataType,
    sensitivityLevel,
    reason: event.reason,
    action: event.action || 'data_accessed',
    ipAddress: event.ipAddress || null,
    timestamp,
    retentionUntil: addYears(7, timestamp), // GDPR: 7-year retention
    userNotified: true // Users are informed via audit log view
  }

  // Save audit log
  const auditFilePath = getAuditLogFilePath(event.targetUser, logId)
  await saveToFile(auditFilePath, auditLog)

  return auditLog
}

/**
 * Get audit log for specific user (user's own view)
 * @param {string} userId - User ID
 * @param {object} options - Filter options
 * @param {Date} options.startDate - Start date filter
 * @param {Date} options.endDate - End date filter
 * @param {string} options.dataType - Data type filter
 * @returns {object} - User audit log with entries
 */
export async function getUserAuditLog(userId, options = {}) {
  let logs = await getAuditLogsForUser(userId)

  // Apply filters
  if (options.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(options.startDate))
  }

  if (options.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(options.endDate))
  }

  if (options.dataType) {
    logs = logs.filter(log =>
      log.dataAccessed && log.dataAccessed.includes(options.dataType)
    )
  }

  // Enrich logs with friendly names
  const enrichedLogs = []

  for (const log of logs) {
    try {
      let accessedByName = 'Unknown'

      if (log.accessedBy) {
        if (log.accessedBy.startsWith('comp_')) {
          const { getCompany } = await import('./companies.js')
          const company = await getCompany(log.accessedBy)
          accessedByName = company ? company.profile.name : 'Unknown Company'
        } else if (log.accessedBy.startsWith('ther_')) {
          const { getTherapist } = await import('./therapists.js')
          const therapist = await getTherapist(log.accessedBy)
          accessedByName = therapist ? therapist.profile.name : 'Unknown Therapist'
        }
      }

      enrichedLogs.push({
        ...log,
        accessedByName
      })
    } catch (error) {
      enrichedLogs.push(log)
    }
  }

  return {
    userId,
    totalEntries: enrichedLogs.length,
    entries: enrichedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
}

/**
 * Get audit log for admin/compliance view
 * @param {string} adminId - Admin user ID
 * @param {object} options - Query options
 * @param {string} options.adminRole - Admin role (for authorization)
 * @param {string} options.userId - Filter by specific user
 * @param {Date} options.startDate - Start date
 * @param {Date} options.endDate - End date
 * @returns {object} - Audit log entries (with sensitive data redacted)
 */
export async function getAuditLog(adminId, options = {}) {
  // Admin authorization check (simplified - would be more robust in production)
  if (!options.adminRole || options.adminRole !== 'compliance_officer') {
    throw new Error('Unauthorized: Admin access required')
  }

  let logs = []

  if (options.userId) {
    logs = await getAuditLogsForUser(options.userId)
  } else {
    // Get all audit logs (would need pagination in production)
    logs = await findAll('audit_logs', () => true)
  }

  // Apply date filters
  if (options.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(options.startDate))
  }

  if (options.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(options.endDate))
  }

  // Redact sensitive data in admin view
  const redactedLogs = logs.map(log => ({
    ...log,
    // Admin can see that diagnosis was accessed, but not the actual diagnosis
    actualDiagnosis: undefined,
    actualData: undefined
  }))

  return {
    adminId,
    totalEntries: redactedLogs.length,
    entries: redactedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
}

/**
 * Export audit log for compliance
 * @param {string} adminId - Admin user ID
 * @param {object} options - Export options
 * @param {string} options.format - Export format (csv/json)
 * @param {object} options.dateRange - Date range {start, end}
 * @returns {object} - Exported data
 */
export async function exportAuditLog(adminId, options = {}) {
  const format = options.format || 'csv'
  const dateRange = options.dateRange || {}

  let logs = await findAll('audit_logs', () => true)

  // Apply date range
  if (dateRange.start) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(dateRange.start))
  }

  if (dateRange.end) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(dateRange.end))
  }

  // Format data
  let exportedData

  if (format === 'csv') {
    // CSV format
    const headers = [
      'logId',
      'timestamp',
      'accessedBy',
      'targetUser',
      'dataType',
      'sensitivityLevel',
      'reason',
      'action'
    ].join(',')

    const rows = logs.map(log =>
      [
        log.logId,
        log.timestamp,
        log.accessedBy,
        log.targetUser,
        log.dataType,
        log.sensitivityLevel,
        log.reason,
        log.action
      ].join(',')
    )

    exportedData = [headers, ...rows].join('\n')
  } else {
    // JSON format
    exportedData = JSON.stringify(logs, null, 2)
  }

  const timestamp = Date.now()
  const filename = `audit_log_${timestamp}.${format}`

  return {
    format,
    filename,
    data: exportedData,
    totalRecords: logs.length,
    exportedAt: new Date(),
    exportedBy: adminId
  }
}

/**
 * Export user audit log (GDPR right to data portability)
 * @param {string} userId - User ID
 * @param {object} options - Export options
 * @param {string} options.format - Export format (json/csv)
 * @returns {object} - Exported user audit log
 */
export async function exportUserAuditLog(userId, options = {}) {
  const format = options.format || 'json'

  const userLog = await getUserAuditLog(userId)

  let exportedData

  if (format === 'json') {
    exportedData = JSON.stringify(userLog, null, 2)
  } else {
    // CSV format
    const headers = [
      'timestamp',
      'accessedBy',
      'accessedByName',
      'dataAccessed',
      'reason',
      'sensitivityLevel'
    ].join(',')

    const rows = userLog.entries.map(log =>
      [
        log.timestamp,
        log.accessedBy,
        log.accessedByName,
        log.dataAccessed.join(';'),
        log.reason,
        log.sensitivityLevel
      ].join(',')
    )

    exportedData = [headers, ...rows].join('\n')
  }

  return {
    format,
    data: exportedData,
    totalRecords: userLog.totalEntries,
    exportedAt: new Date()
  }
}

/**
 * Log consent event (auto-triggered on match acceptance)
 * @param {object} event - Consent event
 * @param {string} event.userId - User ID
 * @param {string} event.targetEntity - Company/therapist ID
 * @param {Array<string>} event.sharedData - Data being shared
 * @returns {object} - Created audit log
 */
export async function logConsentGiven(event) {
  const logId = generateAuditId()

  const auditLog = {
    logId,
    action: 'consent_given',
    userId: event.userId,
    targetEntity: event.targetEntity,
    sharedData: event.sharedData,
    timestamp: new Date(),
    retentionUntil: addYears(7)
  }

  const auditFilePath = getAuditLogFilePath(event.userId, logId)
  await saveToFile(auditFilePath, auditLog)

  return auditLog
}

/**
 * Log consent revocation (auto-triggered on revoke)
 * @param {object} event - Revocation event
 * @param {string} event.userId - User ID
 * @param {string} event.targetEntity - Company/therapist ID
 * @param {Array<string>} event.revokedData - Data being revoked
 * @returns {object} - Created audit log
 */
export async function logConsentRevoked(event) {
  const logId = generateAuditId()

  const auditLog = {
    logId,
    action: 'consent_revoked',
    userId: event.userId,
    targetEntity: event.targetEntity,
    revokedData: event.revokedData,
    timestamp: new Date(),
    retentionUntil: addYears(7)
  }

  const auditFilePath = getAuditLogFilePath(event.userId, logId)
  await saveToFile(auditFilePath, auditLog)

  return auditLog
}

/**
 * Log therapist access to client data
 * @param {string} therapistId - Therapist ID
 * @param {string} clientId - Client user ID
 * @returns {object} - Created audit log
 */
export async function logTherapistAccess(therapistId, clientId) {
  return await logDataAccess({
    accessedBy: therapistId,
    targetUser: clientId,
    dataAccessed: ['diagnosis', 'assessment', 'profile', 'matches'],
    reason: 'client_review',
    action: 'therapist_access'
  })
}

/**
 * Log profile view by company
 * @param {string} companyId - Company ID
 * @param {string} candidateId - Candidate user ID
 * @returns {object} - Created audit log
 */
export async function logProfileView(companyId, candidateId) {
  return await logDataAccess({
    accessedBy: companyId,
    targetUser: candidateId,
    dataAccessed: ['profile', 'skills', 'assessment'],
    reason: 'pipeline_review',
    action: 'profile_viewed'
  })
}

/**
 * Detect anomalous access patterns
 * @param {string} entityId - Entity to check (companyId/therapistId)
 * @returns {Array<object>} - Array of detected anomalies
 */
export async function detectAnomalies(entityId) {
  const allLogs = await findAll('audit_logs', log => log.accessedBy === entityId)

  const anomalies = []

  // Check for excessive access (100+ accesses in 1 hour)
  const oneHourAgo = new Date(Date.now() - 3600000)
  const recentAccesses = allLogs.filter(log => new Date(log.timestamp) >= oneHourAgo)

  if (recentAccesses.length >= 100) {
    anomalies.push({
      type: 'excessive_access',
      severity: 'high',
      description: 'Unusually high access frequency',
      count: recentAccesses.length,
      timeframe: '1 hour'
    })
  }

  // Check for repeated access to same user
  const accessCounts = {}
  recentAccesses.forEach(log => {
    accessCounts[log.targetUser] = (accessCounts[log.targetUser] || 0) + 1
  })

  Object.entries(accessCounts).forEach(([userId, count]) => {
    if (count >= 50) {
      anomalies.push({
        type: 'repeated_user_access',
        severity: 'medium',
        description: `Accessed same user ${count} times in short period`,
        targetUser: userId
      })
    }
  })

  return anomalies
}

/**
 * Get security alerts for admin
 * @param {string} adminId - Admin user ID
 * @returns {Array<object>} - Array of security alerts
 */
export async function getSecurityAlerts(adminId) {
  const alerts = []

  // Get all recent logs (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 86400000)
  const recentLogs = await findAll('audit_logs', log => new Date(log.timestamp) >= oneDayAgo)

  // Check for unusual access patterns by user
  const userAccessCounts = {}

  recentLogs.forEach(log => {
    const key = log.targetUser
    userAccessCounts[key] = userAccessCounts[key] || { count: 0, accessors: new Set() }
    userAccessCounts[key].count += 1
    userAccessCounts[key].accessors.add(log.accessedBy)
  })

  // Alert if same user accessed by 3+ different entities
  Object.entries(userAccessCounts).forEach(([userId, data]) => {
    if (data.accessors.size >= 3) {
      alerts.push({
        type: 'unusual_access_pattern',
        severity: 'medium',
        affectedUser: userId,
        description: `User data accessed by ${data.accessors.size} different entities`,
        accessorCount: data.accessors.size
      })
    }
  })

  return alerts
}

/**
 * Get log file path for user (for testing)
 * @param {string} userId - User ID
 * @returns {string} - Log file path pattern
 */
export async function getLogFilePath(userId) {
  const userHash = userId.substring(0, 2)
  return `data/audit_logs/${userHash}/${userId}_*.json`
}
