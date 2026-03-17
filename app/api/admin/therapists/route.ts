import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const therapists = await prisma.therapist.findMany({
        select: {
            id: true,
            name: true,
            specialty: true,
            licenseNumber: true,
            specializations: true,
            certifications: true,
            verificationStatus: true,
            verifiedAt: true,
            verifiedBy: true,
            verificationNotes: true,
            rejectionReason: true,
            experienceYears: true,
            currentClients: true,
            maxClients: true,
            acceptingNewClients: true,
            services: true,
            location: true,
            badges: true,
            user: { select: { email: true, status: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ therapists })
}

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { therapistId, action, notes, reason } = body

    if (!therapistId || !['verify', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid parameters. Required: therapistId, action (verify|reject)' }, { status: 400 })
    }

    if (action === 'verify') {
        const updated = await prisma.therapist.update({
            where: { id: therapistId },
            data: {
                verificationStatus: 'verified',
                verifiedAt: new Date(),
                verifiedBy: session.user.id,
                verificationNotes: notes || 'Verificado por administrador.',
            },
            select: { id: true, name: true, verificationStatus: true },
        })
        return NextResponse.json({ therapist: updated })
    }

    if (action === 'reject') {
        const updated = await prisma.therapist.update({
            where: { id: therapistId },
            data: {
                verificationStatus: 'rejected',
                rejectedAt: new Date(),
                rejectionReason: reason || 'Credenciales no verificables.',
            },
            select: { id: true, name: true, verificationStatus: true },
        })
        return NextResponse.json({ therapist: updated })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
