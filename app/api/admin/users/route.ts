import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            userType: true,
            status: true,
            createdAt: true,
            individual: { select: { firstName: true, lastName: true, diagnoses: true, validationStatus: true } },
            company: { select: { name: true, industry: true, subscriptionPlan: true } },
            therapist: { select: { name: true, specialty: true, verificationStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, status } = body

    if (!userId || !status || !['active', 'deactivated'].includes(status)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: { id: true, email: true, status: true },
    })

    return NextResponse.json({ user: updated })
}
