/**
 * Delete Admin User — removes from BOTH public."User" and auth.users tables.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/delete-admin.ts <email>
 *
 * This ensures no orphan records remain in either schema.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const email = process.argv[2]

if (!email) {
    console.error('Usage: npx tsx scripts/delete-admin.ts <email>')
    process.exit(1)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error('❌ DATABASE_URL is required')
    process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log(`🗑️  Deleting admin user: ${email}`)
    console.log('-----------------------------------')

    // 1. Delete from public."User" (Prisma)
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
        if (user.userType !== 'admin') {
            console.error(`❌ User ${email} is not an admin (type: ${user.userType}). Aborting.`)
            process.exit(1)
        }
        await prisma.user.delete({ where: { email } })
        console.log(`✅ Deleted from public."User" (id: ${user.id})`)
    } else {
        console.log(`⚠️  Not found in public."User" — skipping`)
    }

    // 2. Delete from auth.users (auth schema)
    const result = await prisma.$executeRawUnsafe(
        `DELETE FROM auth.users WHERE email = $1 AND role = 'admin'`,
        email
    )
    if (result > 0) {
        console.log(`✅ Deleted from auth.users (${result} row(s))`)
    } else {
        console.log(`⚠️  Not found in auth.users — skipping`)
    }

    console.log('-----------------------------------')
    console.log('🧹 Admin deletion complete.')
}

main()
    .catch((e) => { console.error('❌ Error:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
