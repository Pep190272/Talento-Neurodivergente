/**
 * GDPR Data Retention Policy — DiversIA
 *
 * GDPR Art. 5.1.e — Storage limitation: data kept only as long as necessary.
 * EU AI Act Art. 12 — AI system logs retained minimum 10 years for high-risk systems.
 *
 * Retention periods defined here:
 *   - Audit logs:              7 years  (GDPR Art. 5 + EU AI Act Art. 12)
 *   - Deleted user records:    30 days  (then hard-delete anonymized rows)
 *   - Expired matchings:       90 days  (WITHDRAWN/REJECTED)
 *   - Revoked connections:     90 days
 *   - Form submissions:        1 year
 *
 * Usage:
 *   Run `purgeExpiredData()` via cron job (daily, off-peak hours).
 *   Or call individual purge functions as needed.
 */

import prisma from './prisma'

// ─── Retention Periods ────────────────────────────────────────────────────────

export const RETENTION_DAYS = {
  auditLogs: 7 * 365,        // 7 years (set per-record in retentionUntil field)
  deletedUsers: 30,          // 30 days after soft-delete before hard purge
  expiredMatchings: 90,      // 90 days for WITHDRAWN/REJECTED
  revokedConnections: 90,    // 90 days for revoked connections
  formSubmissions: 365,      // 1 year
} as const

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000)
}

// ─── Purge Functions ──────────────────────────────────────────────────────────

/**
 * Purge AuditLog entries past their `retentionUntil` date.
 * These are entries the system itself marked for deletion.
 */
export async function purgeExpiredAuditLogs(): Promise<number> {
  const result = await prisma.auditLog.deleteMany({
    where: { retentionUntil: { lt: new Date() } },
  })
  return result.count
}

/**
 * Hard-delete anonymized Individual/User records older than 30 days.
 * These were soft-deleted via GDPR Right to Erasure.
 */
export async function purgeDeletedUsers(): Promise<number> {
  const cutoff = daysAgo(RETENTION_DAYS.deletedUsers)

  // Find anonymized users (marked with deleted_<id>@anonymized.local email)
  const deletedUsers = await prisma.user.findMany({
    where: {
      email: { contains: '@anonymized.local' },
      updatedAt: { lt: cutoff },
    },
    select: { id: true },
  })

  if (deletedUsers.length === 0) return 0

  const ids = deletedUsers.map(u => u.id)

  // Delete in cascade order (Prisma onDelete: Cascade handles Individual → Connection/Matching)
  await prisma.user.deleteMany({ where: { id: { in: ids } } })

  return ids.length
}

/**
 * Purge WITHDRAWN/REJECTED matchings older than 90 days.
 * Keeps the record structure but removes candidate PII snapshot.
 * (Full deletion would break historical statistics — anonymize instead.)
 */
export async function purgeExpiredMatchings(): Promise<number> {
  const cutoff = daysAgo(RETENTION_DAYS.expiredMatchings)

  const result = await prisma.matching.updateMany({
    where: {
      status: { in: ['WITHDRAWN', 'REJECTED'] },
      updatedAt: { lt: cutoff },
      candidateData: { not: {} },
    },
    data: { candidateData: {} },
  })

  return result.count
}

/**
 * Purge revoked Connection records older than 90 days.
 */
export async function purgeRevokedConnections(): Promise<number> {
  const cutoff = daysAgo(RETENTION_DAYS.revokedConnections)

  const result = await prisma.connection.deleteMany({
    where: {
      status: 'revoked',
      revokedAt: { lt: cutoff },
    },
  })

  return result.count
}

/**
 * Purge FormSubmission records older than 1 year.
 */
export async function purgeOldFormSubmissions(): Promise<number> {
  const cutoff = daysAgo(RETENTION_DAYS.formSubmissions)

  const result = await prisma.formSubmission.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })

  return result.count
}

// ─── Master Purge ─────────────────────────────────────────────────────────────

export interface PurgeResult {
  auditLogs: number
  deletedUsers: number
  expiredMatchings: number
  revokedConnections: number
  formSubmissions: number
  executedAt: Date
}

/**
 * Run all retention purges in sequence.
 * Intended to be called by a scheduled job (e.g., daily cron at 02:00 UTC).
 *
 * @returns Summary of rows affected per category.
 */
export async function purgeExpiredData(): Promise<PurgeResult> {
  const [auditLogs, deletedUsers, expiredMatchings, revokedConnections, formSubmissions] =
    await Promise.all([
      purgeExpiredAuditLogs(),
      purgeDeletedUsers(),
      purgeExpiredMatchings(),
      purgeRevokedConnections(),
      purgeOldFormSubmissions(),
    ])

  const result: PurgeResult = {
    auditLogs,
    deletedUsers,
    expiredMatchings,
    revokedConnections,
    formSubmissions,
    executedAt: new Date(),
  }

  console.info('[GDPR-Retention] Purge completed:', result)
  return result
}
