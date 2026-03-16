import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { consumeResetToken } from '@/lib/password-reset'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validate and consume the token
    const email = consumeResetToken(token)

    if (!email) {
      return NextResponse.json(
        { error: 'El enlace ha expirado o no es válido. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Hash new password and update both tables
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    })

    // Sync with auth.users (auth schema)
    await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
      passwordHash, email
    )

    logger.info('Auth', `Password reset completed for ${email}`)

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    })
  } catch (error: any) {
    logger.error('Auth', 'Reset password error', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
