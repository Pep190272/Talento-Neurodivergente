import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * POST /api/admin/bootstrap
 *
 * One-time endpoint to create/reset the superadmin user in the public."User" table.
 * Protected by a bootstrap secret that must match the ADMIN_BOOTSTRAP_SECRET env var.
 *
 * Usage: POST with JSON body { "secret": "<ADMIN_BOOTSTRAP_SECRET>" }
 * If ADMIN_BOOTSTRAP_SECRET is not set, falls back to checking NEXTAUTH_SECRET.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { secret } = body

        // Verify bootstrap secret
        const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET || process.env.NEXTAUTH_SECRET
        if (!expectedSecret || secret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = process.env.ADMIN_EMAIL || 'diversiaeternals@gmail.com'
        const password = process.env.ADMIN_PASSWORD || 'd1v3rs14Eternal$'

        const passwordHash = await bcrypt.hash(password, 12)

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                userType: 'admin',
                status: 'active',
            },
            create: {
                email,
                passwordHash,
                userType: 'admin',
                status: 'active',
            },
        })

        return NextResponse.json({
            success: true,
            message: `Admin user ready: ${user.email}`,
            id: user.id,
        })
    } catch (error) {
        console.error('Bootstrap error:', error)
        return NextResponse.json(
            { error: 'Failed to bootstrap admin', details: String(error) },
            { status: 500 }
        )
    }
}
