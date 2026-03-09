'use client'

import { useState, useEffect } from 'react'
import { backendApi } from '../../../lib/backend-api'
import Link from 'next/link'

// NeuroVector24D dimension labels
const DIMENSION_LABELS: Record<string, string> = {
  attention_sustained: 'Atención sostenida',
  attention_selective: 'Atención selectiva',
  attention_divided: 'Atención dividida',
  memory_working: 'Memoria de trabajo',
  memory_short_term: 'Memoria a corto plazo',
  memory_long_term: 'Memoria a largo plazo',
  processing_speed: 'Velocidad de proceso',
  processing_accuracy: 'Precisión',
  processing_visual: 'Proceso visual',
  executive_planning: 'Planificación',
  executive_flexibility: 'Flexibilidad',
  executive_inhibition: 'Inhibición',
  social_communication: 'Comunicación',
  social_empathy: 'Empatía',
  social_collaboration: 'Colaboración',
  creativity_divergent: 'Pensamiento divergente',
  creativity_pattern: 'Detección de patrones',
  creativity_innovation: 'Innovación',
  sensory_visual: 'Sensibilidad visual',
  sensory_auditory: 'Sensibilidad auditiva',
  sensory_tactile: 'Sensibilidad táctil',
  emotional_regulation: 'Regulación emocional',
  emotional_awareness: 'Conciencia emocional',
  emotional_resilience: 'Resiliencia',
}

interface MatchedJob {
  id: string
  title: string
  company_name?: string
  location?: string
  modality?: string
  adaptations?: string[]
  match: { pct: number; reasons?: string[] }
}

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [gameScores, setGameScores] = useState<Record<string, { plays?: number; best?: number }>>({})
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [profileRes, scoresRes, jobsRes] = await Promise.allSettled([
        backendApi('/profiles/me', { method: 'GET' }),
        backendApi('/profiles/games/scores', { method: 'GET' }),
        backendApi('/profiles/jobs/matched', { method: 'GET' }),
      ])
      if (profileRes.status === 'fulfilled' && profileRes.value) setProfile(profileRes.value)
      if (scoresRes.status === 'fulfilled' && scoresRes.value) setGameScores(scoresRes.value)
      if (jobsRes.status === 'fulfilled' && jobsRes.value) setMatchedJobs(jobsRes.value)
      setLoading(false)
    }
    loadData()
  }, [])

  const neuroVector = profile?.neuro_vector as Record<string, number> | undefined
  const hasQuiz = neuroVector && typeof neuroVector === 'object' && Object.keys(neuroVector).length > 0
  const hasGames = Object.keys(gameScores).length > 0
  const totalPlays = Object.values(gameScores).reduce((s, g) => s + (g.plays || 0), 0)
  const filledDimensions = hasQuiz ? Object.keys(neuroVector).length : 0
  const profileCompletionPct = Math.round(
    ((profile ? 1 : 0) + (hasQuiz ? 1 : 0) + (hasGames ? 1 : 0)) / 4 * 100
  )

  // Top 5 strengths sorted by value
  const topStrengths = hasQuiz
    ? Object.entries(neuroVector)
        .map(([key, value]) => ({ key, value: Number(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : []

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Hola, {(profile?.display_name as string) || 'Candidato'} 👋
      </h1>
      <p className="text-gray-500 mb-8">Tu progreso en DiversIA Eternals</p>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Progreso del perfil</span>
          <span className="text-sm font-bold text-purple-600">{profileCompletionPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletionPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-400">
          <span className={profile ? 'text-green-600 font-medium' : ''}>
            👤 Perfil
          </span>
          <span className={hasQuiz ? 'text-green-600 font-medium' : ''}>
            🧠 Quiz 24D
          </span>
          <span className={hasGames ? 'text-green-600 font-medium' : 'text-gray-300'}>
            🎮 Brain Suite
          </span>
          <span className="text-gray-300">
            🤝 Matching
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-sm">Perfil Neurocognitivo</div>
          {hasQuiz ? (
            <>
              <div className="text-4xl font-bold text-purple-600">{filledDimensions}/24</div>
              <p className="text-xs text-gray-400 mt-1">Dimensiones evaluadas</p>
            </>
          ) : (
            <>
              <div className="text-4xl font-bold text-gray-300">-</div>
              <Link href="/quiz" className="text-xs text-purple-600 hover:underline mt-1 block">
                Realizar Quiz →
              </Link>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-sm">Empleos Compatibles</div>
          <div className={`text-4xl font-bold ${matchedJobs.length > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
            {matchedJobs.length || '-'}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {matchedJobs.length > 0 ? 'Ofertas encontradas' : hasQuiz ? 'Sin ofertas aún' : 'Completa el quiz primero'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-sm">Brain Suite</div>
          {hasGames ? (
            <>
              <div className="text-4xl font-bold text-green-600">{totalPlays}</div>
              <p className="text-xs text-gray-400 mt-1">Partidas jugadas</p>
            </>
          ) : (
            <>
              <div className="text-4xl font-bold text-gray-300">-</div>
              <Link href="/games" className="text-xs text-purple-600 hover:underline mt-1 block">
                Jugar ahora →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Top Strengths */}
      {hasQuiz && topStrengths.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 Tus Fortalezas Principales</h2>
          <div className="space-y-3">
            {topStrengths.map((dim) => (
              <div key={dim.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{DIMENSION_LABELS[dim.key] || dim.key}</span>
                  <span className="font-semibold text-purple-600">{Math.round(dim.value * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${dim.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched Jobs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">💼 Empleos Compatibles</h2>
          {matchedJobs.length > 0 && (
            <Link href="/jobs" className="text-xs text-purple-600 hover:underline">Ver todos →</Link>
          )}
        </div>

        {matchedJobs.length === 0 && !hasQuiz && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-500 mb-4">Completa el Quiz 24D para que nuestro algoritmo encuentre empleos compatibles con tu perfil.</p>
            <Link href="/quiz" className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
              Hacer Quiz
            </Link>
          </div>
        )}

        {matchedJobs.length === 0 && hasQuiz && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No hay ofertas publicadas aún. Las empresas están en proceso de onboarding.</p>
          </div>
        )}

        {matchedJobs.length > 0 && (
          <div className="space-y-3">
            {matchedJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="border border-gray-100 rounded-lg p-4 hover:border-purple-200 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        job.match.pct >= 70 ? 'bg-green-100 text-green-700' :
                        job.match.pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {job.match.pct}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {job.company_name && <span>{job.company_name}</span>}
                      {job.location && <span>· {job.location}</span>}
                      {job.modality && <span>· {job.modality === 'remote' ? 'Remoto' : job.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}</span>}
                    </div>
                    {job.match.reasons && job.match.reasons.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">{job.match.reasons[0]}</p>
                    )}
                  </div>
                  {job.adaptations && job.adaptations.length > 0 && (
                    <span className="text-xs text-green-600 shrink-0">
                      ❤️ {job.adaptations.length} adaptación(es)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/quiz" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition flex items-center gap-4">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="font-medium text-sm">{hasQuiz ? 'Repetir Quiz' : 'Hacer Quiz 24D'}</h3>
            <p className="text-xs text-gray-400">{hasQuiz ? 'Ya completado' : '5-10 min · 24 preguntas'}</p>
          </div>
        </Link>
        <Link href="/games" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition flex items-center gap-4">
          <span className="text-2xl">🎮</span>
          <div>
            <h3 className="font-medium text-sm">Brain Suite</h3>
            <p className="text-xs text-gray-400">{hasGames ? `${totalPlays} partidas jugadas` : '10 juegos disponibles'}</p>
          </div>
        </Link>
        <Link href="/forms" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition flex items-center gap-4">
          <span className="text-2xl">📝</span>
          <div>
            <h3 className="font-medium text-sm">{profile ? 'Editar Perfil' : 'Completar Perfil'}</h3>
            <p className="text-xs text-gray-400">Actualiza tus datos</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
