'use client'

import React, { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface CandidateData {
    id: string; name: string; email: string; status: string
    diagnoses: string[]; accommodations: string[]; skills: string[]
    experience: string; education: string; location: string
    memberSince: string
    totalMatches: number; pendingMatches: number; approvedMatches: number
    avgMatchScore: number; bestMatchScore: number
    pipeline: Record<string, number>
    topJobs: Array<{ title: string; company: string; score: number; status: string; location: string }>
    hasAssessment: boolean; assessmentDimensions: number
}

interface CompanyData {
    id: string; name: string; email: string; industry: string; location: string
    status: string; size: string; subscriptionPlan: string
    inclusivityScore: number; memberSince: string
    totalJobs: number; openJobs: number; closedJobs: number
    totalMatchings: number; approvedMatchings: number; avgScore: number
    pipeline: Record<string, number>
    jobs: Array<{
        id: string; title: string; status: string; location: string
        salary: unknown; inclusivityScore: number; matchCount: number; topScore: number
    }>
}

interface TherapistData {
    id: string; name: string; email: string; specialty: string
    licenseNumber: string; verificationStatus: string
    experienceYears: number; location: string
    services: string[]; certifications: string[]
    memberSince: string
    currentClients: number; maxClients: number; capacityPct: number
    sessionsCompleted: number; satisfactionScore: number; avgResponseTime: string
    therapyClients: Array<{ name: string; diagnoses: string[]; status: string; consentGivenAt: string }>
    consultingClients: Array<{ company: string; industry: string; status: string }>
}

// ═══════════════════════════════════════════════════════════════
// Main Demo Tab Component
// ═══════════════════════════════════════════════════════════════

export function DemoTab() {
    const [activeRole, setActiveRole] = useState<'candidate' | 'company' | 'therapist'>('candidate')
    const [selectedProfile, setSelectedProfile] = useState<number>(0)
    const [candidateData, setCandidateData] = useState<{ totalCandidates: number; candidates: CandidateData[] } | null>(null)
    const [companyData, setCompanyData] = useState<{ totalCompanies: number; companies: CompanyData[] } | null>(null)
    const [therapistData, setTherapistData] = useState<{ totalTherapists: number; therapists: TherapistData[] } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadRole(activeRole)
    }, [activeRole])

    async function loadRole(role: string) {
        setLoading(true)
        setSelectedProfile(0)
        try {
            const res = await fetch(`/api/admin/demo?role=${role}`)
            const data = await res.json()
            if (role === 'candidate') setCandidateData(data)
            else if (role === 'company') setCompanyData(data)
            else if (role === 'therapist') setTherapistData(data)
        } catch {
            // Silently handle
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { id: 'candidate' as const, label: 'Candidato', icon: '🧑‍💻', count: candidateData?.totalCandidates },
        { id: 'company' as const, label: 'Empresa', icon: '🏢', count: companyData?.totalCompanies },
        { id: 'therapist' as const, label: 'Terapeuta', icon: '🧠', count: therapistData?.totalTherapists },
    ]

    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-1">Demo Dashboards — Vista por Actor</h2>
                <p className="text-purple-100 text-sm">
                    Navega como cada tipo de usuario. Datos reales del seed ({candidateData?.totalCandidates || '16'} candidatos, {companyData?.totalCompanies || '10'} empresas, {therapistData?.totalTherapists || '6'} terapeutas).
                </p>
            </div>

            {/* Role Switcher */}
            <div className="flex gap-3">
                {roles.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setActiveRole(r.id)}
                        className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                            activeRole === r.id
                                ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-md scale-[1.02]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-2xl">{r.icon}</span>
                        <div className="text-left">
                            <div className="font-bold">{r.label}</div>
                            {r.count !== undefined && (
                                <div className="text-xs opacity-70">{r.count} perfiles seed</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                    <span className="ml-3 text-gray-500">Cargando datos seed...</span>
                </div>
            )}

            {!loading && activeRole === 'candidate' && candidateData && (
                <CandidateDemo
                    data={candidateData}
                    selected={selectedProfile}
                    onSelect={setSelectedProfile}
                />
            )}

            {!loading && activeRole === 'company' && companyData && (
                <CompanyDemo
                    data={companyData}
                    selected={selectedProfile}
                    onSelect={setSelectedProfile}
                />
            )}

            {!loading && activeRole === 'therapist' && therapistData && (
                <TherapistDemo
                    data={therapistData}
                    selected={selectedProfile}
                    onSelect={setSelectedProfile}
                />
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Candidate Demo
// ═══════════════════════════════════════════════════════════════

function CandidateDemo({ data, selected, onSelect }: {
    data: { totalCandidates: number; candidates: CandidateData[] }
    selected: number
    onSelect: (i: number) => void
}) {
    const c = data.candidates[selected]
    if (!c) return null

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Profile Selector */}
            <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-bold text-sm text-gray-800">Seleccionar Candidato</h3>
                        <p className="text-xs text-gray-500">{data.totalCandidates} perfiles seed</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {data.candidates.map((cand, i) => (
                            <button
                                key={cand.id}
                                onClick={() => onSelect(i)}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                    selected === i ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}
                            >
                                <div className="font-medium text-sm text-gray-900">{cand.name}</div>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {cand.diagnoses.slice(0, 2).map((d, j) => (
                                        <span key={j} className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full">{d}</span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard View */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hola, {c.name.split(' ')[0]}</h2>
                            <p className="text-gray-500 text-sm mt-1">{c.email}</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {c.diagnoses.map((d, i) => (
                                    <span key={i} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">{d}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{c.status}</span>
                            <p className="text-xs text-gray-400 mt-2">{c.location}</p>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard icon="🤖" label="Matches Totales" value={c.totalMatches} color="purple" />
                    <KpiCard icon="⏳" label="Pendientes" value={c.pendingMatches} color="yellow" />
                    <KpiCard icon="✅" label="Aprobados" value={c.approvedMatches} color="green" />
                    <KpiCard icon="📊" label="Score Medio" value={c.avgMatchScore} color="blue" />
                </div>

                {/* Assessment + Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">Perfil Neurocognitivo</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`text-4xl font-bold ${c.hasAssessment ? 'text-purple-600' : 'text-gray-300'}`}>
                                {c.hasAssessment ? `${c.assessmentDimensions}/24` : '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {c.hasAssessment ? 'Dimensiones evaluadas' : 'Assessment pendiente'}
                            </div>
                        </div>
                        {c.bestMatchScore > 0 && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                <div className="text-xs text-green-700 font-medium">Mejor Match Score</div>
                                <div className="text-2xl font-bold text-green-800">{c.bestMatchScore}</div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">Skills & Experiencia</h3>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {c.skills.slice(0, 8).map((s, i) => (
                                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{s}</span>
                            ))}
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div><span className="font-medium">Experiencia:</span> {c.experience}</div>
                            <div><span className="font-medium">Educacion:</span> {c.education}</div>
                        </div>
                    </div>
                </div>

                {/* Pipeline */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4">Pipeline de Contratacion</h3>
                    <div className="flex gap-2">
                        {Object.entries(c.pipeline).map(([stage, count]) => {
                            const stageLabels: Record<string, string> = {
                                newMatches: 'Nuevos', underReview: 'En Revision',
                                interviewing: 'Entrevista', offered: 'Oferta', hired: 'Contratado',
                            }
                            const stageColors: Record<string, string> = {
                                newMatches: 'bg-blue-100 text-blue-800',
                                underReview: 'bg-yellow-100 text-yellow-800',
                                interviewing: 'bg-orange-100 text-orange-800',
                                offered: 'bg-purple-100 text-purple-800',
                                hired: 'bg-green-100 text-green-800',
                            }
                            return (
                                <div key={stage} className={`flex-1 rounded-lg p-3 text-center ${stageColors[stage] || 'bg-gray-100'}`}>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-xs font-medium mt-1">{stageLabels[stage] || stage}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Top Jobs */}
                {c.topJobs.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4">Mejores Ofertas Compatibles</h3>
                        <div className="space-y-3">
                            {c.topJobs.map((job, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                    <div>
                                        <div className="font-medium text-sm">{job.title}</div>
                                        <div className="text-xs text-gray-500">{job.company} · {job.location}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={job.status} />
                                        <span className={`text-sm font-bold ${
                                            job.score >= 80 ? 'text-green-600' : job.score >= 60 ? 'text-blue-600' : 'text-yellow-600'
                                        }`}>{job.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accommodations */}
                {c.accommodations.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">Adaptaciones Necesarias</h3>
                        <div className="flex flex-wrap gap-2">
                            {c.accommodations.map((a, i) => (
                                <span key={i} className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200">{a}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Company Demo
// ═══════════════════════════════════════════════════════════════

function CompanyDemo({ data, selected, onSelect }: {
    data: { totalCompanies: number; companies: CompanyData[] }
    selected: number
    onSelect: (i: number) => void
}) {
    const co = data.companies[selected]
    if (!co) return null

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Selector */}
            <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-bold text-sm text-gray-800">Seleccionar Empresa</h3>
                        <p className="text-xs text-gray-500">{data.totalCompanies} empresas seed</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {data.companies.map((comp, i) => (
                            <button
                                key={comp.id}
                                onClick={() => onSelect(i)}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                    selected === i ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}
                            >
                                <div className="font-medium text-sm text-gray-900">{comp.name}</div>
                                <div className="text-xs text-gray-500">{comp.industry}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{co.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">{co.industry} · {co.location}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    {co.size}
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    Plan: {co.subscriptionPlan}
                                </span>
                            </div>
                        </div>
                        {co.inclusivityScore > 0 && (
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${
                                    co.inclusivityScore >= 80 ? 'text-green-600' : co.inclusivityScore >= 60 ? 'text-yellow-600' : 'text-red-500'
                                }`}>
                                    {co.inclusivityScore}%
                                </div>
                                <div className="text-xs text-gray-500">Score Inclusividad</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard icon="💼" label="Ofertas Publicadas" value={co.totalJobs} color="blue" />
                    <KpiCard icon="📢" label="Ofertas Activas" value={co.openJobs} color="green" />
                    <KpiCard icon="🤖" label="Matchings IA" value={co.totalMatchings} color="purple" />
                    <KpiCard icon="📊" label="Score Medio" value={co.avgScore} color="amber" />
                </div>

                {/* Pipeline */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4">Pipeline de Contratacion</h3>
                    <div className="flex gap-2">
                        {Object.entries(co.pipeline).map(([stage, count]) => {
                            const stageLabels: Record<string, string> = {
                                newMatches: 'Nuevos', underReview: 'En Revision',
                                interviewing: 'Entrevista', offered: 'Oferta', hired: 'Contratado',
                            }
                            const stageColors: Record<string, string> = {
                                newMatches: 'bg-blue-100 text-blue-800',
                                underReview: 'bg-yellow-100 text-yellow-800',
                                interviewing: 'bg-orange-100 text-orange-800',
                                offered: 'bg-purple-100 text-purple-800',
                                hired: 'bg-green-100 text-green-800',
                            }
                            return (
                                <div key={stage} className={`flex-1 rounded-lg p-3 text-center ${stageColors[stage] || 'bg-gray-100'}`}>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-xs font-medium mt-1">{stageLabels[stage] || stage}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Ofertas de Empleo ({co.totalJobs})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicacion</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inclusividad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {co.jobs.map(j => (
                                    <tr key={j.id} className="hover:bg-emerald-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{j.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                j.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}>{j.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{j.location}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            j.inclusivityScore >= 80 ? 'bg-green-500' : j.inclusivityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                                        }`}
                                                        style={{ width: `${j.inclusivityScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{j.inclusivityScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-purple-600">{j.matchCount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-bold ${
                                                j.topScore >= 80 ? 'text-green-600' : j.topScore >= 60 ? 'text-blue-600' : 'text-gray-400'
                                            }`}>{j.topScore || '-'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Therapist Demo
// ═══════════════════════════════════════════════════════════════

function TherapistDemo({ data, selected, onSelect }: {
    data: { totalTherapists: number; therapists: TherapistData[] }
    selected: number
    onSelect: (i: number) => void
}) {
    const t = data.therapists[selected]
    if (!t) return null

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Selector */}
            <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-bold text-sm text-gray-800">Seleccionar Terapeuta</h3>
                        <p className="text-xs text-gray-500">{data.totalTherapists} terapeutas seed</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {data.therapists.map((ther, i) => (
                            <button
                                key={ther.id}
                                onClick={() => onSelect(i)}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                    selected === i ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}
                            >
                                <div className="font-medium text-sm text-gray-900">{ther.name}</div>
                                <div className="text-xs text-gray-500">{ther.specialty}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-2xl">{t.name[0]}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t.name}</h2>
                                <p className="text-gray-500 text-sm">{t.specialty}</p>
                                <p className="text-xs text-gray-400 mt-1">Colegiado: {t.licenseNumber} · {t.location}</p>
                            </div>
                        </div>
                        <VerificationBadge status={t.verificationStatus} />
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard icon="👥" label="Clientes" value={`${t.currentClients}/${t.maxClients}`} color="blue" />
                    <KpiCard icon="📈" label="Capacidad" value={`${t.capacityPct}%`} color={t.capacityPct >= 80 ? 'red' : 'green'} />
                    <KpiCard icon="📋" label="Sesiones" value={t.sessionsCompleted} color="purple" />
                    <KpiCard icon="⭐" label="Satisfaccion" value={t.satisfactionScore} color="amber" />
                </div>

                {/* Experience & Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">Servicios</h3>
                        <div className="flex flex-wrap gap-2">
                            {t.services.map((s, i) => (
                                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-200">
                                    {s.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <span className="font-medium">{t.experienceYears} anos</span> de experiencia
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">Certificaciones</h3>
                        <div className="space-y-2">
                            {t.certifications.map((cert, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-500">✓</span>
                                    {cert}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Capacity Bar */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Capacidad de Pacientes</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all ${
                                        t.capacityPct >= 90 ? 'bg-red-500' : t.capacityPct >= 70 ? 'bg-yellow-400' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${t.capacityPct}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{t.currentClients}/{t.maxClients}</span>
                    </div>
                </div>

                {/* Therapy Clients */}
                {t.therapyClients.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Pacientes en Terapia ({t.therapyClients.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {t.therapyClients.map((client, i) => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">{client.name}</div>
                                        <div className="flex gap-1 mt-1">
                                            {client.diagnoses.map((d, j) => (
                                                <span key={j} className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                    }`}>{client.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Consulting Clients */}
                {t.consultingClients.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Clientes Consulting ({t.consultingClients.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {t.consultingClients.map((client, i) => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">{client.company}</div>
                                        <div className="text-xs text-gray-500">{client.industry}</div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                    }`}>{client.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════════

function KpiCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
    const colorMap: Record<string, string> = {
        purple: 'bg-purple-50 border-purple-200 text-purple-900',
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        green: 'bg-green-50 border-green-200 text-green-900',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
        red: 'bg-red-50 border-red-200 text-red-900',
    }

    return (
        <div className={`p-4 rounded-xl border-2 ${colorMap[color] || colorMap.blue}`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs font-medium opacity-70 mt-1">{label}</div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
        APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
        REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
        WITHDRAWN: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Retirado' },
        CONTESTED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Impugnado' },
    }
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
}

function VerificationBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
        verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verificado' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
    }
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>{c.label}</span>
}
