import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting Seeding Process...')

    // 1. Mock Data for Testing (Marked clearly)
    // Mock Company
    const companyPassword = await bcrypt.hash('company123', 10)
    const mockCompany = await prisma.user.upsert({
        where: { email: 'mock_company@test.diversia.com' },
        update: {},
        create: {
            email: 'mock_company@test.diversia.com',
            passwordHash: companyPassword,
            userType: 'company',
            company: {
                create: {
                    name: 'Mock Tech Inc.',
                    industry: 'Technology',
                    description: 'A mock company for automated matching tests.',
                    subscriptionPlan: 'pro'
                }
            }
        }
    })
    console.log('🏢 Mock Company ensured:', mockCompany.email)

    // Mock Candidate
    const candidatePassword = await bcrypt.hash('candidate123', 10)
    const mockCandidate = await prisma.user.upsert({
        where: { email: 'mock_candidate@test.diversia.com' },
        update: {},
        create: {
            email: 'mock_candidate@test.diversia.com',
            passwordHash: candidatePassword,
            userType: 'individual',
            individual: {
                create: {
                    firstName: 'Test',
                    lastName: 'Candidate',
                    skills: ['React', 'Node.js', 'Testing'],
                    diagnoses: ['encrypted:ADHD'], // Mock encryption
                    experienceYears: 5
                }
            }
        }
    })
    console.log('👨‍💻 Mock Candidate ensured:', mockCandidate.email)

    // Mock Therapist (Ecosystem 360)
    const therapistPassword = await bcrypt.hash('therapist123', 10)
    const mockTherapist = await prisma.user.upsert({
        where: { email: 'mock_therapist@test.diversia.com' },
        update: {},
        create: {
            email: 'mock_therapist@test.diversia.com',
            passwordHash: therapistPassword,
            userType: 'therapist',
            therapist: {
                create: {
                    name: 'Dr. Neuro Inclusive',
                    specialty: 'Workplace Accommodation',
                    licenseNumber: 'MOCK-LIC-2026'
                }
            }
        }
    })
    console.log('🧠 Mock Therapist ensured:', mockTherapist.email)

    // 2. Create 360 Connections
    console.log('🔗 Creating 360 Ecosystem Connections...')

    // Connection: Company <-> Therapist (Consulting/Formation)
    await prisma.connection.create({
        data: {
            type: 'CONSULTING',
            status: 'active',
            companyId: mockCompany.company.id, // Using the company relation ID
            therapistId: mockTherapist.therapist.id,
            sharedData: ['employees_list', 'training_needs']
        }
    })
    console.log('   - Connection: Company <-> Therapist (Consulting) created.')

    // Connection: Candidate <-> Therapist (Therapy/Support)
    await prisma.connection.create({
        data: {
            type: 'THERAPY',
            status: 'active',
            individualId: mockCandidate.individual.id,
            therapistId: mockTherapist.therapist.id,
            sharedData: ['diagnosis', 'accommodations']
        }
    })
    console.log('   - Connection: Candidate <-> Therapist (Therapy) created.')

    console.log('✅ Seeding finished (Testing Data Only).')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
