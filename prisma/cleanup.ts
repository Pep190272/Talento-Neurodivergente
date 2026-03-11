import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('DATABASE_URL is required to run cleanup')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const TEST_EMAILS = [
    'mock_company@test.diversia.com',
    'mock_candidate@test.diversia.com',
    'mock_candidate2@test.diversia.com',
    'mock_therapist@test.diversia.com',
]

async function main() {
    console.log('🧹 Starting cleanup of test data...\n')

    // 1. Find test user IDs
    const testUsers = await prisma.user.findMany({
        where: { email: { in: TEST_EMAILS } },
        select: { id: true, email: true },
    })
    const testUserIds = testUsers.map(u => u.id)
    console.log(`Found ${testUsers.length} test users:`)
    testUsers.forEach(u => console.log(`   - ${u.email} (${u.id})`))

    if (testUserIds.length === 0) {
        console.log('\nNo test users found. Nothing to clean up.')
        return
    }

    // 2. Delete audit logs for test users
    const deletedAuditLogs = await prisma.auditLog.deleteMany({
        where: { userId: { in: testUserIds } },
    })
    console.log(`\n📜 Deleted ${deletedAuditLogs.count} audit log entries`)

    // 3. Delete connections involving test data
    const deletedConnections = await prisma.connection.deleteMany({
        where: {
            OR: [
                { individualId: { in: testUserIds } },
                { companyId: { not: undefined } }, // will clean all since only mock company exists
                { therapistId: { not: undefined } },
            ],
        },
    })
    console.log(`🔗 Deleted ${deletedConnections.count} connections`)

    // 4. Delete matchings
    const deletedMatchings = await prisma.matching.deleteMany({})
    console.log(`🤖 Deleted ${deletedMatchings.count} matchings`)

    // 5. Delete jobs
    const deletedJobs = await prisma.job.deleteMany({})
    console.log(`📋 Deleted ${deletedJobs.count} jobs`)

    // 6. Delete profiles (Individual, Company, Therapist)
    const deletedIndividuals = await prisma.individual.deleteMany({})
    console.log(`👤 Deleted ${deletedIndividuals.count} individuals`)

    const deletedCompanies = await prisma.company.deleteMany({})
    console.log(`🏢 Deleted ${deletedCompanies.count} companies`)

    const deletedTherapists = await prisma.therapist.deleteMany({})
    console.log(`🧠 Deleted ${deletedTherapists.count} therapists`)

    // 7. Delete test users (NOT admin)
    const deletedUsers = await prisma.user.deleteMany({
        where: { email: { in: TEST_EMAILS } },
    })
    console.log(`👥 Deleted ${deletedUsers.count} test users`)

    // 8. Verify admin is intact
    const admin = await prisma.user.findFirst({
        where: { email: 'jose190272@gmail.com' },
    })
    console.log(`\n✅ Admin user intact: ${admin?.email} (${admin?.id})`)

    // Show remaining data
    const remainingUsers = await prisma.user.count()
    const remainingCompanies = await prisma.company.count()
    const remainingJobs = await prisma.job.count()
    console.log(`\n📊 Remaining data:`)
    console.log(`   Users: ${remainingUsers}`)
    console.log(`   Companies: ${remainingCompanies}`)
    console.log(`   Jobs: ${remainingJobs}`)
    console.log('\n🧹 Cleanup complete!')
}

main()
    .catch((e) => {
        console.error('Cleanup failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
