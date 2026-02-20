import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('DATABASE_URL is required to run seed')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting Seeding Process...')

    // ═══════════════════════════════════════════════════════════════════
    // 1. USERS — Company, Candidates, Therapist
    // ═══════════════════════════════════════════════════════════════════

    // --- Mock Company ---
    const companyPassword = await bcrypt.hash('company123', 10)
    const companyUser = await prisma.user.upsert({
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
                    size: '50-200',
                    location: 'Barcelona, Spain',
                    website: 'https://mocktech.test',
                    description: 'A mock company for automated matching tests.',
                    diversityCommitment: 'We are committed to building an inclusive workplace for neurodivergent talent.',
                    neurodiversityPrograms: [
                        { name: 'Quiet Spaces', description: 'Sensory-friendly work areas', type: 'accommodation' },
                        { name: 'Flex Schedule', description: 'Flexible start/end times', type: 'policy' },
                    ],
                    subscriptionPlan: 'pro',
                    metadata: {
                        lastLogin: new Date().toISOString(),
                        jobsPosted: 2,
                        candidatesHired: 1,
                        averageTimeToHire: 14,
                    },
                }
            }
        },
        include: { company: true },
    })
    const companyId = companyUser.company!.id
    console.log('🏢 Mock Company ensured:', companyUser.email, '→', companyId)

    // --- Mock Candidate 1 ---
    const candidatePassword = await bcrypt.hash('candidate123', 10)
    const candidate1User = await prisma.user.upsert({
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
                    skills: ['React', 'Node.js', 'Testing', 'TypeScript'],
                    diagnoses: ['encrypted:ADHD'],
                    accommodationsNeeded: 'encrypted:flexible_schedule,noise_cancelling',
                    experienceYears: 5,
                    bio: 'Passionate developer with ADHD. Strong focus in hyperfocus mode.',
                    location: 'Madrid, Spain',
                    experience: [
                        { title: 'Frontend Developer', company: 'StartupX', startYear: 2021, endYear: null, current: true, description: 'React/Next.js development' },
                        { title: 'Junior Developer', company: 'WebCo', startYear: 2019, endYear: 2021, current: false, description: 'Full-stack web development' },
                    ],
                    education: [
                        { degree: 'BSc Computer Science', institution: 'Universidad Politécnica de Madrid', year: 2019, field: 'Computer Science' },
                    ],
                    preferences: {
                        workMode: 'remote',
                        salaryMin: 35000,
                        salaryMax: 55000,
                        locations: ['Madrid', 'Barcelona', 'Remote'],
                        roles: ['Frontend Developer', 'Full-stack Developer'],
                        industries: ['Technology', 'Education'],
                    },
                    privacy: {
                        visibleInSearch: true,
                        showRealName: true,
                        shareDiagnosis: false,
                        shareTherapistContact: false,
                        shareAssessmentDetails: false,
                    },
                    assessment: {
                        completed: true,
                        completedAt: '2026-01-15T10:00:00Z',
                        strengths: ['pattern_recognition', 'hyperfocus', 'creative_thinking'],
                        challenges: ['time_management', 'task_switching'],
                        score: 78,
                        technicalSkills: ['React', 'Node.js', 'TypeScript'],
                        softSkills: ['creativity', 'problem_solving'],
                        workStyle: { preferredHours: 'flexible', environment: 'quiet', collaboration: 'async' },
                    },
                    metadata: {
                        lastLogin: new Date().toISOString(),
                        profileViews: 12,
                        matchesReceived: 3,
                        applicationsSubmitted: 1,
                    },
                    validationStatus: 'validated',
                }
            }
        },
        include: { individual: true },
    })
    const individual1Id = candidate1User.individual!.id
    console.log('👨‍💻 Mock Candidate 1 ensured:', candidate1User.email, '→', individual1Id)

    // --- Mock Candidate 2 ---
    const candidate2User = await prisma.user.upsert({
        where: { email: 'mock_candidate2@test.diversia.com' },
        update: {},
        create: {
            email: 'mock_candidate2@test.diversia.com',
            passwordHash: candidatePassword,
            userType: 'individual',
            individual: {
                create: {
                    firstName: 'Ana',
                    lastName: 'García',
                    skills: ['Python', 'Data Science', 'Machine Learning', 'SQL'],
                    diagnoses: ['encrypted:Autism'],
                    accommodationsNeeded: 'encrypted:written_instructions,predictable_schedule',
                    experienceYears: 3,
                    bio: 'Data scientist on the autism spectrum. Detail-oriented and pattern-focused.',
                    location: 'Barcelona, Spain',
                    experience: [
                        { title: 'Data Analyst', company: 'DataFlow', startYear: 2023, endYear: null, current: true, description: 'ML pipelines and data analysis' },
                    ],
                    education: [
                        { degree: 'MSc Data Science', institution: 'Universitat de Barcelona', year: 2023, field: 'Data Science' },
                        { degree: 'BSc Mathematics', institution: 'Universitat de Barcelona', year: 2021, field: 'Mathematics' },
                    ],
                    preferences: {
                        workMode: 'hybrid',
                        salaryMin: 40000,
                        salaryMax: 60000,
                        locations: ['Barcelona', 'Remote'],
                        roles: ['Data Scientist', 'ML Engineer'],
                        industries: ['Technology', 'Healthcare'],
                    },
                    privacy: {
                        visibleInSearch: true,
                        showRealName: false,
                        shareDiagnosis: false,
                        shareTherapistContact: false,
                        shareAssessmentDetails: true,
                    },
                    assessment: {
                        completed: true,
                        completedAt: '2026-02-01T14:30:00Z',
                        strengths: ['detail_orientation', 'systematic_thinking', 'data_analysis'],
                        challenges: ['social_interactions', 'sensory_overload'],
                        score: 85,
                        technicalSkills: ['Python', 'SQL', 'TensorFlow'],
                        softSkills: ['analytical_thinking', 'thoroughness'],
                        workStyle: { preferredHours: 'fixed', environment: 'predictable', collaboration: 'structured' },
                    },
                    metadata: {
                        lastLogin: new Date().toISOString(),
                        profileViews: 8,
                        matchesReceived: 2,
                        applicationsSubmitted: 0,
                    },
                    validationStatus: 'validated',
                }
            }
        },
        include: { individual: true },
    })
    const individual2Id = candidate2User.individual!.id
    console.log('👩‍💻 Mock Candidate 2 ensured:', candidate2User.email, '→', individual2Id)

    // --- Mock Therapist (expanded) ---
    const therapistPassword = await bcrypt.hash('therapist123', 10)
    const therapistUser = await prisma.user.upsert({
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
                    licenseNumber: 'MOCK-LIC-2026',

                    // Perfil profesional extendido
                    specializations: ['ADHD', 'Autism', 'Dyslexia', 'Workplace Adaptation'],
                    certifications: [
                        {
                            title: 'Certified ADHD Professional',
                            licenseNumber: 'CAHP-2024-0042',
                            issuingBody: 'International ADHD Foundation',
                            expiryDate: '2027-06-30',
                        },
                        {
                            title: 'Autism Spectrum Specialist',
                            licenseNumber: 'ASS-2023-1187',
                            issuingBody: 'European Autism Association',
                            expiryDate: '2026-12-31',
                        },
                    ],
                    certificationValidation: { validated: true, checkedAt: '2026-01-10T09:00:00Z' },
                    additionalDocRequired: false,
                    neurodiversityExperience: 8,
                    experienceYears: 12,
                    approach: 'CBT + Coaching',
                    services: ['individual_therapy', 'company_consulting', 'assessment', 'workplace_adaptation'],
                    languages: ['English', 'Spanish', 'Catalan'],
                    location: 'Barcelona, Spain',
                    bio: 'Specialized in neurodivergent workplace adaptation with 12 years of experience. Bilingual therapist helping individuals and companies build inclusive environments.',
                    acceptingNewClients: true,

                    // Clientes y relaciones
                    clients: [individual1Id, individual2Id],
                    companyPartners: [companyId],
                    companyContracts: {
                        [companyId]: {
                            serviceType: 'consulting',
                            contractStartDate: '2026-01-01',
                            addedAt: '2026-01-01T08:00:00Z',
                        },
                    },
                    pendingRequests: [],

                    // Capacidad
                    maxClients: 20,
                    currentClients: 2,

                    // Verificación
                    verificationStatus: 'verified',
                    verifiedAt: new Date('2026-01-10T10:00:00Z'),
                    verifiedBy: 'admin_system',
                    verificationNotes: 'Credentials verified: CAHP + ASS certifications confirmed.',

                    // Gamificación
                    badges: ['neurodiversity_expert', 'early_adopter', 'verified_professional'],
                    warnings: [],

                    // Metadata
                    metadata: {
                        lastLogin: new Date().toISOString(),
                        sessionsCompleted: 47,
                        clientSatisfactionScore: 4.8,
                        averageResponseTime: 2.5,
                        lastSessionDate: '2026-02-18T16:00:00Z',
                    },
                }
            }
        },
        include: { therapist: true },
    })
    const therapistId = therapistUser.therapist!.id
    console.log('🧠 Mock Therapist ensured:', therapistUser.email, '→', therapistId)

    // ═══════════════════════════════════════════════════════════════════
    // 2. JOBS — Two job postings for the company
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📋 Creating Job Postings...')

    const job1 = await prisma.job.upsert({
        where: { id: 'job_frontend_mock' },
        update: {},
        create: {
            id: 'job_frontend_mock',
            companyId: companyId,
            title: 'Frontend Developer (React/Next.js)',
            description: 'We are looking for a frontend developer comfortable working in a flexible, async-first environment. Accommodations available.',
            status: 'PUBLISHED',
            skills: ['React', 'Next.js', 'TypeScript', 'CSS'],
            accommodations: ['flexible_schedule', 'remote_work', 'noise_cancelling', 'written_instructions'],
            salaryRange: '35000-55000 EUR',
            workMode: 'remote',
            visibility: 'public',
            location: 'Remote (Spain)',
            benefits: [
                { name: 'Flexible hours', value: 'Choose your own schedule' },
                { name: 'Quiet office option', value: 'Sensory-friendly workspace available' },
                { name: 'Mental health days', value: '5 extra days per year' },
            ],
            teamSize: '5-10',
            reportingStructure: 'Flat, async-first',
            inclusivityScore: 85,
            inclusivityAnalysis: {
                score: 85,
                strengths: ['flexible_schedule', 'accommodation_listed', 'inclusive_language'],
                improvements: ['could_mention_mentoring_program'],
                analyzedAt: '2026-02-15T10:00:00Z',
            },
        }
    })
    console.log('   - Job 1:', job1.title, '→', job1.id)

    const job2 = await prisma.job.upsert({
        where: { id: 'job_data_mock' },
        update: {},
        create: {
            id: 'job_data_mock',
            companyId: companyId,
            title: 'Data Scientist (ML/Python)',
            description: 'Data science role with structured onboarding and predictable routines. We value systematic thinkers.',
            status: 'PUBLISHED',
            skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
            accommodations: ['predictable_schedule', 'written_instructions', 'quiet_workspace', 'structured_meetings'],
            salaryRange: '40000-60000 EUR',
            workMode: 'hybrid',
            visibility: 'public',
            location: 'Barcelona, Spain',
            benefits: [
                { name: 'Structured onboarding', value: '4-week program with written guides' },
                { name: 'Predictable routine', value: 'Fixed meeting schedule, no surprises' },
                { name: 'Sensory room', value: 'Available on-site' },
            ],
            teamSize: '3-5',
            reportingStructure: 'Clear hierarchy with weekly 1:1s',
            inclusivityScore: 92,
            inclusivityAnalysis: {
                score: 92,
                strengths: ['structured_environment', 'explicit_accommodations', 'predictable_culture'],
                improvements: [],
                analyzedAt: '2026-02-16T11:00:00Z',
            },
        }
    })
    console.log('   - Job 2:', job2.title, '→', job2.id)

    // ═══════════════════════════════════════════════════════════════════
    // 3. MATCHINGS — Various statuses
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🤖 Creating Matching records...')

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    // Match 1: Candidate 1 ↔ Frontend Job — APPROVED (accepted)
    const match1 = await prisma.matching.upsert({
        where: { individualId_jobId: { individualId: individual1Id, jobId: job1.id } },
        update: {},
        create: {
            jobId: job1.id,
            individualId: individual1Id,
            companyId: companyId,
            aiScore: 82.5,
            aiFactors: {
                skills: 35,
                accommodations: 25,
                preferences: 15,
                location: 7.5,
            },
            aiExplanation: 'Strong skills match (React, Node.js, TypeScript). Good accommodation alignment (flexible schedule, remote work). Location preference matches.',
            algorithmVersion: 'keyword-v1',
            aiSystemName: 'DiversIA-Matching',
            status: 'APPROVED',
            humanOversightRequired: true,
            reviewedBy: 'admin_system',
            reviewedAt: new Date('2026-02-17T14:00:00Z'),
            reviewNotes: 'Skills and accommodation match verified. Approved for candidate consent.',
            expiresAt: expirationDate,
            acceptedAt: new Date('2026-02-18T09:00:00Z'),
            candidateData: {
                userId: individual1Id,
                name: 'Candidate-A7K',
                skills: ['React', 'Node.js', 'TypeScript'],
                accommodationsNeeded: 'flexible_schedule',
                assessmentScore: 78,
                experience: '5 years',
            },
            connectionId: null, // Will be set after connection creation
            candidateNotified: true,
            companyCanView: true,
        }
    })
    console.log('   - Match 1: Candidate 1 ↔ Frontend Job [APPROVED]', match1.id)

    // Match 2: Candidate 2 ↔ Data Job — PENDING (awaiting candidate response)
    const match2 = await prisma.matching.upsert({
        where: { individualId_jobId: { individualId: individual2Id, jobId: job2.id } },
        update: {},
        create: {
            jobId: job2.id,
            individualId: individual2Id,
            companyId: companyId,
            aiScore: 91.0,
            aiFactors: {
                skills: 38,
                accommodations: 28,
                preferences: 18,
                location: 7,
            },
            aiExplanation: 'Excellent skills match (Python, ML, SQL). Strong accommodation alignment (predictable schedule, written instructions). Barcelona location matches.',
            algorithmVersion: 'keyword-v1',
            aiSystemName: 'DiversIA-Matching',
            status: 'PENDING',
            humanOversightRequired: true,
            reviewedBy: 'admin_system',
            reviewedAt: new Date('2026-02-19T10:00:00Z'),
            reviewNotes: 'High confidence match. Awaiting candidate consent.',
            expiresAt: expirationDate,
            candidateData: {
                userId: individual2Id,
                name: 'Candidate-B3M',
                skills: ['Python', 'Machine Learning', 'SQL'],
                accommodationsNeeded: 'predictable_schedule',
                assessmentScore: 85,
                experience: '3 years',
            },
            candidateNotified: true,
            companyCanView: false, // Not visible until candidate accepts
        }
    })
    console.log('   - Match 2: Candidate 2 ↔ Data Job [PENDING]', match2.id)

    // Match 3: Candidate 1 ↔ Data Job — REJECTED by candidate
    const match3 = await prisma.matching.upsert({
        where: { individualId_jobId: { individualId: individual1Id, jobId: job2.id } },
        update: {},
        create: {
            jobId: job2.id,
            individualId: individual1Id,
            companyId: companyId,
            aiScore: 45.0,
            aiFactors: {
                skills: 10,
                accommodations: 20,
                preferences: 10,
                location: 5,
            },
            aiExplanation: 'Low skills match (no Python/ML experience). Moderate accommodation alignment.',
            algorithmVersion: 'keyword-v1',
            aiSystemName: 'DiversIA-Matching',
            status: 'REJECTED',
            humanOversightRequired: true,
            reviewedBy: 'admin_system',
            reviewedAt: new Date('2026-02-17T15:00:00Z'),
            expiresAt: expirationDate,
            rejectedAt: new Date('2026-02-18T11:00:00Z'),
            rejectionReason: 'Role does not match my skill set',
            reasonPrivate: true, // GDPR: company cannot see rejection reason
            candidateData: {
                userId: individual1Id,
                name: 'Candidate-A7K',
                skills: ['React', 'Node.js'],
                accommodationsNeeded: 'flexible_schedule',
                assessmentScore: 78,
                experience: '5 years',
            },
            candidateNotified: true,
            companyCanView: false,
        }
    })
    console.log('   - Match 3: Candidate 1 ↔ Data Job [REJECTED]', match3.id)

    // ═══════════════════════════════════════════════════════════════════
    // 4. CONNECTIONS — Ecosystem 360 + Job pipeline
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🔗 Creating Connections...')

    // Connection 1: Company ↔ Therapist (Consulting)
    const connConsulting = await prisma.connection.create({
        data: {
            type: 'CONSULTING',
            status: 'active',
            companyId: companyId,
            therapistId: therapistId,
            sharedData: ['employees_list', 'training_needs', 'accommodation_reports'],
            customPrivacy: { shareEmployeeData: true, shareFinancials: false },
            consentGivenAt: new Date('2026-01-01T08:00:00Z'),
            pipelineStage: 'newMatches', // N/A for consulting, default value
            metadata: {
                lastInteraction: '2026-02-15T14:00:00Z',
                messagesSent: 5,
                lastPrivacyUpdate: null,
                lastStageUpdate: null,
                lastDataRevocation: null,
            },
        }
    })
    console.log('   - Connection: Company ↔ Therapist (Consulting)', connConsulting.id)

    // Connection 2: Candidate 1 ↔ Therapist (Therapy/Support)
    const connTherapy1 = await prisma.connection.create({
        data: {
            type: 'THERAPY',
            status: 'active',
            individualId: individual1Id,
            therapistId: therapistId,
            sharedData: ['diagnosis', 'accommodations', 'assessment', 'medical_history'],
            customPrivacy: { shareDiagnosis: true, shareTherapistContact: false },
            consentGivenAt: new Date('2026-01-05T10:00:00Z'),
            pipelineStage: 'newMatches', // N/A for therapy
            metadata: {
                lastInteraction: '2026-02-18T16:00:00Z',
                messagesSent: 12,
                lastPrivacyUpdate: null,
                lastStageUpdate: null,
                lastDataRevocation: null,
            },
        }
    })
    console.log('   - Connection: Candidate 1 ↔ Therapist (Therapy)', connTherapy1.id)

    // Connection 3: Candidate 2 ↔ Therapist (Therapy/Support)
    const connTherapy2 = await prisma.connection.create({
        data: {
            type: 'THERAPY',
            status: 'active',
            individualId: individual2Id,
            therapistId: therapistId,
            sharedData: ['diagnosis', 'accommodations', 'assessment'],
            customPrivacy: { shareDiagnosis: true, shareTherapistContact: false },
            consentGivenAt: new Date('2026-01-20T14:00:00Z'),
            pipelineStage: 'newMatches',
            metadata: {
                lastInteraction: '2026-02-17T11:00:00Z',
                messagesSent: 6,
                lastPrivacyUpdate: null,
                lastStageUpdate: null,
                lastDataRevocation: null,
            },
        }
    })
    console.log('   - Connection: Candidate 2 ↔ Therapist (Therapy)', connTherapy2.id)

    // Connection 4: Candidate 1 ↔ Company (Job Match — from accepted match1)
    const connJobMatch = await prisma.connection.create({
        data: {
            type: 'JOB_MATCH',
            status: 'active',
            individualId: individual1Id,
            companyId: companyId,
            matchId: match1.id,
            jobId: job1.id,
            sharedData: ['name', 'skills', 'experience', 'education', 'accommodations'],
            customPrivacy: { showRealName: true, shareDiagnosis: false, shareTherapistContact: false, shareAssessmentDetails: false },
            consentGivenAt: new Date('2026-02-18T09:00:00Z'),
            pipelineStage: 'underReview',
            metadata: {
                lastInteraction: '2026-02-19T10:00:00Z',
                messagesSent: 1,
                lastPrivacyUpdate: null,
                lastStageUpdate: '2026-02-19T10:00:00Z',
                lastDataRevocation: null,
            },
        }
    })
    console.log('   - Connection: Candidate 1 ↔ Company (Job Match - underReview)', connJobMatch.id)

    // Update match1 with connectionId
    await prisma.matching.update({
        where: { id: match1.id },
        data: { connectionId: connJobMatch.id },
    })
    console.log('   - Match 1 updated with connectionId:', connJobMatch.id)

    // ═══════════════════════════════════════════════════════════════════
    // 5. AUDIT LOGS — GDPR + EU AI Act compliance trail
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📜 Creating Audit Log entries...')

    const retentionDate = new Date()
    retentionDate.setFullYear(retentionDate.getFullYear() + 7) // GDPR Art. 5.1.e

    const auditEntries = [
        {
            userId: candidate1User.id,
            eventType: 'USER_LOGIN' as const,
            details: { method: 'credentials', userAgent: 'seed-script' },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-18T08:00:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: candidate1User.id,
            eventType: 'MATCHING_EXECUTED' as const,
            details: {
                matchId: match1.id,
                jobId: job1.id,
                aiScore: 82.5,
                algorithmVersion: 'keyword-v1',
                aiSystemName: 'DiversIA-Matching',
                humanOversightRequired: true,
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-17T14:00:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: candidate1User.id,
            eventType: 'MATCHING_REVIEWED' as const,
            details: {
                matchId: match1.id,
                reviewedBy: 'admin_system',
                decision: 'APPROVED',
                reviewNotes: 'Skills and accommodation match verified.',
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-17T14:05:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: candidate1User.id,
            eventType: 'CONSENT_GIVEN' as const,
            details: {
                matchId: match1.id,
                connectionId: connJobMatch.id,
                sharedData: ['name', 'skills', 'experience', 'education', 'accommodations'],
                customPrivacy: { showRealName: true, shareDiagnosis: false },
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-18T09:00:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: companyUser.id,
            eventType: 'PROFILE_VIEWED' as const,
            details: {
                targetUser: individual1Id,
                accessedBy: companyId,
                dataAccessed: ['name', 'skills', 'experience'],
                dataType: 'Professional',
                sensitivityLevel: 'medium',
                reason: 'pipeline_review',
                connectionId: connJobMatch.id,
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-19T10:00:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: therapistUser.id,
            eventType: 'THERAPIST_ACCESS' as const,
            details: {
                targetUser: individual1Id,
                accessedBy: therapistId,
                dataAccessed: ['profile', 'diagnoses', 'medicalHistory', 'assessment'],
                dataType: 'Medical',
                sensitivityLevel: 'high',
                reason: 'therapist_patient_care',
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-18T16:00:00Z'),
            retentionUntil: retentionDate,
        },
        {
            userId: candidate2User.id,
            eventType: 'MATCHING_EXECUTED' as const,
            details: {
                matchId: match2.id,
                jobId: job2.id,
                aiScore: 91.0,
                algorithmVersion: 'keyword-v1',
                aiSystemName: 'DiversIA-Matching',
                humanOversightRequired: true,
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-02-19T10:00:00Z'),
            retentionUntil: retentionDate,
        },
    ]

    for (const entry of auditEntries) {
        await prisma.auditLog.create({ data: entry })
    }
    console.log(`   - Created ${auditEntries.length} audit log entries`)

    // ═══════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n✅ Seeding finished. Summary:')
    console.log('   Users:       4 (1 company, 2 candidates, 1 therapist)')
    console.log('   Jobs:        2 (Frontend, Data Science)')
    console.log('   Matchings:   3 (1 APPROVED, 1 PENDING, 1 REJECTED)')
    console.log('   Connections: 4 (1 consulting, 2 therapy, 1 job_match)')
    console.log('   Audit Logs:  7 (login, matching, review, consent, access)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
