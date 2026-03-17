
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error('❌ DATABASE_URL is required')
    process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve)
    })
}

async function createAdmin() {
    console.log('🛡️  SECURE ADMIN CREATION WIZARD 🛡️')
    console.log('-----------------------------------')

    try {
        const email = await question('Enter Admin Email: ')
        const password = await question('Enter Admin Password: ')

        if (!email || !password) {
            console.error('❌ Email and password are required.')
            process.exit(1)
        }

        console.clear()
        console.log('🔒 Encrypting credentials...')

        const passwordHash = await bcrypt.hash(password, 12)

        // 1. Create/update in Prisma User table (public schema)
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                userType: 'admin',
                passwordHash,
            },
            create: {
                email,
                passwordHash,
                userType: 'admin',
            }
        })

        // 2. Sync with auth.users table (auth schema)
        // Uses raw SQL since auth.users is managed by the auth-service
        try {
            await prisma.$executeRawUnsafe(`
                INSERT INTO auth.users (id, email, password_hash, role, status, display_name, created_at, updated_at)
                VALUES ($1, $2, $3, 'admin', 'active', 'Super Admin', NOW(), NOW())
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    role = 'admin',
                    status = 'active',
                    updated_at = NOW()
            `, user.id, email, passwordHash)
            console.log(`📋 auth.users    ✓`)
        } catch (e) {
            console.log(`⚠ auth.users sync skipped (schema may not exist): ${(e as Error).message?.slice(0, 80)}`)
        }

        console.log('-----------------------------------')
        console.log(`✅ ADMIN CREATED`)
        console.log(`👤 User: ${user.email} (${user.id})`)
        console.log(`📋 public."User" ✓`)
        console.log('-----------------------------------')

    } catch (error) {
        console.error('❌ Error creating admin:', error)
    } finally {
        rl.close()
        await prisma.$disconnect()
    }
}

createAdmin()
