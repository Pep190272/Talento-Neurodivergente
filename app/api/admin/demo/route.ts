import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/demo?role=candidate|company|therapist
 * Returns seed data for demo dashboards — admin only
 */
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const role = req.nextUrl.searchParams.get('role')

    if (role === 'candidate') {
        return NextResponse.json(await getCandidateDemo())
    } else if (role === 'company') {
        return NextResponse.json(await getCompanyDemo())
    } else if (role === 'therapist') {
        return NextResponse.json(await getTherapistDemo())
    }

    return NextResponse.json({ error: 'Invalid role. Use ?role=candidate|company|therapist' }, { status: 400 })
}

async function getCandidateDemo() {
    // Get all seed candidates with their matchings
    const candidates = await prisma.individual.findMany({
        include: {
            user: { select: { email: true, status: true, createdAt: true } },
            matchings: {
                include: {
                    job: {
                        select: {
                            title: true,
                            salary: true,
                            location: true,
                            modality: true,
                            company: { select: { name: true, industry: true } },
                        },
                    },
                },
                orderBy: { aiScore: 'desc' },
            },
        },
        orderBy: { firstName: 'asc' },
    })

    const connections = await prisma.connection.findMany({
        where: { type: 'JOB_MATCH' },
        select: { individualId: true, pipelineStage: true, status: true },
    })

    return {
        role: 'candidate',
        totalCandidates: candidates.length,
        candidates: candidates.map(c => {
            const myConnections = connections.filter(conn => conn.individualId === c.id)
            const myMatchings = c.matchings

            return {
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                email: c.user.email,
                status: c.user.status,
                diagnoses: c.diagnoses.map(d => d.replace('encrypted:', '')),
                accommodations: c.accommodations,
                skills: c.skills,
                experience: c.experience,
                education: c.education,
                location: c.location,
                memberSince: c.user.createdAt,
                // Metrics
                totalMatches: myMatchings.length,
                pendingMatches: myMatchings.filter(m => m.status === 'PENDING').length,
                approvedMatches: myMatchings.filter(m => m.status === 'APPROVED').length,
                avgMatchScore: myMatchings.length > 0
                    ? Math.round(myMatchings.reduce((s, m) => s + m.aiScore, 0) / myMatchings.length)
                    : 0,
                bestMatchScore: myMatchings.length > 0 ? myMatchings[0].aiScore : 0,
                // Pipeline
                pipeline: {
                    newMatches: myConnections.filter(c => c.pipelineStage === 'newMatches').length,
                    underReview: myConnections.filter(c => c.pipelineStage === 'underReview').length,
                    interviewing: myConnections.filter(c => c.pipelineStage === 'interviewing').length,
                    offered: myConnections.filter(c => c.pipelineStage === 'offered').length,
                    hired: myConnections.filter(c => c.pipelineStage === 'hired').length,
                },
                // Top 3 matched jobs
                topJobs: myMatchings.slice(0, 3).map(m => ({
                    title: m.job.title,
                    company: m.job.company.name,
                    score: m.aiScore,
                    status: m.status,
                    location: m.job.location,
                })),
                // Neurocognitive assessment
                hasAssessment: c.assessments !== null && Object.keys(c.assessments as object || {}).length > 0,
                assessmentDimensions: c.assessments ? Object.keys(c.assessments as object).length : 0,
            }
        }),
    }
}

async function getCompanyDemo() {
    const companies = await prisma.company.findMany({
        include: {
            user: { select: { email: true, status: true, createdAt: true } },
            jobs: {
                include: {
                    matchings: {
                        select: { id: true, aiScore: true, status: true },
                    },
                },
            },
        },
        orderBy: { name: 'asc' },
    })

    const connections = await prisma.connection.findMany({
        where: { type: 'JOB_MATCH' },
        select: { companyId: true, pipelineStage: true, jobId: true },
    })

    return {
        role: 'company',
        totalCompanies: companies.length,
        companies: companies.map(co => {
            const myConnections = connections.filter(c => c.companyId === co.id)
            const allMatchings = co.jobs.flatMap(j => j.matchings)

            return {
                id: co.id,
                name: co.name,
                email: co.user.email,
                industry: co.industry,
                location: co.location,
                status: co.user.status,
                size: co.size,
                subscriptionPlan: co.subscriptionPlan,
                inclusivityScore: co.inclusivityScore,
                memberSince: co.user.createdAt,
                // Job metrics
                totalJobs: co.jobs.length,
                openJobs: co.jobs.filter(j => j.status === 'OPEN').length,
                closedJobs: co.jobs.filter(j => j.status === 'CLOSED').length,
                // Matching metrics
                totalMatchings: allMatchings.length,
                approvedMatchings: allMatchings.filter(m => m.status === 'APPROVED').length,
                avgScore: allMatchings.length > 0
                    ? Math.round(allMatchings.reduce((s, m) => s + m.aiScore, 0) / allMatchings.length)
                    : 0,
                // Pipeline
                pipeline: {
                    newMatches: myConnections.filter(c => c.pipelineStage === 'newMatches').length,
                    underReview: myConnections.filter(c => c.pipelineStage === 'underReview').length,
                    interviewing: myConnections.filter(c => c.pipelineStage === 'interviewing').length,
                    offered: myConnections.filter(c => c.pipelineStage === 'offered').length,
                    hired: myConnections.filter(c => c.pipelineStage === 'hired').length,
                },
                // Jobs detail
                jobs: co.jobs.map(j => ({
                    id: j.id,
                    title: j.title,
                    status: j.status,
                    location: j.location,
                    salary: j.salary,
                    inclusivityScore: j.inclusivityScore,
                    matchCount: j.matchings.length,
                    topScore: j.matchings.length > 0
                        ? Math.max(...j.matchings.map(m => m.aiScore))
                        : 0,
                })),
            }
        }),
    }
}

async function getTherapistDemo() {
    const therapists = await prisma.therapist.findMany({
        include: {
            user: { select: { email: true, status: true, createdAt: true } },
        },
        orderBy: { name: 'asc' },
    })

    // Therapy connections
    const therapyConnections = await prisma.connection.findMany({
        where: { type: 'THERAPY' },
        include: {
            individual: { select: { firstName: true, lastName: true, diagnoses: true } },
        },
    })

    // Consulting connections
    const consultingConnections = await prisma.connection.findMany({
        where: { type: 'CONSULTING' },
        include: {
            company: { select: { name: true, industry: true } },
        },
    })

    return {
        role: 'therapist',
        totalTherapists: therapists.length,
        therapists: therapists.map(t => {
            const myTherapyClients = therapyConnections.filter(c => c.therapistId === t.id)
            const myConsultingClients = consultingConnections.filter(c => c.therapistId === t.id)
            const metadata = (t.metadata as Record<string, unknown>) || {}

            return {
                id: t.id,
                name: t.name,
                email: t.user.email,
                specialty: t.specialty,
                licenseNumber: t.licenseNumber,
                verificationStatus: t.verificationStatus,
                experienceYears: t.experienceYears,
                location: t.location,
                services: t.services,
                certifications: t.certifications,
                memberSince: t.user.createdAt,
                // Capacity
                currentClients: t.currentClients,
                maxClients: t.maxClients,
                capacityPct: t.maxClients > 0 ? Math.round((t.currentClients / t.maxClients) * 100) : 0,
                // Performance
                sessionsCompleted: metadata.sessionsCompleted ?? 0,
                satisfactionScore: metadata.clientSatisfactionScore ?? 0,
                avgResponseTime: metadata.avgResponseTime ?? '-',
                // Clients
                therapyClients: myTherapyClients.map(c => ({
                    name: c.individual ? `${c.individual.firstName} ${c.individual.lastName.charAt(0)}.` : 'N/A',
                    diagnoses: c.individual?.diagnoses.map(d => d.replace('encrypted:', '')) || [],
                    status: c.status,
                    consentGivenAt: c.consentGivenAt,
                })),
                consultingClients: myConsultingClients.map(c => ({
                    company: c.company?.name || 'N/A',
                    industry: c.company?.industry || '-',
                    status: c.status,
                })),
            }
        }),
    }
}
