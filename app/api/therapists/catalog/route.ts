/**
 * Therapist & Trainer Catalog API — Issue #56
 * GET /api/therapists/catalog
 *
 * Public catalog of verified therapists and trainers for candidates.
 * Supports filtering by specialization, language, and availability.
 *
 * Privacy: Only shows verified therapists who are accepting clients.
 * No sensitive data is exposed (only professional profile info).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withErrorHandler, AuthenticationError } from '@/lib/errors'
import prisma from '@/lib/prisma'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw new AuthenticationError()

  const { searchParams } = new URL(req.url)
  const specialization = searchParams.get('specialization')
  const language = searchParams.get('language')
  const acceptingOnly = searchParams.get('accepting') !== 'false'
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20'), 50)

  // Build query
  const where: Record<string, unknown> = {
    verificationStatus: 'verified',
  }

  if (acceptingOnly) {
    where.acceptingNewClients = true
  }

  if (specialization) {
    where.specializations = { has: specialization }
  }

  if (language) {
    where.languages = { has: language }
  }

  const [therapists, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      include: { user: { select: { status: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { neurodiversityExperience: 'desc' },
        { experienceYears: 'desc' },
      ],
    }),
    prisma.therapist.count({ where }),
  ])

  // Map to public-safe catalog entries
  const catalog = therapists
    .filter(t => t.user.status === 'active')
    .map(t => {
      const certs = (t.certifications as Array<{ title?: string; issuingBody?: string }>) ?? []
      return {
        therapistId: t.id,
        name: t.name,
        specializations: t.specializations,
        approach: t.approach,
        languages: t.languages,
        location: t.location,
        bio: t.bio,
        services: t.services,
        neurodiversityExperience: t.neurodiversityExperience,
        experienceYears: t.experienceYears,
        acceptingNewClients: t.acceptingNewClients,
        availability: {
          status: t.acceptingNewClients && t.currentClients < t.maxClients ? 'available' : 'waitlist',
          spotsRemaining: Math.max(0, t.maxClients - t.currentClients),
        },
        certifications: certs.map(c => ({
          title: c.title,
          issuingBody: c.issuingBody,
        })),
        badges: t.badges,
      }
    })

  return NextResponse.json({
    success: true,
    data: catalog,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
})
