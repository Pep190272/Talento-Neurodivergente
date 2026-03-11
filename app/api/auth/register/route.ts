/**
 * POST /api/auth/register
 *
 * Creates a User + role-specific profile (Company, Individual, or Therapist)
 * in a single Prisma transaction. Sends a welcome email (best-effort).
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userType, email, password, firstName, lastName, ...profileData } = body

    // --- Validation ---
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, contraseña y tipo de usuario son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const validTypes = ['individual', 'company', 'therapist']
    if (!validTypes.includes(userType)) {
      return NextResponse.json(
        { error: 'Tipo de usuario inválido' },
        { status: 400 }
      )
    }

    // Map frontend "candidate" to schema "individual"
    const dbUserType = userType === 'candidate' ? 'individual' : userType

    // --- Check duplicate ---
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }

    // --- Hash password ---
    const passwordHash = await bcrypt.hash(password, 12)

    // --- Create user + profile in transaction ---
    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          userType: dbUserType,
        },
      })

      if (dbUserType === 'company') {
        await tx.company.create({
          data: {
            userId: newUser.id,
            name: profileData.companyName || `${firstName} ${lastName}`,
            industry: profileData.industry || null,
            size: profileData.companySize || null,
            contact: {
              email,
              phone: profileData.phone || null,
              contactName: `${firstName} ${lastName}`,
              position: profileData.position || null,
            },
          },
        })
      } else if (dbUserType === 'individual') {
        await tx.individual.create({
          data: {
            userId: newUser.id,
            firstName: firstName || '',
            lastName: lastName || '',
            skills: profileData.skills || [],
          },
        })
      } else if (dbUserType === 'therapist') {
        await tx.therapist.create({
          data: {
            userId: newUser.id,
            name: `${firstName} ${lastName}`.trim(),
            specialty: profileData.specialization || null,
            licenseNumber: profileData.licenseNumber || null,
            certifications: profileData.certifications || [],
          },
        })
      }

      return newUser
    })

    // --- Send welcome email (best-effort, never blocks) ---
    const displayName = firstName || email.split('@')[0]
    sendWelcomeEmail({ to: email, name: displayName, role: dbUserType }).catch(() => {})

    return NextResponse.json(
      {
        message: 'Cuenta creada exitosamente',
        userId: user.id,
        userType: dbUserType,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
