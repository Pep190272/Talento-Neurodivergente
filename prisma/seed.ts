import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { candidateProfiles } from './seed-data/candidates'
import { companyProfiles } from './seed-data/companies'
import { therapistProfiles } from './seed-data/therapists'

// ═══════════════════════════════════════════════════════════════════
// DIVERSIA ETERNALS — Seeder Robusto
// ═══════════════════════════════════════════════════════════════════
// REGLA DE ORO: Todos los datos seed usan @seed.diversia.com
// Estos datos JAMÁS se mezclan con datos reales de producción.
// Son la prueba de vida del algoritmo de matching.
// ═══════════════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('DATABASE_URL is required to run seed')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Helpers
const hash = (pw: string) => bcrypt.hash(pw, 10)

interface UserRef { id: string; email: string; [key: string]: unknown }

interface CreatedEntities {
    companies: Map<string, { userId: string; companyId: string }>
    individuals: Map<string, { userId: string; individualId: string }>
    therapists: Map<string, { userId: string; therapistId: string }>
    jobs: Map<string, string> // jobId -> companyId
    matchings: string[]
    connections: string[]
}

async function main() {
    console.log('🌱 ═══════════════════════════════════════════════════════')
    console.log('   DIVERSIA ETERNALS — Seeder Robusto')
    console.log('   Datos seed: @seed.diversia.com (NUNCA mezclar con prod)')
    console.log('═══════════════════════════════════════════════════════════\n')

    const entities: CreatedEntities = {
        companies: new Map(),
        individuals: new Map(),
        therapists: new Map(),
        jobs: new Map(),
        matchings: [],
        connections: [],
    }

    // Password hashes (reutilizables)
    const passwords = {
        candidate: await hash('candidate123'),
        company: await hash('company123'),
        therapist: await hash('therapist123'),
        admin: await hash('d1v3rs14Eternal$'),
    }

    // ═══════════════════════════════════════════════════════════════
    // 0. SUPER ADMIN
    // ═══════════════════════════════════════════════════════════════
    console.log('🛡️  Creating Super Admin...')
    const adminUser = await prisma.user.upsert({
        where: { email: 'diversiaeternals@gmail.com' },
        update: { passwordHash: passwords.admin },
        create: {
            email: 'diversiaeternals@gmail.com',
            passwordHash: passwords.admin,
            userType: 'admin',
        },
    })
    console.log('   ✓ Super Admin:', adminUser.email, '→', adminUser.id)

    // ═══════════════════════════════════════════════════════════════
    // 1. EMPRESAS (10 empresas, 22+ ofertas)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🏢 Creating Companies & Jobs...')

    for (const company of companyProfiles) {
        const user = await prisma.user.upsert({
            where: { email: company.email },
            update: { passwordHash: passwords.company },
            create: {
                email: company.email,
                passwordHash: passwords.company,
                userType: 'company',
                company: {
                    create: {
                        name: company.name,
                        industry: company.industry,
                        size: company.size,
                        location: company.location,
                        website: company.website,
                        description: company.description,
                        diversityCommitment: company.diversityCommitment,
                        neurodiversityPrograms: company.neurodiversityPrograms as unknown as Parameters<typeof prisma.company.create>[0]['data']['neurodiversityPrograms'],
                        subscriptionPlan: company.subscriptionPlan,
                        metadata: company.metadata as Record<string, string | number>,
                    },
                },
            },
            include: { company: true },
        })
        const companyId = user.company!.id
        entities.companies.set(company.email, { userId: user.id, companyId })
        console.log(`   ✓ ${company.name} (${company.industry}) → ${companyId}`)

        // Create jobs for this company
        for (const job of company.jobs) {
            const created = await prisma.job.upsert({
                where: { id: job.id },
                update: {},
                create: {
                    id: job.id,
                    companyId,
                    title: job.title,
                    description: job.description,
                    status: job.status,
                    skills: job.skills,
                    accommodations: job.accommodations,
                    salaryRange: job.salaryRange,
                    workMode: job.workMode,
                    visibility: job.visibility,
                    location: job.location,
                    benefits: job.benefits,
                    teamSize: job.teamSize,
                    reportingStructure: job.reportingStructure,
                    inclusivityScore: job.inclusivityScore,
                    inclusivityAnalysis: job.inclusivityAnalysis,
                },
            })
            entities.jobs.set(created.id, companyId)
            console.log(`     - ${job.title} → ${created.id}`)
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. CANDIDATOS (16 perfiles neurodivergentes diversos)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🧑‍💻 Creating Candidates (16 diverse neurodivergent profiles)...')

    for (const candidate of candidateProfiles) {
        const user = await prisma.user.upsert({
            where: { email: candidate.email },
            update: { passwordHash: passwords.candidate },
            create: {
                email: candidate.email,
                passwordHash: passwords.candidate,
                userType: 'individual',
                individual: {
                    create: {
                        firstName: candidate.firstName,
                        lastName: candidate.lastName,
                        diagnoses: candidate.diagnoses,
                        accommodationsNeeded: candidate.accommodationsNeeded,
                        experienceYears: candidate.experienceYears,
                        bio: candidate.bio,
                        location: candidate.location,
                        skills: candidate.skills,
                        experience: candidate.experience,
                        education: candidate.education,
                        preferences: candidate.preferences,
                        privacy: candidate.privacy,
                        assessment: candidate.assessment,
                        metadata: candidate.metadata,
                        validationStatus: 'validated',
                    },
                },
            },
            include: { individual: true },
        })
        const individualId = user.individual!.id
        entities.individuals.set(candidate.email, { userId: user.id, individualId })
        const diag = candidate.diagnoses.map(d => d.replace('encrypted:', '')).join(', ')
        console.log(`   ✓ ${candidate.firstName} ${candidate.lastName} [${diag}] → ${individualId}`)
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. TERAPEUTAS (6 profesionales variados)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🧠 Creating Therapists (6 varied professionals)...')

    for (const therapist of therapistProfiles) {
        const user = await prisma.user.upsert({
            where: { email: therapist.email },
            update: { passwordHash: passwords.therapist },
            create: {
                email: therapist.email,
                passwordHash: passwords.therapist,
                userType: 'therapist',
                therapist: {
                    create: {
                        name: therapist.name,
                        specialty: therapist.specialty,
                        licenseNumber: therapist.licenseNumber,
                        specializations: therapist.specializations,
                        certifications: therapist.certifications,
                        certificationValidation: therapist.certificationValidation,
                        neurodiversityExperience: therapist.neurodiversityExperience,
                        experienceYears: therapist.experienceYears,
                        approach: therapist.approach,
                        services: therapist.services,
                        languages: therapist.languages,
                        location: therapist.location,
                        bio: therapist.bio,
                        acceptingNewClients: therapist.acceptingNewClients,
                        maxClients: therapist.maxClients,
                        currentClients: therapist.currentClients,
                        verificationStatus: therapist.verificationStatus,
                        verifiedAt: therapist.verifiedAt,
                        verifiedBy: therapist.verifiedBy,
                        verificationNotes: therapist.verificationNotes,
                        badges: therapist.badges,
                        metadata: therapist.metadata,
                        clients: [],
                        companyPartners: [],
                        companyContracts: {},
                        pendingRequests: [],
                        warnings: [],
                    },
                },
            },
            include: { therapist: true },
        })
        const therapistId = user.therapist!.id
        entities.therapists.set(therapist.email, { userId: user.id, therapistId })
        console.log(`   ✓ ${therapist.name} (${therapist.specialty}) → ${therapistId}`)
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. MATCHINGS (40+ con distribución realista)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🤖 Creating Matchings (40+ with realistic distribution)...')

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    // Mapping helper
    const getIndividual = (email: string) => entities.individuals.get(email)!
    const getCompany = (email: string) => entities.companies.get(email)!

    // Define matching scenarios (candidate email -> job id -> config)
    const matchingScenarios: Array<{
        candidateEmail: string
        jobId: string
        companyEmail: string
        aiScore: number
        aiFactors: { skills: number; accommodations: number; preferences: number; location: number }
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CONTESTED'
        explanation: string
        accepted?: boolean
        rejected?: boolean
        contested?: boolean
    }> = [
        // ── NeuraTech Frontend ──
        { candidateEmail: 'carlos.martinez@seed.diversia.com', jobId: 'job_neuratech_frontend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 88.5, aiFactors: { skills: 37, accommodations: 27, preferences: 18, location: 6.5 }, status: 'APPROVED', explanation: 'Excelente match de skills (React, Next.js, TypeScript). Accommodations alineadas (horario flexible, remoto). Preferencia salarial dentro del rango.', accepted: true },
        { candidateEmail: 'pablo.herrera@seed.diversia.com', jobId: 'job_neuratech_frontend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 72.0, aiFactors: { skills: 28, accommodations: 22, preferences: 14, location: 8 }, status: 'APPROVED', explanation: 'Match moderado en skills (Figma, CSS sí pero no React fuerte). Buenas accommodations (remoto, flexible). Podría ser un buen perfil UX/UI dentro del equipo frontend.', accepted: true },
        { candidateEmail: 'sofia.chen.w@seed.diversia.com', jobId: 'job_neuratech_frontend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 45.0, aiFactors: { skills: 10, accommodations: 18, preferences: 12, location: 5 }, status: 'REJECTED', explanation: 'Skills no coinciden (perfil estratégico vs técnico). Accommodations parciales.', rejected: true },

        // ── NeuraTech Data ──
        { candidateEmail: 'ana.garcia@seed.diversia.com', jobId: 'job_neuratech_data', companyEmail: 'neuratech@seed.diversia.com', aiScore: 94.0, aiFactors: { skills: 39, accommodations: 29, preferences: 19, location: 7 }, status: 'APPROVED', explanation: 'Match excelente (Python, ML, SQL, TensorFlow). Accommodations perfectas (entorno estructurado, instrucciones escritas). Barcelona match.', accepted: true },
        { candidateEmail: 'miguel.torres@seed.diversia.com', jobId: 'job_neuratech_data', companyEmail: 'neuratech@seed.diversia.com', aiScore: 68.0, aiFactors: { skills: 22, accommodations: 20, preferences: 16, location: 10 }, status: 'PENDING', explanation: 'Skills parciales (no Python directo pero capacidad de aprendizaje rápido). Overqualified para el puesto. Barcelona match.' },

        // ── NeuraTech Backend ──
        { candidateEmail: 'raul.castro@seed.diversia.com', jobId: 'job_neuratech_backend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 91.0, aiFactors: { skills: 38, accommodations: 28, preferences: 17, location: 8 }, status: 'APPROVED', explanation: 'Match excelente en Java/Spring/Docker/AWS. Ambiente remoto y async ideal. Espacio privado disponible.' },
        { candidateEmail: 'carlos.martinez@seed.diversia.com', jobId: 'job_neuratech_backend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 52.0, aiFactors: { skills: 15, accommodations: 20, preferences: 12, location: 5 }, status: 'REJECTED', explanation: 'Skills no coinciden (frontend vs backend). Accommodations sí alineadas.', rejected: true },

        // ── Cocina Inclusiva Repostería ──
        { candidateEmail: 'lucia.fernandez@seed.diversia.com', jobId: 'job_cocina_reposteria', companyEmail: 'cocina.inclusiva@seed.diversia.com', aiScore: 92.0, aiFactors: { skills: 38, accommodations: 28, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match perfecto: repostería creativa + APPCC. Recetas visuales ideales para TDAH. Valencia match.', accepted: true },

        // ── Cocina Inclusiva Sala ──
        { candidateEmail: 'david.ortiz@seed.diversia.com', jobId: 'job_cocina_sala', companyEmail: 'cocina.inclusiva@seed.diversia.com', aiScore: 65.0, aiFactors: { skills: 24, accommodations: 20, preferences: 14, location: 7 }, status: 'PENDING', explanation: 'Buena atención al cliente verbal. Formación disponible. Turno fijo es positivo. Ubicación requiere reubicación.' },

        // ── NutriDiversa Calidad ──
        { candidateEmail: 'marcos.delgado@seed.diversia.com', jobId: 'job_nutri_calidad', companyEmail: 'nutridiversa@seed.diversia.com', aiScore: 97.0, aiFactors: { skills: 40, accommodations: 30, preferences: 19, location: 8 }, status: 'APPROVED', explanation: 'Match casi perfecto: APPCC, ISO 22000, microbiología. Entorno estructurado ideal para TEA. Zaragoza match.', accepted: true },
        { candidateEmail: 'alberto.jimenez@seed.diversia.com', jobId: 'job_nutri_calidad', companyEmail: 'nutridiversa@seed.diversia.com', aiScore: 71.0, aiFactors: { skills: 22, accommodations: 24, preferences: 16, location: 9 }, status: 'PENDING', explanation: 'Match parcial: auditoría y verificación coinciden. TOC puede ser ventaja en control de calidad. Sin experiencia alimentaria directa.' },

        // ── NutriDiversa Logística ──
        { candidateEmail: 'irene.lopez@seed.diversia.com', jobId: 'job_nutri_logistica', companyEmail: 'nutridiversa@seed.diversia.com', aiScore: 63.0, aiFactors: { skills: 20, accommodations: 22, preferences: 14, location: 7 }, status: 'PENDING', explanation: 'Skills parciales (SAP WMS sí, Excel básico). Accommodations buenas (rutina, oficina). Requiere reubicación.' },

        // ── ServiPlus Mantenimiento ──
        { candidateEmail: 'diego.romero@seed.diversia.com', jobId: 'job_servi_mantenimiento', companyEmail: 'serviplus@seed.diversia.com', aiScore: 89.0, aiFactors: { skills: 37, accommodations: 26, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match excelente: electricidad, fontanería, climatización, PRL. Variedad de tareas ideal para TDAH. Sevilla→Madrid requiere reubicación pero dispuesto.' },

        // ── ServiPlus Jardinería ──
        { candidateEmail: 'diego.romero@seed.diversia.com', jobId: 'job_servi_jardineria', companyEmail: 'serviplus@seed.diversia.com', aiScore: 60.0, aiFactors: { skills: 15, accommodations: 24, preferences: 14, location: 7 }, status: 'WITHDRAWN', explanation: 'Skills parciales (mantenimiento sí, jardinería no). Ambiente exterior y actividad física son positivos.' },

        // ── ServiPlus Limpieza ──
        { candidateEmail: 'irene.lopez@seed.diversia.com', jobId: 'job_servi_limpieza', companyEmail: 'serviplus@seed.diversia.com', aiScore: 74.0, aiFactors: { skills: 22, accommodations: 28, preferences: 16, location: 8 }, status: 'APPROVED', explanation: 'Accommodations excelentes (checklist visual, ritmo propio, sin público, turno fijo). Perfil organizativo de TEA es ideal.', accepted: true },

        // ── Clínica Admin ──
        { candidateEmail: 'elena.ruiz@seed.diversia.com', jobId: 'job_clinica_admin', companyEmail: 'clinica.neurovida@seed.diversia.com', aiScore: 66.0, aiFactors: { skills: 20, accommodations: 22, preferences: 16, location: 8 }, status: 'PENDING', explanation: 'Skills parciales (ofimática sí, sanitario no). Discalculia puede ser reto con gestión de citas numéricas. Entorno tranquilo positivo.' },
        { candidateEmail: 'david.ortiz@seed.diversia.com', jobId: 'job_clinica_admin', companyEmail: 'clinica.neurovida@seed.diversia.com', aiScore: 73.0, aiFactors: { skills: 24, accommodations: 24, preferences: 17, location: 8 }, status: 'APPROVED', explanation: 'Buena atención telefónica (verbal fuerte). Gestión de citas y archivo. Entorno estructurado. Sevilla→Barcelona requiere reubicación.' },

        // ── Clínica Auxiliar ──
        { candidateEmail: 'nuria.santos@seed.diversia.com', jobId: 'job_clinica_auxiliar', companyEmail: 'clinica.neurovida@seed.diversia.com', aiScore: 58.0, aiFactors: { skills: 16, accommodations: 22, preferences: 14, location: 6 }, status: 'REJECTED', explanation: 'Skills no coinciden (educadora social vs auxiliar enfermería). Empatía es buena pero falta formación sanitaria.', rejected: true },

        // ── Academia Docente ──
        { candidateEmail: 'laura.vidal@seed.diversia.com', jobId: 'job_academia_docente', companyEmail: 'academia.brillante@seed.diversia.com', aiScore: 87.0, aiFactors: { skills: 35, accommodations: 26, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match excelente: docencia, investigación, pedagogía. Altas capacidades aportan profundidad. Madrid match.', accepted: true },

        // ── Academia Apoyo ──
        { candidateEmail: 'nuria.santos@seed.diversia.com', jobId: 'job_academia_apoyo', companyEmail: 'academia.brillante@seed.diversia.com', aiScore: 78.0, aiFactors: { skills: 28, accommodations: 24, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match bueno: educación social, empatía, dinamización. Dislexia compensa con informes verbales. Madrid requiere reubicación desde Granada.' },
        { candidateEmail: 'jorge.navarro@seed.diversia.com', jobId: 'job_academia_apoyo', companyEmail: 'academia.brillante@seed.diversia.com', aiScore: 81.0, aiFactors: { skills: 30, accommodations: 26, preferences: 17, location: 8 }, status: 'PENDING', explanation: 'Consultor accesibilidad + psicología. Experiencia con UX research útil para materiales adaptados. Madrid match.' },

        // ── TiendaParaTodos Reponedor ──
        { candidateEmail: 'irene.lopez@seed.diversia.com', jobId: 'job_tienda_reponedor', companyEmail: 'tiendaparatodos@seed.diversia.com', aiScore: 86.0, aiFactors: { skills: 34, accommodations: 28, preferences: 16, location: 8 }, status: 'APPROVED', explanation: 'Match excelente: reposición, gestión inventarios, organización. Sin público. Planograma visual ideal para TEA. Bilbao→Barcelona requiere reubicación.' },

        // ── TiendaParaTodos Visual Merchandiser ──
        { candidateEmail: 'pablo.herrera@seed.diversia.com', jobId: 'job_tienda_visual', companyEmail: 'tiendaparatodos@seed.diversia.com', aiScore: 83.0, aiFactors: { skills: 32, accommodations: 26, preferences: 17, location: 8 }, status: 'PENDING', explanation: 'Match bueno: diseño de espacios, creatividad, planificación. Dislexia no es problema en trabajo visual. Madrid→Barcelona posible.' },
        { candidateEmail: 'clara.medina@seed.diversia.com', jobId: 'job_tienda_visual', companyEmail: 'tiendaparatodos@seed.diversia.com', aiScore: 79.0, aiFactors: { skills: 30, accommodations: 24, preferences: 17, location: 8 }, status: 'PENDING', explanation: 'Skills artísticos fuertes. Hipersensibilidad sensorial puede ser ventaja en diseño visual. Valencia→Barcelona posible.' },

        // ── LogiAccess Almacén ──
        { candidateEmail: 'irene.lopez@seed.diversia.com', jobId: 'job_logi_almacen', companyEmail: 'logiaccess@seed.diversia.com', aiScore: 93.0, aiFactors: { skills: 39, accommodations: 29, preferences: 18, location: 7 }, status: 'APPROVED', explanation: 'Match casi perfecto: picking, WMS SAP, inventarios, carretilla. WMS visual ideal. Bilbao match.', accepted: true },

        // ── LogiAccess Inventarios ──
        { candidateEmail: 'marcos.delgado@seed.diversia.com', jobId: 'job_logi_inventarios', companyEmail: 'logiaccess@seed.diversia.com', aiScore: 70.0, aiFactors: { skills: 22, accommodations: 24, preferences: 16, location: 8 }, status: 'PENDING', explanation: 'Control de calidad transferible a inventarios. SAP y documentación técnica son match. Zaragoza→Bilbao posible.' },

        // ── Fundación Puentes Educador ──
        { candidateEmail: 'nuria.santos@seed.diversia.com', jobId: 'job_ong_educador', companyEmail: 'fundacion.puentes@seed.diversia.com', aiScore: 95.0, aiFactors: { skills: 39, accommodations: 29, preferences: 19, location: 8 }, status: 'APPROVED', explanation: 'Match perfecto: educación social, mediación, intervención. Informes verbales disponibles. Granada match.', accepted: true },

        // ── Fundación Puentes Coordinador ──
        { candidateEmail: 'sofia.chen.w@seed.diversia.com', jobId: 'job_ong_coordinador', companyEmail: 'fundacion.puentes@seed.diversia.com', aiScore: 76.0, aiFactors: { skills: 26, accommodations: 24, preferences: 18, location: 8 }, status: 'PENDING', explanation: 'Skills de gestión y estrategia transferibles. Doble excepcionalidad aporta visión. Barcelona→Granada requiere reubicación o remoto.' },

        // ── Diversa Consulting Consultor ──
        { candidateEmail: 'jorge.navarro@seed.diversia.com', jobId: 'job_diversa_consultor', companyEmail: 'diversa.consulting@seed.diversia.com', aiScore: 90.0, aiFactors: { skills: 37, accommodations: 27, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match excelente: consultoría accesibilidad + neurodiversidad. Experiencia personal con dispraxia. Madrid→Barcelona posible con hybrid.' },
        { candidateEmail: 'sofia.chen.w@seed.diversia.com', jobId: 'job_diversa_consultor', companyEmail: 'diversa.consulting@seed.diversia.com', aiScore: 85.0, aiFactors: { skills: 33, accommodations: 26, preferences: 18, location: 8 }, status: 'APPROVED', explanation: 'Match bueno: Innovation consulting + D&I experience. Doble excepcionalidad aporta perspectiva única. Barcelona match.', accepted: true },

        // ── Diversa Consulting Formador ──
        { candidateEmail: 'laura.vidal@seed.diversia.com', jobId: 'job_diversa_formador', companyEmail: 'diversa.consulting@seed.diversia.com', aiScore: 84.0, aiFactors: { skills: 32, accommodations: 26, preferences: 18, location: 8 }, status: 'PENDING', explanation: 'Match bueno: docencia + investigación en neurodiversidad. Altas capacidades aportan profundidad. Madrid→Barcelona posible.' },
        { candidateEmail: 'elena.ruiz@seed.diversia.com', jobId: 'job_diversa_formador', companyEmail: 'diversa.consulting@seed.diversia.com', aiScore: 69.0, aiFactors: { skills: 22, accommodations: 22, preferences: 17, location: 8 }, status: 'PENDING', explanation: 'Skills de comunicación y storytelling transferibles a formación. Discalculia no es problema. Barcelona match.' },

        // ── CONTESTED match (EU AI Act Art. 22) ──
        { candidateEmail: 'alberto.jimenez@seed.diversia.com', jobId: 'job_neuratech_backend', companyEmail: 'neuratech@seed.diversia.com', aiScore: 38.0, aiFactors: { skills: 8, accommodations: 16, preferences: 10, location: 4 }, status: 'CONTESTED', explanation: 'Score bajo: contabilidad vs programación. Candidato impugna alegando que su atención al detalle (TOC) es transferible a QA.', contested: true },
    ]

    for (const scenario of matchingScenarios) {
        const individual = getIndividual(scenario.candidateEmail)
        const company = getCompany(scenario.companyEmail)

        try {
            const matchData: Record<string, unknown> = {
                jobId: scenario.jobId,
                individualId: individual.individualId,
                companyId: company.companyId,
                aiScore: scenario.aiScore,
                aiFactors: scenario.aiFactors,
                aiExplanation: scenario.explanation,
                algorithmVersion: 'keyword-v1',
                aiSystemName: 'DiversIA-Matching',
                status: scenario.status,
                humanOversightRequired: true,
                reviewedBy: 'admin_system',
                reviewedAt: new Date('2026-03-10T10:00:00Z'),
                expiresAt: expirationDate,
                candidateData: {
                    userId: individual.individualId,
                    name: `Candidate-${individual.individualId.slice(-4).toUpperCase()}`,
                    skills: candidateProfiles.find(c => c.email === scenario.candidateEmail)?.skills.slice(0, 3) || [],
                    assessmentScore: candidateProfiles.find(c => c.email === scenario.candidateEmail)?.assessment.score || 0,
                },
                candidateNotified: scenario.status !== 'PENDING',
                companyCanView: scenario.accepted === true,
            }

            if (scenario.accepted) {
                matchData.acceptedAt = new Date('2026-03-11T09:00:00Z')
                matchData.reviewNotes = 'Match verificado y aceptado por candidato.'
            }
            if (scenario.rejected) {
                matchData.rejectedAt = new Date('2026-03-11T11:00:00Z')
                matchData.rejectionReason = 'El puesto no coincide con mi perfil profesional'
                matchData.reasonPrivate = true
            }
            if (scenario.contested) {
                matchData.contestedAt = new Date('2026-03-12T09:00:00Z')
                matchData.contestReason = 'Considero que mis habilidades de verificación y atención al detalle son transferibles al área de QA/Testing, algo que el algoritmo no ha contemplado.'
            }
            if (scenario.status === 'WITHDRAWN') {
                matchData.expiredAt = new Date('2026-03-15T00:00:00Z')
            }

            const match = await prisma.matching.upsert({
                where: { individualId_jobId: { individualId: individual.individualId, jobId: scenario.jobId } },
                update: {},
                create: matchData as Parameters<typeof prisma.matching.create>[0]['data'],
            })
            entities.matchings.push(match.id)
        } catch (e) {
            // Skip if unique constraint violated (re-run safety)
            console.log(`     ⚠ Skipped duplicate: ${scenario.candidateEmail} ↔ ${scenario.jobId}`)
        }
    }
    console.log(`   ✓ Created ${entities.matchings.length} matchings`)

    // ═══════════════════════════════════════════════════════════════
    // 5. CONNECTIONS — Ecosystem 360
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🔗 Creating Connections (Therapy, Consulting, Job Matches)...')

    // Therapy connections: candidates <-> therapists
    const therapyConnections = [
        // Candidatos TDAH → Dra. Carmen Vega (TDAH specialist)
        { individualEmail: 'carlos.martinez@seed.diversia.com', therapistEmail: 'carmen.vega@seed.diversia.com' },
        { individualEmail: 'lucia.fernandez@seed.diversia.com', therapistEmail: 'carmen.vega@seed.diversia.com' },
        { individualEmail: 'diego.romero@seed.diversia.com', therapistEmail: 'carmen.vega@seed.diversia.com' },
        // Candidatos TEA → Dr. Alejandro Ruiz (TEA specialist)
        { individualEmail: 'ana.garcia@seed.diversia.com', therapistEmail: 'alejandro.ruiz@seed.diversia.com' },
        { individualEmail: 'marcos.delgado@seed.diversia.com', therapistEmail: 'alejandro.ruiz@seed.diversia.com' },
        { individualEmail: 'irene.lopez@seed.diversia.com', therapistEmail: 'alejandro.ruiz@seed.diversia.com' },
        // Candidatos Dislexia → Lda. Marta Soler
        { individualEmail: 'pablo.herrera@seed.diversia.com', therapistEmail: 'marta.soler@seed.diversia.com' },
        { individualEmail: 'nuria.santos@seed.diversia.com', therapistEmail: 'marta.soler@seed.diversia.com' },
        // Discalculia + TANV → Lda. Marta Soler (learning difficulties)
        { individualEmail: 'elena.ruiz@seed.diversia.com', therapistEmail: 'marta.soler@seed.diversia.com' },
        { individualEmail: 'david.ortiz@seed.diversia.com', therapistEmail: 'marta.soler@seed.diversia.com' },
        // Altas capacidades → Dra. Isabel Moreno
        { individualEmail: 'miguel.torres@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        { individualEmail: 'laura.vidal@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        { individualEmail: 'sofia.chen.w@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        // Tourette + TPS + TOC → Dra. Isabel Moreno (complex profiles)
        { individualEmail: 'raul.castro@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        { individualEmail: 'clara.medina@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        { individualEmail: 'alberto.jimenez@seed.diversia.com', therapistEmail: 'isabel.moreno@seed.diversia.com' },
        // Coaching laboral → Lda. Sofía Chen
        { individualEmail: 'jorge.navarro@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
        { individualEmail: 'sofia.chen.w@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
    ]

    for (const tc of therapyConnections) {
        const ind = getIndividual(tc.individualEmail)
        const ther = entities.therapists.get(tc.therapistEmail)!
        const conn = await prisma.connection.create({
            data: {
                type: 'THERAPY',
                status: 'active',
                individualId: ind.individualId,
                therapistId: ther.therapistId,
                sharedData: ['diagnosis', 'accommodations', 'assessment'],
                customPrivacy: { shareDiagnosis: true, shareTherapistContact: false },
                consentGivenAt: new Date('2026-02-01T10:00:00Z'),
                pipelineStage: 'newMatches',
                metadata: { lastInteraction: new Date().toISOString(), messagesSent: Math.floor(Math.random() * 20) + 1 },
            },
        })
        entities.connections.push(conn.id)
    }
    console.log(`   ✓ ${therapyConnections.length} therapy connections`)

    // Consulting connections: companies <-> therapists
    const consultingConnections = [
        { companyEmail: 'neuratech@seed.diversia.com', therapistEmail: 'carmen.vega@seed.diversia.com' },
        { companyEmail: 'neuratech@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
        { companyEmail: 'cocina.inclusiva@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
        { companyEmail: 'nutridiversa@seed.diversia.com', therapistEmail: 'alejandro.ruiz@seed.diversia.com' },
        { companyEmail: 'serviplus@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
        { companyEmail: 'tiendaparatodos@seed.diversia.com', therapistEmail: 'sofia.chen.t@seed.diversia.com' },
        { companyEmail: 'logiaccess@seed.diversia.com', therapistEmail: 'alejandro.ruiz@seed.diversia.com' },
        { companyEmail: 'diversa.consulting@seed.diversia.com', therapistEmail: 'carmen.vega@seed.diversia.com' },
        { companyEmail: 'diversa.consulting@seed.diversia.com', therapistEmail: 'pablo.navarro@seed.diversia.com' },
    ]

    for (const cc of consultingConnections) {
        const comp = getCompany(cc.companyEmail)
        const ther = entities.therapists.get(cc.therapistEmail)!
        const conn = await prisma.connection.create({
            data: {
                type: 'CONSULTING',
                status: 'active',
                companyId: comp.companyId,
                therapistId: ther.therapistId,
                sharedData: ['employees_list', 'training_needs', 'accommodation_reports'],
                customPrivacy: { shareEmployeeData: true, shareFinancials: false },
                consentGivenAt: new Date('2026-01-15T08:00:00Z'),
                pipelineStage: 'newMatches',
                metadata: { lastInteraction: new Date().toISOString(), messagesSent: Math.floor(Math.random() * 10) + 1 },
            },
        })
        entities.connections.push(conn.id)
    }
    console.log(`   ✓ ${consultingConnections.length} consulting connections`)

    // Job match connections (from accepted matchings)
    const acceptedScenarios = matchingScenarios.filter(s => s.accepted)
    let jobMatchCount = 0
    for (const scenario of acceptedScenarios) {
        const ind = getIndividual(scenario.candidateEmail)
        const comp = getCompany(scenario.companyEmail)
        const conn = await prisma.connection.create({
            data: {
                type: 'JOB_MATCH',
                status: 'active',
                individualId: ind.individualId,
                companyId: comp.companyId,
                jobId: scenario.jobId,
                sharedData: ['name', 'skills', 'experience', 'education', 'accommodations'],
                customPrivacy: { showRealName: true, shareDiagnosis: false },
                consentGivenAt: new Date('2026-03-11T09:00:00Z'),
                pipelineStage: ['underReview', 'interviewing', 'offered', 'hired'][Math.floor(Math.random() * 4)],
                metadata: { lastInteraction: new Date().toISOString(), messagesSent: Math.floor(Math.random() * 5) + 1 },
            },
        })
        entities.connections.push(conn.id)
        jobMatchCount++
    }
    console.log(`   ✓ ${jobMatchCount} job match connections`)

    // ═══════════════════════════════════════════════════════════════
    // 6. AUDIT LOGS — GDPR + EU AI Act
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📜 Creating Audit Log entries...')

    const retentionDate = new Date()
    retentionDate.setFullYear(retentionDate.getFullYear() + 7)

    const auditEntries: Array<{
        userId: string
        eventType: 'USER_LOGIN' | 'MATCHING_EXECUTED' | 'MATCHING_REVIEWED' | 'CONSENT_GIVEN' | 'CONSENT_REVOKED' | 'PROFILE_VIEWED' | 'THERAPIST_ACCESS' | 'AI_DECISION_MADE' | 'BIAS_CHECK_EXECUTED'
        details: Record<string, unknown>
        ipAddress: string
        timestamp: Date
        retentionUntil: Date
    }> = []

    // Login events for all users
    for (const [, { userId }] of entities.individuals) {
        auditEntries.push({
            userId, eventType: 'USER_LOGIN',
            details: { method: 'credentials', userAgent: 'seed-script' },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-03-10T08:00:00Z'),
            retentionUntil: retentionDate,
        })
    }

    // Matching execution events
    for (const matchId of entities.matchings.slice(0, 15)) {
        auditEntries.push({
            userId: adminUser.id, eventType: 'MATCHING_EXECUTED',
            details: { matchId, algorithmVersion: 'keyword-v1', aiSystemName: 'DiversIA-Matching' },
            ipAddress: '127.0.0.1',
            timestamp: new Date('2026-03-10T10:00:00Z'),
            retentionUntil: retentionDate,
        })
    }

    // Bias check
    auditEntries.push({
        userId: adminUser.id, eventType: 'BIAS_CHECK_EXECUTED',
        details: { scope: 'all_matchings', result: 'no_significant_bias_detected', confidence: 0.95 },
        ipAddress: '127.0.0.1',
        timestamp: new Date('2026-03-10T12:00:00Z'),
        retentionUntil: retentionDate,
    })

    for (const entry of auditEntries) {
        await prisma.auditLog.create({ data: entry })
    }
    console.log(`   ✓ Created ${auditEntries.length} audit log entries`)

    // ═══════════════════════════════════════════════════════════════
    // 7. SYNC auth.users (si existe el schema auth)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🔄 Syncing auth.users table...')

    const allSeedUsers: Array<{ user: UserRef; role: string; displayName: string; passwordHash: string }> = [
        { user: adminUser, role: 'admin', displayName: 'Super Admin DiversIA', passwordHash: passwords.admin },
    ]

    // Add companies
    for (const company of companyProfiles) {
        const entity = entities.companies.get(company.email)!
        allSeedUsers.push({ user: { id: entity.userId, email: company.email }, role: 'company', displayName: company.name, passwordHash: passwords.company })
    }

    // Add candidates
    for (const candidate of candidateProfiles) {
        const entity = entities.individuals.get(candidate.email)!
        allSeedUsers.push({ user: { id: entity.userId, email: candidate.email }, role: 'candidate', displayName: `${candidate.firstName} ${candidate.lastName}`, passwordHash: passwords.candidate })
    }

    // Add therapists
    for (const therapist of therapistProfiles) {
        const entity = entities.therapists.get(therapist.email)!
        allSeedUsers.push({ user: { id: entity.userId, email: therapist.email }, role: 'therapist', displayName: therapist.name, passwordHash: passwords.therapist })
    }

    let syncedCount = 0
    let syncErrors = 0
    for (const { user, role, displayName, passwordHash } of allSeedUsers) {
        try {
            await prisma.$executeRawUnsafe(`
                INSERT INTO auth.users (id, email, password_hash, role, status, display_name, created_at, updated_at)
                VALUES ($1, $2, $3, $4::auth.user_role, 'active', $5, NOW(), NOW())
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    role = EXCLUDED.role,
                    status = 'active',
                    display_name = EXCLUDED.display_name,
                    updated_at = NOW()
            `, user.id, user.email, passwordHash, role === 'admin' ? 'admin' : role, displayName)
            syncedCount++
        } catch (e) {
            syncErrors++
            if (syncErrors === 1) {
                console.log(`   ⚠ auth.users sync failed (schema may not exist): ${(e as Error).message?.slice(0, 100)}`)
            }
        }
    }
    if (syncErrors > 0) {
        console.log(`   ⚠ auth.users: ${syncedCount}/${allSeedUsers.length} synced (${syncErrors} failures)`)
        console.log('   💡 Run Alembic migrations first: cd services/auth-service && alembic upgrade head')
    } else {
        console.log(`   ✓ Synced ${syncedCount} users to auth.users`)
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ SEEDING COMPLETO. Resumen:')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   Super Admin:    1 (diversiaeternals@gmail.com)`)
    console.log(`   Empresas:       ${entities.companies.size} (tech, restauración, alimentación, servicios, salud, educación, retail, logística, ONG, consultoría)`)
    console.log(`   Ofertas:        ${entities.jobs.size}`)
    console.log(`   Candidatos:     ${entities.individuals.size} (TDAH, TEA, Dislexia, Discalculia, Dispraxia, Tourette, TPS, Altas Capacidades, TANV, TOC, Doble Excepcionalidad)`)
    console.log(`   Terapeutas:     ${entities.therapists.size}`)
    console.log(`   Matchings:      ${entities.matchings.length}`)
    console.log(`   Conexiones:     ${entities.connections.length}`)
    console.log(`   Audit Logs:     ${auditEntries.length}`)
    console.log(`   auth.users:     ${allSeedUsers.length}`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📌 RECORDATORIO: Todos los datos usan @seed.diversia.com')
    console.log('   NUNCA mezclar con datos reales de producción.')
    console.log('═══════════════════════════════════════════════════════════')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
