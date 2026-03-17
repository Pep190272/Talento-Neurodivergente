import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user || session.user.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // All queries in parallel for performance
    const [
        totalUsers,
        usersByType,
        totalJobs,
        jobsByStatus,
        totalMatchings,
        matchingsByStatus,
        matchingScores,
        connectionsByType,
        pipelineStages,
        companiesByIndustry,
        therapistsByStatus,
        recentMatchings,
        topMatches,
        auditEventCounts,
    ] = await Promise.all([
        // Total users
        prisma.user.count(),

        // Users by type
        prisma.user.groupBy({ by: ['userType'], _count: { id: true } }),

        // Total jobs
        prisma.job.count(),

        // Jobs by status
        prisma.job.groupBy({ by: ['status'], _count: { id: true } }),

        // Total matchings
        prisma.matching.count(),

        // Matchings by status
        prisma.matching.groupBy({ by: ['status'], _count: { id: true } }),

        // Matching scores for distribution
        prisma.matching.findMany({
            select: { aiScore: true, status: true, createdAt: true },
            orderBy: { aiScore: 'desc' },
        }),

        // Connections by type
        prisma.connection.groupBy({ by: ['type'], _count: { id: true } }),

        // Pipeline stages
        prisma.connection.groupBy({
            by: ['pipelineStage'],
            where: { type: 'JOB_MATCH' },
            _count: { id: true },
        }),

        // Companies by industry
        prisma.company.findMany({
            select: { industry: true, name: true, id: true },
        }),

        // Therapists by verification status
        prisma.therapist.groupBy({ by: ['verificationStatus'], _count: { id: true } }),

        // Recent matchings (last 20)
        prisma.matching.findMany({
            select: {
                id: true,
                aiScore: true,
                status: true,
                createdAt: true,
                job: { select: { title: true, company: { select: { name: true } } } },
                individual: { select: { firstName: true, lastName: true, diagnoses: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        }),

        // Top potential matches (highest scored pending)
        prisma.matching.findMany({
            where: { status: 'PENDING' },
            select: {
                id: true,
                aiScore: true,
                aiExplanation: true,
                job: { select: { title: true, company: { select: { name: true } } } },
                individual: { select: { firstName: true, lastName: true } },
            },
            orderBy: { aiScore: 'desc' },
            take: 10,
        }),

        // Audit event counts
        prisma.auditLog.groupBy({ by: ['eventType'], _count: { id: true } }),
    ])

    // Compute score distribution buckets
    const scoreBuckets = [
        { range: '0-30', count: 0 },
        { range: '31-50', count: 0 },
        { range: '51-70', count: 0 },
        { range: '71-85', count: 0 },
        { range: '86-100', count: 0 },
    ]
    for (const m of matchingScores) {
        if (m.aiScore <= 30) scoreBuckets[0].count++
        else if (m.aiScore <= 50) scoreBuckets[1].count++
        else if (m.aiScore <= 70) scoreBuckets[2].count++
        else if (m.aiScore <= 85) scoreBuckets[3].count++
        else scoreBuckets[4].count++
    }

    // Compute acceptance rate
    const accepted = matchingsByStatus.find(m => m.status === 'APPROVED')?._count.id || 0
    const rejected = matchingsByStatus.find(m => m.status === 'REJECTED')?._count.id || 0
    const total = accepted + rejected
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0

    // Compute average score
    const avgScore = matchingScores.length > 0
        ? Math.round(matchingScores.reduce((sum, m) => sum + m.aiScore, 0) / matchingScores.length * 10) / 10
        : 0

    // Group candidates by diagnosis
    const individuals = await prisma.individual.findMany({
        select: { diagnoses: true },
    })
    const diagnosisCounts: Record<string, number> = {}
    for (const ind of individuals) {
        for (const diag of ind.diagnoses) {
            const clean = diag.replace('encrypted:', '')
            diagnosisCounts[clean] = (diagnosisCounts[clean] || 0) + 1
        }
    }

    // Industry distribution
    const industryCounts: Record<string, number> = {}
    for (const company of companiesByIndustry) {
        const industry = company.industry || 'Otro'
        industryCounts[industry] = (industryCounts[industry] || 0) + 1
    }

    return NextResponse.json({
        overview: {
            totalUsers,
            totalJobs,
            totalMatchings,
            totalConnections: connectionsByType.reduce((s, c) => s + c._count.id, 0),
            acceptanceRate,
            avgScore,
        },
        usersByType: usersByType.map(u => ({ type: u.userType, count: u._count.id })),
        jobsByStatus: jobsByStatus.map(j => ({ status: j.status, count: j._count.id })),
        matchingsByStatus: matchingsByStatus.map(m => ({ status: m.status, count: m._count.id })),
        scoreDistribution: scoreBuckets,
        diagnosisDistribution: Object.entries(diagnosisCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        industryDistribution: Object.entries(industryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        connectionsByType: connectionsByType.map(c => ({ type: c.type, count: c._count.id })),
        pipeline: pipelineStages.map(p => ({ stage: p.pipelineStage, count: p._count.id })),
        therapistVerification: therapistsByStatus.map(t => ({ status: t.verificationStatus, count: t._count.id })),
        recentMatchings: recentMatchings.map(m => ({
            id: m.id,
            score: m.aiScore,
            status: m.status,
            date: m.createdAt,
            job: m.job.title,
            company: m.job.company.name,
            candidate: `${m.individual.firstName} ${m.individual.lastName.charAt(0)}.`,
            diagnosis: m.individual.diagnoses.map(d => d.replace('encrypted:', '')),
        })),
        topPotentialMatches: topMatches.map(m => ({
            id: m.id,
            score: m.aiScore,
            explanation: m.aiExplanation,
            job: m.job.title,
            company: m.job.company.name,
            candidate: `${m.individual.firstName} ${m.individual.lastName.charAt(0)}.`,
        })),
        auditEvents: auditEventCounts.map(a => ({ type: a.eventType, count: a._count.id })),
    })
}
