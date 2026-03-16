import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-password.ts <email> <new-password>')
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
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.error(`❌ User not found: ${email}`)
        process.exit(1)
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update in public."User" (Prisma)
    await prisma.user.update({
        where: { email },
        data: { passwordHash },
    })

    // Sync with auth.users (auth schema)
    await prisma.$executeRawUnsafe(
        `UPDATE auth.users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
        passwordHash, email
    )

    console.log(`✅ Password updated for ${email} (type: ${user.userType})`)
    console.log(`   📋 public."User" ✓`)
    console.log(`   📋 auth.users    ✓`)
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
