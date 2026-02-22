/**
 * Company Repository — Data Access Layer
 * Encapsulates all Prisma operations for User + Company + Job tables.
 *
 * Sprint 3: Extracted from app/lib/companies.ts
 * Only contains Prisma queries — no business logic.
 */

import prisma from '../prisma'

// ─── User Queries ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

// ─── Company Queries ─────────────────────────────────────────────────────────

export async function findCompanyById(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      user: true,
      jobs: { select: { id: true } },
    },
  })
}

export async function findCompanyByUserId(userId: string) {
  return prisma.company.findUnique({
    where: { userId },
    include: {
      user: true,
      jobs: { select: { id: true } },
    },
  })
}

export async function updateCompanyInDb(companyId: string, data: Record<string, unknown>) {
  return prisma.company.update({
    where: { id: companyId },
    data,
    include: {
      user: true,
      jobs: { select: { id: true } },
    },
  })
}

// ─── Job Queries ─────────────────────────────────────────────────────────────

export async function createJobInDb(data: Record<string, unknown>) {
  return prisma.job.create({ data: data as never })
}

export async function findJobById(jobId: string) {
  return prisma.job.findUnique({ where: { id: jobId } })
}

export async function updateJobInDb(jobId: string, data: Record<string, unknown>) {
  return prisma.job.update({ where: { id: jobId }, data })
}

export async function findJobsByCompanyId(companyId: string) {
  return prisma.job.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findPublishedJobs() {
  return prisma.job.findMany({
    where: { status: 'PUBLISHED', visibility: 'public' },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Matching Queries ────────────────────────────────────────────────────────

export async function findMatchingsByJobIdExcludingRejected(jobId: string) {
  return prisma.matching.findMany({
    where: {
      jobId,
      status: { not: 'REJECTED' },
    },
  })
}

export async function findJobCompanyId(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    select: { companyId: true },
  })
}

// ─── Connection Queries ──────────────────────────────────────────────────────

export async function findActiveConnection(companyId: string, individualId: string) {
  return prisma.connection.findFirst({
    where: {
      companyId,
      individualId,
      status: 'active',
    },
  })
}

// ─── Transactional Operations ────────────────────────────────────────────────

export async function createUserAndCompany(
  userData: {
    email: string
    passwordHash: string
    userType: string
    status: string
  },
  companyData: Record<string, unknown>
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData })

    return tx.company.create({
      data: {
        userId: user.id,
        ...companyData,
      } as never,
      include: {
        user: true,
        jobs: { select: { id: true } },
      },
    })
  })
}
