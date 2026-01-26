
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

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

        // Low-tech "masking": clear console to hide password from immediate view
        // (Real masking requires 'inquirer' or 'prompts' packages, trying to avoid deps)
        console.clear()
        console.log('🔒 Encrypting credentials...')

        const passwordHash = await bcrypt.hash(password, 10)

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

        console.log('-----------------------------------')
        console.log(`✅ SUPER ADMIN CREATED SUCCESSFULLY`)
        console.log(`👤 User: ${user.email}`)
        console.log('-----------------------------------')

    } catch (error) {
        console.error('❌ Error creating admin:', error)
    } finally {
        rl.close()
        await prisma.$disconnect()
    }
}

createAdmin()
