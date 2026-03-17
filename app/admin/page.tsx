'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
    MatchingStatusChart,
    ScoreDistributionChart,
    DiagnosisChart,
    IndustryChart,
    PipelineChart,
    AcceptanceRateGauge,
    ConnectionsChart,
    ScoreTimelineChart,
} from './components/AdminCharts'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
interface StatsData {
    overview: {
        totalUsers: number
        totalJobs: number
        totalMatchings: number
        totalConnections: number
        acceptanceRate: number
        avgScore: number
    }
    usersByType: Array<{ type: string; count: number }>
    matchingsByStatus: Array<{ status: string; count: number }>
    scoreDistribution: Array<{ range: string; count: number }>
    diagnosisDistribution: Array<{ name: string; count: number }>
    industryDistribution: Array<{ name: string; count: number }>
    connectionsByType: Array<{ type: string; count: number }>
    pipeline: Array<{ stage: string; count: number }>
    therapistVerification: Array<{ status: string; count: number }>
    recentMatchings: Array<{
        id: string; score: number; status: string; date: string
        job: string; company: string; candidate: string; diagnosis: string[]
    }>
    topPotentialMatches: Array<{
        id: string; score: number; explanation: string
        job: string; company: string; candidate: string
    }>
    auditEvents: Array<{ type: string; count: number }>
}

interface UserData {
    id: string; email: string; userType: string; status: string; createdAt: string
    individual?: { firstName: string; lastName: string; diagnoses: string[]; validationStatus: string }
    company?: { name: string; industry: string; subscriptionPlan: string }
    therapist?: { name: string; specialty: string; verificationStatus: string }
}

interface TherapistData {
    id: string; name: string; specialty: string; licenseNumber: string
    verificationStatus: string; experienceYears: number
    currentClients: number; maxClients: number; location: string
    services: string[]; user: { email: string; status: string }
}

// ═══════════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [users, setUsers] = useState<UserData[]>([])
    const [therapists, setTherapists] = useState<TherapistData[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'therapists' | 'matches' | 'audit'>('overview')
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [statsRes, usersRes, therapistsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/users'),
                fetch('/api/admin/therapists'),
            ])

            if (statsRes.status === 403) {
                setError('Acceso denegado. Solo Super Admin puede acceder a este panel.')
                return
            }

            const [statsData, usersData, therapistsData] = await Promise.all([
                statsRes.json(),
                usersRes.json(),
                therapistsRes.json(),
            ])

            setStats(statsData)
            setUsers(usersData.users || [])
            setTherapists(therapistsData.therapists || [])
        } catch {
            setError('Error cargando datos del dashboard.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'deactivated' : 'active'
        await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, status: newStatus }),
        })
        fetchData()
    }

    const handleTherapistAction = async (therapistId: string, action: 'verify' | 'reject') => {
        await fetch('/api/admin/therapists', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ therapistId, action }),
        })
        fetchData()
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
                    <h2 className="text-lg font-bold text-red-800">Acceso Denegado</h2>
                    <p className="text-red-700 mt-2">{error}</p>
                </div>
            </div>
        )
    }

    if (loading || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando dashboard de administración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">DiversIA — Super Admin</h1>
                            <p className="text-blue-200 text-sm mt-1">Panel de control y métricas del ecosistema</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>
                            <span className="text-blue-200 text-sm">Datos seed (@seed.diversia.com)</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <nav className="flex gap-1 mt-6">
                        {[
                            { id: 'overview' as const, label: 'Resumen' },
                            { id: 'matches' as const, label: 'Matches' },
                            { id: 'users' as const, label: 'Usuarios' },
                            { id: 'therapists' as const, label: 'Terapeutas' },
                            { id: 'audit' as const, label: 'Auditoría' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-900 shadow-sm'
                                        : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && <OverviewTab stats={stats} />}
                {activeTab === 'matches' && <MatchesTab stats={stats} />}
                {activeTab === 'users' && <UsersTab users={users} onToggleStatus={handleUserStatusToggle} />}
                {activeTab === 'therapists' && <TherapistsTab therapists={therapists} onAction={handleTherapistAction} />}
                {activeTab === 'audit' && <AuditTab stats={stats} />}
            </main>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Overview Tab
// ═══════════════════════════════════════════════════════════════
function OverviewTab({ stats }: { stats: StatsData }) {
    const kpis = [
        { label: 'Usuarios Totales', value: stats.overview.totalUsers, color: 'blue', icon: '👥' },
        { label: 'Ofertas de Empleo', value: stats.overview.totalJobs, color: 'green', icon: '💼' },
        { label: 'Matchings IA', value: stats.overview.totalMatchings, color: 'purple', icon: '🤖' },
        { label: 'Conexiones Activas', value: stats.overview.totalConnections, color: 'indigo', icon: '🔗' },
        { label: 'Tasa Aceptación', value: `${stats.overview.acceptanceRate}%`, color: 'emerald', icon: '✅' },
        { label: 'Score Medio', value: stats.overview.avgScore, color: 'amber', icon: '📊' },
    ]

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        green: 'bg-green-50 border-green-200 text-green-900',
        purple: 'bg-purple-50 border-purple-200 text-purple-900',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
    }

    return (
        <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpis.map((kpi, i) => (
                    <div
                        key={i}
                        className={`p-4 rounded-xl border-2 shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md ${colorMap[kpi.color]}`}
                    >
                        <div className="text-2xl mb-1">{kpi.icon}</div>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className="text-xs font-medium opacity-70 mt-1">{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Users by type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.usersByType.map(u => {
                    const icons: Record<string, string> = { individual: '🧑‍💻', company: '🏢', therapist: '🧠', admin: '🛡️' }
                    const labels: Record<string, string> = { individual: 'Candidatos', company: 'Empresas', therapist: 'Terapeutas', admin: 'Admins' }
                    return (
                        <div key={u.type} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform duration-200 hover:scale-105">
                            <span className="text-3xl">{icons[u.type] || '👤'}</span>
                            <div>
                                <div className="text-xl font-bold text-gray-900">{u.count}</div>
                                <div className="text-sm text-gray-500">{labels[u.type] || u.type}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Matches por Estado" subtitle="Distribución de todos los matchings del algoritmo">
                    <MatchingStatusChart data={stats.matchingsByStatus} />
                </ChartCard>
                <ChartCard title="Distribución de Scores" subtitle="Histograma de puntuaciones IA (0-100)">
                    <ScoreDistributionChart data={stats.scoreDistribution} />
                </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Candidatos por Neurodivergencia" subtitle="10+ neurodivergencias representadas">
                    <DiagnosisChart data={stats.diagnosisDistribution} />
                </ChartCard>
                <ChartCard title="Empresas por Sector" subtitle="Abanico laboral completo">
                    <IndustryChart data={stats.industryDistribution} />
                </ChartCard>
            </div>

            {/* Charts row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Pipeline de Contratación" subtitle="Funnel de conversión">
                    <PipelineChart data={stats.pipeline} />
                </ChartCard>
                <ChartCard title="Tasa de Aceptación" subtitle="% aprobados vs rechazados">
                    <AcceptanceRateGauge rate={stats.overview.acceptanceRate} avgScore={stats.overview.avgScore} />
                </ChartCard>
                <ChartCard title="Conexiones del Ecosistema" subtitle="Job Match, Terapia, Consultoría">
                    <ConnectionsChart data={stats.connectionsByType} />
                </ChartCard>
            </div>

            {/* Synergy diagram */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Sinergias del Ecosistema DiversIA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SynergyCard
                        from="Empresa" to="Terapeuta" action="Solicita formación"
                        detail="Cursos de neurodiversidad, consulting de adaptación de puestos"
                        color="blue"
                    />
                    <SynergyCard
                        from="Terapeuta" to="Usuario" action="Ofrece diagnóstico"
                        detail="Diagnóstico clínico legal, evaluación neuropsicológica"
                        color="green"
                    />
                    <SynergyCard
                        from="Usuario" to="Empresa" action="Match anónimo"
                        detail="Perfil matcheado por IA, consent granular GDPR"
                        color="purple"
                    />
                    <SynergyCard
                        from="Empresa" to="Terapeuta" action="Adaptación laboral"
                        detail="Acompañamiento post-contratación, workplace coaching"
                        color="amber"
                    />
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Matches Tab
// ═══════════════════════════════════════════════════════════════
function MatchesTab({ stats }: { stats: StatsData }) {
    return (
        <div className="space-y-6">
            <ChartCard title="Timeline de Scores" subtitle="Evolución de puntuaciones por match">
                <ScoreTimelineChart data={stats.recentMatchings.map(m => ({ score: m.score, status: m.status, date: m.date }))} />
            </ChartCard>

            {/* Top Potential Matches */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Top Matches Potenciales (Pendientes)</h3>
                    <p className="text-sm text-gray-500">Matches con mayor score que aún esperan respuesta</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Explicación IA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.topPotentialMatches.map(m => (
                                <tr key={m.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            m.score >= 85 ? 'bg-green-100 text-green-800' :
                                            m.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {m.score}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.candidate}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{m.job}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{m.company}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{m.explanation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Matchings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Matchings Recientes</h3>
                    <p className="text-sm text-gray-500">Últimos 20 matchings generados por el algoritmo</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neurodivergencia</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentMatchings.map(m => (
                                <tr key={m.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            m.score >= 85 ? 'bg-green-100 text-green-800' :
                                            m.score >= 70 ? 'bg-blue-100 text-blue-800' :
                                            m.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {m.score}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={m.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.candidate}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {m.diagnosis.map((d, i) => (
                                                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{d}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{m.job}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{m.company}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Users Tab
// ═══════════════════════════════════════════════════════════════
function UsersTab({ users, onToggleStatus }: { users: UserData[]; onToggleStatus: (id: string, status: string) => void }) {
    const [filter, setFilter] = useState<string>('all')

    const filtered = filter === 'all' ? users : users.filter(u => u.userType === filter)

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {['all', 'individual', 'company', 'therapist', 'admin'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                        }`}
                    >
                        {f === 'all' ? 'Todos' : f === 'individual' ? 'Candidatos' : f === 'company' ? 'Empresas' : f === 'therapist' ? 'Terapeutas' : 'Admins'}
                        {f !== 'all' && ` (${users.filter(u => u.userType === f).length})`}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(user => (
                                <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                        <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString('es-ES')}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <TypeBadge type={user.userType} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.individual && `${user.individual.firstName} ${user.individual.lastName}`}
                                        {user.company && `${user.company.name} (${user.company.industry})`}
                                        {user.therapist && `${user.therapist.name} — ${user.therapist.specialty}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status === 'active' ? 'Activo' : 'Desactivado'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.userType !== 'admin' && (
                                            <button
                                                onClick={() => onToggleStatus(user.id, user.status)}
                                                className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                                    user.status === 'active'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                            >
                                                {user.status === 'active' ? 'Desactivar' : 'Activar'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Therapists Tab
// ═══════════════════════════════════════════════════════════════
function TherapistsTab({ therapists, onAction }: { therapists: TherapistData[]; onAction: (id: string, action: 'verify' | 'reject') => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {therapists.map(t => (
                    <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{t.name}</h3>
                                <p className="text-sm text-gray-500">{t.specialty}</p>
                            </div>
                            <VerificationBadge status={t.verificationStatus} />
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex justify-between">
                                <span>Experiencia:</span>
                                <span className="font-medium">{t.experienceYears} años</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Clientes:</span>
                                <span className="font-medium">{t.currentClients}/{t.maxClients}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ubicación:</span>
                                <span className="font-medium">{t.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Licencia:</span>
                                <span className="font-mono text-xs">{t.licenseNumber}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                            {t.services.slice(0, 3).map(s => (
                                <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                    {s.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>

                        {t.verificationStatus === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAction(t.id, 'verify')}
                                    className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Verificar
                                </button>
                                <button
                                    onClick={() => onAction(t.id, 'reject')}
                                    className="flex-1 bg-red-50 text-red-600 text-sm py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                >
                                    Rechazar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Audit Tab
// ═══════════════════════════════════════════════════════════════
function AuditTab({ stats }: { stats: StatsData }) {
    const eventLabels: Record<string, string> = {
        USER_LOGIN: 'Inicio de sesión',
        MATCHING_EXECUTED: 'Matching ejecutado',
        MATCHING_REVIEWED: 'Matching revisado',
        CONSENT_GIVEN: 'Consentimiento dado',
        CONSENT_REVOKED: 'Consentimiento revocado',
        PROFILE_VIEWED: 'Perfil consultado',
        THERAPIST_ACCESS: 'Acceso terapeuta',
        AI_DECISION_MADE: 'Decisión IA',
        BIAS_CHECK_EXECUTED: 'Check de sesgo',
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Audit Trail — GDPR + EU AI Act</h3>
                <p className="text-sm text-gray-500 mb-6">Registro completo de eventos del sistema. Retención: 7 años (GDPR Art. 5.1.e)</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.auditEvents.map(event => (
                        <div key={event.type} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">{event.count}</div>
                            <div className="text-xs text-gray-600 mt-1">{eventLabels[event.type] || event.type}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Cumplimiento Regulatorio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComplianceCard
                        title="GDPR (Reglamento General de Protección de Datos)"
                        items={[
                            'Art. 5: Principios de tratamiento - Audit trail activo',
                            'Art. 6: Base legal - Consentimiento granular por campo',
                            'Art. 7: Condiciones del consentimiento - Revocable',
                            'Art. 9: Datos sensibles - Encriptación AES-256-GCM',
                            'Art. 17: Derecho al olvido - Endpoint de eliminación',
                            'Art. 20: Portabilidad - Endpoint de exportación',
                        ]}
                    />
                    <ComplianceCard
                        title="EU AI Act (Reglamento de Inteligencia Artificial)"
                        items={[
                            'Art. 9: Gestión de riesgos - Bias check implementado',
                            'Art. 12: Registro - Audit log con versionado',
                            'Art. 13: Transparencia - Explicación IA legible',
                            'Art. 14: Supervisión humana - Revisión obligatoria',
                            'Art. 22: Derecho a impugnar - Sistema de contested',
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════════

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            {children}
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

function TypeBadge({ type }: { type: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        individual: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Candidato' },
        company: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Empresa' },
        therapist: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Terapeuta' },
        admin: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin' },
    }
    const c = config[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
}

function VerificationBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
        verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verificado' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
    }
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>{c.label}</span>
}

function SynergyCard({ from, to, action, detail, color }: { from: string; to: string; action: string; detail: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'border-blue-200 bg-white',
        green: 'border-green-200 bg-white',
        purple: 'border-purple-200 bg-white',
        amber: 'border-amber-200 bg-white',
    }
    const arrowColor: Record<string, string> = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        purple: 'text-purple-500',
        amber: 'text-amber-500',
    }

    return (
        <div className={`rounded-xl p-4 border-2 ${colorMap[color]} transition-transform duration-200 hover:scale-105`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm text-gray-800">{from}</span>
                <span className={`${arrowColor[color]}`}>→</span>
                <span className="font-bold text-sm text-gray-800">{to}</span>
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">{action}</div>
            <div className="text-xs text-gray-500">{detail}</div>
        </div>
    )
}

function ComplianceCard({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-bold text-blue-900 text-sm mb-3">{title}</h4>
            <ul className="space-y-1">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}
