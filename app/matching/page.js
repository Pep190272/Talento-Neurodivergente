'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { backendApi } from '../lib/backend-api'
import Link from 'next/link'
import './matching.css'

const STATUS_CONFIG = {
  pending: { label: 'En cola', color: 'gray', icon: '⏳', progress: 10 },
  analyzing_profile: { label: 'Analizando perfil...', color: 'blue', icon: '🧠', progress: 30 },
  matching_jobs: { label: 'Buscando empleos compatibles...', color: 'purple', icon: '🔍', progress: 60 },
  generating_report: { label: 'Generando informe...', color: 'orange', icon: '📊', progress: 85 },
  completed: { label: 'Completado', color: 'green', icon: '✅', progress: 100 },
  failed: { label: 'Error', color: 'red', icon: '❌', progress: 0 },
}

export default function MatchingDashboard() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  const loadTickets = useCallback(async () => {
    const res = await backendApi('/profiles/matching/tickets', { method: 'GET' })
    if (res && Array.isArray(res)) {
      setTickets(res)
    } else {
      // If endpoint doesn't exist yet, show empty state
      setTickets([])
    }
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Poll for updates every 10s if there are active tickets
  useEffect(() => {
    const hasActive = tickets.some(t =>
      t.status !== 'completed' && t.status !== 'failed'
    )
    if (!hasActive) return

    const interval = setInterval(loadTickets, 10000)
    return () => clearInterval(interval)
  }, [tickets, loadTickets])

  const handleRequestAnalysis = async () => {
    setRequesting(true)
    const res = await backendApi('/profiles/matching/analyze', {
      body: {},
    })
    if (res) {
      // Add the new ticket to the list
      setTickets(prev => [res, ...prev])
    }
    setRequesting(false)
  }

  if (loading) {
    return (
      <div className="matching-page">
        <div className="matching-container">
          <div className="matching-loading">Cargando análisis...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="matching-page">
      <div className="matching-container">
        {/* Header */}
        <div className="matching-header">
          <div>
            <h1 className="matching-title">Análisis de Matching</h1>
            <p className="matching-subtitle">
              Tus análisis de compatibilidad con ofertas de empleo
            </p>
          </div>
          <button
            className="matching-request-btn"
            onClick={handleRequestAnalysis}
            disabled={requesting}
          >
            {requesting ? 'Solicitando...' : '🚀 Nuevo Análisis'}
          </button>
        </div>

        {/* Info Banner */}
        <div className="matching-info">
          <span className="matching-info-icon">ℹ️</span>
          <p>
            El análisis de matching usa IA para comparar tu perfil neurocognitivo 24D
            con todas las ofertas activas. El proceso puede tardar unos minutos
            dependiendo de la carga del sistema.
          </p>
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="matching-empty">
            <div className="matching-empty-icon">🔍</div>
            <h3>No hay análisis todavía</h3>
            <p>
              Solicita un análisis para que nuestro algoritmo encuentre los mejores
              empleos para tu perfil neurodivergente.
            </p>
            <button
              className="matching-request-btn"
              onClick={handleRequestAnalysis}
              disabled={requesting}
            >
              {requesting ? 'Solicitando...' : 'Solicitar Primer Análisis'}
            </button>
          </div>
        )}

        {/* Ticket List */}
        {tickets.length > 0 && (
          <div className="matching-tickets">
            {tickets.map((ticket) => {
              const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending
              return (
                <div key={ticket.id} className={`matching-ticket ${config.color}`}>
                  <div className="ticket-header">
                    <div className="ticket-id">
                      <span className="ticket-icon">{config.icon}</span>
                      <span className="ticket-label">Ticket #{ticket.id?.slice(-6) || '---'}</span>
                    </div>
                    <span className={`ticket-status ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {ticket.status !== 'completed' && ticket.status !== 'failed' && (
                    <div className="ticket-progress">
                      <div className="ticket-progress-bar">
                        <div
                          className={`ticket-progress-fill ${config.color}`}
                          style={{ width: `${ticket.progress || config.progress}%` }}
                        />
                      </div>
                      <span className="ticket-progress-text">
                        {ticket.progress || config.progress}%
                      </span>
                    </div>
                  )}

                  {/* Ticket Details */}
                  <div className="ticket-meta">
                    {ticket.created_at && (
                      <span className="ticket-date">
                        Solicitado: {new Date(ticket.created_at).toLocaleString('es-ES', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    )}
                    {ticket.jobs_analyzed !== undefined && (
                      <span className="ticket-jobs">
                        {ticket.jobs_analyzed} ofertas analizadas
                      </span>
                    )}
                    {ticket.matches_found !== undefined && (
                      <span className="ticket-matches">
                        {ticket.matches_found} matches encontrados
                      </span>
                    )}
                  </div>

                  {/* Completed Actions */}
                  {ticket.status === 'completed' && (
                    <div className="ticket-actions">
                      <Link
                        href={`/jobs`}
                        className="ticket-btn view"
                      >
                        Ver Empleos Compatibles
                      </Link>
                      {ticket.report_url && (
                        <a
                          href={ticket.report_url}
                          className="ticket-btn download"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 Descargar Informe
                        </a>
                      )}
                    </div>
                  )}

                  {/* Failed */}
                  {ticket.status === 'failed' && (
                    <div className="ticket-error">
                      <p>{ticket.error || 'Error durante el análisis. Intenta de nuevo.'}</p>
                      <button
                        className="ticket-btn retry"
                        onClick={handleRequestAnalysis}
                        disabled={requesting}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
