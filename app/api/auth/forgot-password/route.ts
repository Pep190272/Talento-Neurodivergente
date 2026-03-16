import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateResetToken } from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Always respond with success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
    })

    const user = await prisma.user.findUnique({
      where: { email },
      include: { individual: true, company: true, therapist: true },
    })

    if (!user) {
      return successResponse
    }

    // Generate token
    const token = generateResetToken(email)

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://app.diversia.click'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Determine display name
    let name = email.split('@')[0]
    if (user.individual) name = user.individual.firstName
    else if (user.company) name = user.company.name
    else if (user.therapist) name = user.therapist.name

    // Send email (best-effort)
    sendPasswordResetEmail({ to: email, name, resetUrl }).catch(() => {})

    logger.info('Auth', `Password reset requested for ${email}`)

    return successResponse
  } catch (error: any) {
    logger.error('Auth', 'Forgot password error', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
