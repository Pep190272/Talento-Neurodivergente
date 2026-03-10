'use client'

import { useState, useEffect } from 'react'
import { backendApi } from '../../../lib/backend-api'
import Link from 'next/link'

export default function TherapistDashboard() {
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Terapeuta</h1>
      <p className="text-gray-500 mb-8">
        {(profile?.display_name as string) || 'Profesional'} · DiversIA Eternals
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
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Especialidad</div>
          <div className="text-lg font-bold text-gray-800 truncate">
            {(profile?.specialty as string) || '-'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Pacientes</div>
          <div className="text-2xl font-bold text-gray-400">-</div>
          <p className="text-xs text-gray-400 mt-1">Próximamente</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Seguridad</div>
          <div className="text-2xl font-bold text-green-600">GDPR</div>
          <p className="text-xs text-gray-400 mt-1">Datos en EU</p>
        </div>
      </div>

      {/* Professional Profile */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Perfil Profesional</h2>
        {profile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">
                  {((profile.display_name as string) || '?')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.display_name as string}</p>
                <p className="text-sm text-gray-500">{(profile.specialty as string) || 'Especialidad no definida'}</p>
                {profile.license_number && (
                  <p className="text-xs text-gray-400">Colegiado: {profile.license_number as string}</p>
                )}
              </div>
            </div>
            {profile.bio && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">{profile.bio as string}</p>
              </div>
            )}
            {Array.isArray(profile.support_areas) && profile.support_areas.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Áreas de soporte</h4>
                <div className="flex flex-wrap gap-2">
                  {(profile.support_areas as string[]).map((area) => (
                    <span key={area} className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-3">Completa tu perfil profesional para ser visible en la plataforma</p>
            <Link href="/forms" className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
              Crear Perfil
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/forms" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition flex items-center gap-4">
          <span className="text-2xl">📝</span>
          <div>
            <h3 className="font-medium text-sm">{profile ? 'Editar Perfil' : 'Completar Perfil'}</h3>
            <p className="text-xs text-gray-400">Especialidad, áreas de soporte</p>
          </div>
        </Link>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 opacity-40 flex items-center gap-4">
          <span className="text-2xl">📚</span>
          <div>
            <h3 className="font-medium text-sm">Publicar Cursos</h3>
            <p className="text-xs text-gray-400">Próximamente</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 opacity-40 flex items-center gap-4">
          <span className="text-2xl">📅</span>
          <div>
            <h3 className="font-medium text-sm">Agenda</h3>
            <p className="text-xs text-gray-400">Próximamente</p>
          </div>
        </div>
      </div>

      {/* Platform Connection Placeholder */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-3">🔗</div>
        <h3 className="font-semibold text-lg mb-2">Conexión con la plataforma</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Próximamente podrás conectar con candidatos, ofrecer sesiones de acompañamiento,
          publicar cursos especializados y validar perfiles neurocognitivos.
        </p>
        <p className="text-xs text-gray-400 mt-2">Próximamente</p>
      </div>
    </div>
  )
}
