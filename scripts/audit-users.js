const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Auditing Users in Database...')
    const users = await prisma.user.findMany({
        include: {
            individual: true,
            company: true,
            therapist: true
        }
    })

    if (users.length === 0) {
        console.log('❌ No users found.')
    } else {
        console.log(`✅ Found ${users.length} users:`)
        console.table(users.map(u => ({
            id: u.id.substring(0, 8) + '...',
            email: u.email,
            type: u.userType,
            name: u.individual?.firstName || u.company?.name || u.therapist?.name || 'N/A'
        })))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
