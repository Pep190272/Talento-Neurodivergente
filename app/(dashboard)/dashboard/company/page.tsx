'use client'

import { useState, useEffect } from 'react'
import { backendApi } from '../../../lib/backend-api'
import Link from 'next/link'

interface InclusivityScore {
  overall: number
  [key: string]: number
}

const CATEGORY_LABELS: Record<string, string> = {
  environment: 'Entorno sensorial',
  culture: 'Cultura y comunicación',
  hiring: 'Procesos de selección',
  adaptations: 'Adaptaciones laborales',
  training: 'Formación',
  metrics: 'Medición',
}

export default function CompanyDashboard() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const res = await backendApi('/profiles/me', { method: 'GET' })
      if (res) setProfile(res)
      setLoading(false)
    }
    loadData()
  }, [])

  const inclusivityScore = profile?.inclusivity_score as InclusivityScore | undefined
  const hasInclusivity = inclusivityScore && typeof inclusivityScore === 'object' && inclusivityScore.overall !== undefined
  const overallPct = hasInclusivity ? Math.round(inclusivityScore.overall * 100) : 0

  const inclusivityCategories = hasInclusivity
    ? Object.entries(CATEGORY_LABELS)
        .filter(([k]) => inclusivityScore[k] !== undefined)
        .map(([k, label]) => ({
          key: k,
          label,
          pct: Math.round(Number(inclusivityScore[k]) * 100),
        }))
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Empresa</h1>
      <p className="text-gray-500 mb-8">
        {(profile?.display_name as string) || 'Tu empresa'} · DiversIA Eternals
      </p>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Perfil</div>
          <div className={`text-2xl font-bold ${profile ? 'text-green-600' : 'text-gray-400'}`}>
            {profile ? 'Activo' : 'Pendiente'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Inclusividad</div>
          {hasInclusivity ? (
            <>
              <div className={`text-2xl font-bold ${
                overallPct >= 75 ? 'text-green-600' : overallPct >= 50 ? 'text-yellow-600' : 'text-red-500'
              }`}>
                {overallPct}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Score global</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-400">-</div>
              <p className="text-xs text-gray-400 mt-1">Evaluación pendiente</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Candidatos</div>
          <div className="text-2xl font-bold text-gray-400">-</div>
          <p className="text-xs text-gray-400 mt-1">Próximamente</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Seguridad</div>
          <div className="text-2xl font-bold text-green-600">GDPR</div>
          <p className="text-xs text-gray-400 mt-1">Datos en EU</p>
        </div>
      </div>

      {/* Inclusivity Breakdown */}
      {hasInclusivity && inclusivityCategories.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Score de Inclusividad</h2>
            <Link href="/inclusivity" className="text-xs text-green-600 hover:underline">
              Repetir evaluación →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inclusivityCategories.map((cat) => (
              <div key={cat.key} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{cat.label}</span>
                  <span className={`font-bold ${
                    cat.pct >= 75 ? 'text-green-600' : cat.pct >= 50 ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    {cat.pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      cat.pct >= 75 ? 'bg-green-500' : cat.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/forms" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition flex items-center gap-4">
          <span className="text-2xl">📝</span>
          <div>
            <h3 className="font-medium text-sm">{profile ? 'Editar Perfil' : 'Completar Perfil'}</h3>
            <p className="text-xs text-gray-400">Datos de empresa</p>
          </div>
        </Link>
        <Link
          href="/inclusivity"
          className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-pink-200 transition flex items-center gap-4 ${hasInclusivity ? 'opacity-60' : 'border-2 border-pink-200'}`}
        >
          <span className="text-2xl">❤️</span>
          <div>
            <h3 className="font-medium text-sm">{hasInclusivity ? 'Repetir Evaluación' : 'Evaluar Inclusividad'}</h3>
            <p className="text-xs text-gray-400">18 preguntas · 5 min</p>
          </div>
        </Link>
        <Link href="/jobs" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition flex items-center gap-4">
          <span className="text-2xl">💼</span>
          <div>
            <h3 className="font-medium text-sm">Ofertas de Trabajo</h3>
            <p className="text-xs text-gray-400">Publica y gestiona ofertas</p>
          </div>
        </Link>
      </div>

      {/* Matching Placeholder */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-3">🤝</div>
        <h3 className="font-semibold text-lg mb-2">Matching Inteligente</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Cuando completes tu perfil y evaluación de inclusividad, nuestro algoritmo
          encontrará candidatos neurodivergentes compatibles con tu cultura empresarial.
        </p>
        <p className="text-xs text-gray-400 mt-2">Próximamente</p>
      </div>
    </div>
  )
}
