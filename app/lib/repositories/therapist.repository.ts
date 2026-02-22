/**
 * Therapist Repository — Data Access Layer
 * Encapsulates all Prisma operations for User + Therapist tables.
 *
 * Sprint 3: Extracted from app/lib/therapists.ts
 * Only contains Prisma queries — no business logic.
 */

import prisma from '../prisma'

// ─── User Queries ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

// ─── Therapist Queries ───────────────────────────────────────────────────────

export async function findTherapistById(therapistId: string) {
  return prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  })
}

export async function findTherapistByUserId(userId: string) {
  return prisma.therapist.findUnique({
    where: { userId },
    include: { user: true },
  })
}

export async function findTherapistByIdWithoutUser(therapistId: string) {
  return prisma.therapist.findUnique({ where: { id: therapistId } })
}

export async function updateTherapistInDb(therapistId: string, data: Record<string, unknown>) {
  return prisma.therapist.update({
    where: { id: therapistId },
    data,
    include: { user: true },
  })
}

export async function updateTherapistWithUserStatus(
  therapistId: string,
  therapistData: Record<string, unknown>,
  userStatus: string
) {
  return prisma.therapist.update({
    where: { id: therapistId },
    data: {
      ...therapistData,
      user: { update: { status: userStatus } },
    },
    include: { user: true },
  })
}

export async function findVerifiedTherapists() {
  return prisma.therapist.findMany({
    where: {
      verificationStatus: 'verified',
      acceptingNewClients: true,
      user: { status: 'active' },
    },
    include: { user: true },
  })
}

export async function findTherapistsBySpecialization(specialization: string) {
  return prisma.therapist.findMany({
    where: {
      verificationStatus: 'verified',
      acceptingNewClients: true,
      user: { status: 'active' },
      specializations: { has: specialization },
    },
    include: { user: true },
  })
}

// ─── Transactional Operations ────────────────────────────────────────────────

export async function createUserAndTherapist(
  userData: {
    email: string
    passwordHash: string
    userType: string
    status: string
  },
  therapistData: Record<string, unknown>
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData })

    return tx.therapist.create({
      data: {
        userId: user.id,
        ...therapistData,
      } as never,
      include: { user: true },
    })
  })
}
