'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { backendApi } from '../lib/backend-api'
import { useLanguage } from '../hooks/useLanguage'
import './jobs.css'

const MODALITY_LABELS = { remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial' }

// Common accommodations for the filter UI
const ACCOMMODATION_OPTIONS = [
  'Horario flexible',
  'Trabajo remoto',
  'Espacio silencioso',
  'Comunicación asíncrona',
  'Documentación escrita',
  'Auriculares permitidos',
  'Pausas flexibles',
  'Iluminación regulable',
]

export default function JobsPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const role = session?.user?.type
  const isCompany = role === 'company'

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters (candidate view)
  const [modalityFilter, setModalityFilter] = useState('')
  const [adaptationFilters, setAdaptationFilters] = useState([])
  const [minMatch, setMinMatch] = useState(0)

  // Create job form (company view)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', location: '', modality: 'remote',
    skills_text: '', adaptations_text: '', salary_range: '',
  })

  useEffect(() => {
    async function loadJobs() {
      const endpoint = isCompany ? '/profiles/jobs' : '/profiles/jobs/matched'
      const res = await backendApi(endpoint, { method: 'GET' })
      if (res && Array.isArray(res)) setJobs(res)
      setLoading(false)
    }
    loadJobs()
  }, [isCompany])

  // Filtered jobs (candidate view)
  const filteredJobs = useMemo(() => {
    if (isCompany) return jobs
    return jobs.filter((job) => {
      if (modalityFilter && job.modality !== modalityFilter) return false
      if (minMatch > 0 && (job.match?.pct || 0) < minMatch) return false
      if (adaptationFilters.length > 0) {
        const jobAdaptations = (job.adaptations || []).map(a => a.toLowerCase())
        const hasAll = adaptationFilters.every(f =>
          jobAdaptations.some(a => a.includes(f.toLowerCase()))
        )
        if (!hasAll) return false
      }
      return true
    })
  }, [jobs, modalityFilter, minMatch, adaptationFilters, isCompany])

  const toggleAdaptation = (adapt) => {
    setAdaptationFilters(prev =>
      prev.includes(adapt) ? prev.filter(a => a !== adapt) : [...prev, adapt]
    )
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const data = {
      title: form.title,
      description: form.description,
      location: form.location,
      modality: form.modality,
      salary_range: form.salary_range,
      required_skills: form.skills_text.split(',').map(s => s.trim()).filter(Boolean),
      adaptations: form.adaptations_text.split(',').map(s => s.trim()).filter(Boolean),
    }
    const res = await backendApi('/profiles/jobs', { body: data })
    setSaving(false)
    if (res) {
      setJobs(prev => [res, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', location: '', modality: 'remote', skills_text: '', adaptations_text: '', salary_range: '' })
    } else {
      setError('Error al publicar oferta. Inténtalo de nuevo.')
    }
  }

  const handleCloseJob = async (jobId) => {
    const res = await backendApi(`/profiles/jobs/${jobId}`, { method: 'DELETE' })
    if (res) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'closed' } : j))
    }
  }

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        {/* Header */}
        <div className="jobs-header">
          <div>
            <h1 className="jobs-title">
              {isCompany ? 'Tus Ofertas de Trabajo' : 'Empleos Compatibles'}
            </h1>
            <p className="jobs-subtitle">
              {isCompany
                ? 'Publica y gestiona ofertas'
                : 'Ofertas ordenadas por compatibilidad con tu perfil 24D'}
            </p>
          </div>
          {isCompany && (
            <button
              className="jobs-create-btn"
              onClick={() => setShowForm(!showForm)}
            >
              + Nueva Oferta
            </button>
          )}
        </div>

        {/* Create Job Form (company) */}
        {showForm && isCompany && (
          <div className="jobs-form-card">
            <h2 className="jobs-form-title">Publicar Oferta</h2>
            <form onSubmit={handleCreateJob} className="jobs-form">
              <div className="jobs-form-grid">
                <div>
                  <label>Título del puesto *</label>
                  <input
                    type="text" required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Desarrollador Frontend Senior"
                  />
                </div>
                <div>
                  <label>Ubicación</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Barcelona, Madrid, Remoto..."
                  />
                </div>
              </div>
              <div className="jobs-form-grid">
                <div>
                  <label>Modalidad</label>
                  <select value={form.modality} onChange={e => setForm({ ...form, modality: e.target.value })}>
                    <option value="remote">100% Remoto</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="onsite">Presencial</option>
                  </select>
                </div>
                <div>
                  <label>Rango salarial</label>
                  <input
                    type="text"
                    value={form.salary_range}
                    onChange={e => setForm({ ...form, salary_range: e.target.value })}
                    placeholder="30.000-45.000 EUR/año"
                  />
                </div>
              </div>
              <div>
                <label>Descripción del puesto</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4} maxLength={5000}
                  placeholder="Describe las responsabilidades, el equipo y el entorno de trabajo..."
                />
              </div>
              <div>
                <label>Competencias requeridas (separadas por coma)</label>
                <input
                  type="text"
                  value={form.skills_text}
                  onChange={e => setForm({ ...form, skills_text: e.target.value })}
                  placeholder="JavaScript, React, Python, Trabajo en equipo..."
                />
              </div>
              <div>
                <label>Adaptaciones ofrecidas (separadas por coma)</label>
                <input
                  type="text"
                  value={form.adaptations_text}
                  onChange={e => setForm({ ...form, adaptations_text: e.target.value })}
                  placeholder="Horario flexible, Espacio silencioso, Auriculares permitidos..."
                />
              </div>
              <div className="jobs-form-actions">
                <button type="submit" disabled={saving} className="jobs-submit-btn">
                  {saving ? 'Publicando...' : 'Publicar Oferta'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="jobs-cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters (candidate view) */}
        {!isCompany && !loading && jobs.length > 0 && (
          <div className="jobs-filters">
            <div className="jobs-filters-row">
              <div className="jobs-filter-group">
                <label>Modalidad</label>
                <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="onsite">Presencial</option>
                </select>
              </div>
              <div className="jobs-filter-group">
                <label>Compatibilidad mínima</label>
                <select value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}>
                  <option value={0}>Sin mínimo</option>
                  <option value={50}>50%+</option>
                  <option value={70}>70%+</option>
                  <option value={90}>90%+</option>
                </select>
              </div>
            </div>
            <div className="jobs-adaptations-filter">
              <label>Adaptaciones requeridas:</label>
              <div className="jobs-adaptation-chips">
                {ACCOMMODATION_OPTIONS.map(adapt => (
                  <button
                    key={adapt}
                    className={`jobs-chip ${adaptationFilters.includes(adapt) ? 'active' : ''}`}
                    onClick={() => toggleAdaptation(adapt)}
                  >
                    {adapt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="jobs-error">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="jobs-loading">Cargando ofertas...</div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="jobs-empty">
            <div className="jobs-empty-icon">💼</div>
            <h3>{isCompany ? 'No tienes ofertas publicadas' : 'No hay ofertas disponibles'}</h3>
            <p>
              {isCompany
                ? 'Publica tu primera oferta para empezar a encontrar candidatos neurodivergentes.'
                : jobs.length > 0
                  ? 'Prueba ajustando los filtros para encontrar más ofertas.'
                  : 'Las empresas aún no han publicado ofertas. Vuelve pronto.'}
            </p>
            {isCompany && (
              <button className="jobs-create-btn" onClick={() => setShowForm(true)}>
                Publicar Primera Oferta
              </button>
            )}
          </div>
        )}

        {/* Job Listings */}
        {!loading && filteredJobs.length > 0 && (
          <div className="jobs-list">
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <div className="job-card-title-row">
                    <h3 className="job-card-title">{job.title}</h3>
                    {job.match && job.match.pct > 0 && (
                      <span className={`job-match-badge ${
                        job.match.pct >= 70 ? 'high' : job.match.pct >= 50 ? 'medium' : 'low'
                      }`}>
                        {job.match.pct}% compatible
                      </span>
                    )}
                  </div>
                  <div className="job-card-meta">
                    {job.company_name && <span>🏢 {job.company_name}</span>}
                    {job.location && <span>📍 {job.location}</span>}
                    <span>💻 {MODALITY_LABELS[job.modality] || job.modality}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                  </div>
                  <div className="job-card-status">
                    <span className={`job-status ${job.status === 'active' ? 'active' : 'closed'}`}>
                      {job.status === 'active' ? 'Activa' : 'Cerrada'}
                    </span>
                    {isCompany && job.status === 'active' && (
                      <button className="job-close-btn" onClick={() => handleCloseJob(job.id)}>
                        Cerrar
                      </button>
                    )}
                  </div>
                </div>

                {job.description && <p className="job-card-desc">{job.description}</p>}

                {/* Match Reasons (candidate view) */}
                {job.match?.reasons?.length > 0 && (
                  <div className={`job-match-reasons ${job.match.pct >= 70 ? 'high' : 'normal'}`}>
                    <p className="job-match-reasons-title">Por qué eres compatible:</p>
                    <ul>
                      {job.match.reasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Company Inclusivity Badge */}
                {job.company_inclusivity?.overall > 0 && (
                  <div className="job-inclusivity">
                    <span className={`job-inclusivity-badge ${job.company_inclusivity.overall >= 0.7 ? 'high' : 'medium'}`}>
                      ❤️ Inclusividad: {Math.round(job.company_inclusivity.overall * 100)}%
                    </span>
                  </div>
                )}

                {/* Skills */}
                {job.required_skills?.length > 0 && (
                  <div className="job-tags-section">
                    <span className="job-tags-label">Competencias:</span>
                    <div className="job-tags">
                      {job.required_skills.map(skill => (
                        <span key={skill} className="job-tag skill">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adaptations */}
                {job.adaptations?.length > 0 && (
                  <div className="job-tags-section">
                    <span className="job-tags-label">Adaptaciones ofrecidas:</span>
                    <div className="job-tags">
                      {job.adaptations.map(adapt => (
                        <span key={adapt} className="job-tag adaptation">{adapt}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
