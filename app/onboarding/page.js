'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { backendApi } from '../lib/backend-api'
import './onboarding.css'

// NeuroVector24D dimensions grouped into wizard steps
const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a DiversIA',
    subtitle: 'Tu viaje neurodivergente comienza aquí',
    type: 'welcome',
  },
  {
    id: 'cognitive',
    title: 'Capa Cognitiva',
    subtitle: 'Cuéntanos sobre tu forma de pensar y procesar información',
    type: 'sliders',
    dimensions: [
      { key: 'attention_sustained', label: 'Atención sostenida', desc: '¿Puedes mantener el foco durante periodos largos?' },
      { key: 'attention_selective', label: 'Atención selectiva', desc: '¿Puedes filtrar distracciones fácilmente?' },
      { key: 'attention_divided', label: 'Atención dividida', desc: '¿Manejas varias tareas a la vez con comodidad?' },
      { key: 'memory_working', label: 'Memoria de trabajo', desc: '¿Retienes instrucciones mientras ejecutas tareas?' },
      { key: 'memory_short_term', label: 'Memoria a corto plazo', desc: '¿Recuerdas bien lo que acabas de aprender?' },
      { key: 'memory_long_term', label: 'Memoria a largo plazo', desc: '¿Tienes buena retención de conocimientos pasados?' },
    ],
  },
  {
    id: 'processing',
    title: 'Procesamiento',
    subtitle: 'Cómo procesas la información y resuelves problemas',
    type: 'sliders',
    dimensions: [
      { key: 'processing_speed', label: 'Velocidad de procesamiento', desc: '¿Procesas información rápidamente?' },
      { key: 'processing_accuracy', label: 'Precisión', desc: '¿Priorizas la exactitud sobre la velocidad?' },
      { key: 'processing_visual', label: 'Procesamiento visual', desc: '¿Comprendes mejor con diagramas e imágenes?' },
      { key: 'executive_planning', label: 'Planificación', desc: '¿Se te da bien organizar y planificar?' },
      { key: 'executive_flexibility', label: 'Flexibilidad mental', desc: '¿Te adaptas fácilmente a cambios de plan?' },
      { key: 'executive_inhibition', label: 'Control de impulsos', desc: '¿Puedes pausar y pensar antes de actuar?' },
    ],
  },
  {
    id: 'sensory',
    title: 'Capa Sensorial',
    subtitle: 'Tus preferencias de entorno y sensibilidades',
    type: 'sliders',
    dimensions: [
      { key: 'sensory_visual', label: 'Sensibilidad visual', desc: '¿Te afectan las luces fuertes o el desorden visual?' },
      { key: 'sensory_auditory', label: 'Sensibilidad auditiva', desc: '¿Te molestan ruidos inesperados o ambientes ruidosos?' },
      { key: 'sensory_tactile', label: 'Sensibilidad táctil', desc: '¿Eres sensible a texturas o contacto físico?' },
    ],
  },
  {
    id: 'social',
    title: 'Social y Comunicación',
    subtitle: 'Tu estilo de comunicación y trabajo en equipo',
    type: 'sliders',
    dimensions: [
      { key: 'social_communication', label: 'Comunicación', desc: '¿Te resulta natural comunicar tus ideas?' },
      { key: 'social_empathy', label: 'Empatía', desc: '¿Percibes fácilmente las emociones de los demás?' },
      { key: 'social_collaboration', label: 'Colaboración', desc: '¿Disfrutas trabajando en equipo?' },
      { key: 'creativity_divergent', label: 'Pensamiento divergente', desc: '¿Generas ideas fuera de lo convencional?' },
      { key: 'creativity_pattern', label: 'Detección de patrones', desc: '¿Identificas patrones que otros no ven?' },
      { key: 'creativity_innovation', label: 'Innovación', desc: '¿Te motiva crear soluciones nuevas?' },
    ],
  },
  {
    id: 'emotional',
    title: 'Regulación Emocional',
    subtitle: 'Cómo gestionas tus emociones en el entorno laboral',
    type: 'sliders',
    dimensions: [
      { key: 'emotional_regulation', label: 'Regulación emocional', desc: '¿Manejas bien situaciones de estrés?' },
      { key: 'emotional_awareness', label: 'Conciencia emocional', desc: '¿Identificas tus emociones con claridad?' },
      { key: 'emotional_resilience', label: 'Resiliencia', desc: '¿Te recuperas rápido de las dificultades?' },
    ],
  },
  {
    id: 'complete',
    title: 'Perfil Generado',
    subtitle: 'Tu perfil neurocognitivo 24D está listo',
    type: 'complete',
  },
]

const STORAGE_KEY = 'onboarding_progress'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)

  // Restore progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          if (data.step !== undefined) setCurrentStep(data.step)
          if (data.values) setValues(data.values)
        } catch { /* ignore */ }
      }
    }
  }, [])

  // Save progress on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step: currentStep,
        values,
      }))
    }
  }, [currentStep, values])

  const step = STEPS[currentStep]
  const totalSteps = STEPS.length
  const progressPct = Math.round((currentStep / (totalSteps - 1)) * 100)

  const handleSliderChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step.type === 'welcome' || step.type === 'complete') return true
    if (step.type === 'sliders') {
      // All dimensions in this step must have a value
      return step.dimensions.every(d => values[d.key] !== undefined)
    }
    return true
  }

  const handleNext = async () => {
    if (currentStep < totalSteps - 2) {
      // Normal navigation
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === totalSteps - 2) {
      // Last assessment step -> submit and go to completion
      setSaving(true)
      // Build the neuro_vector from all values
      const neuroVector = {}
      for (const s of STEPS) {
        if (s.dimensions) {
          for (const d of s.dimensions) {
            neuroVector[d.key] = values[d.key] !== undefined ? values[d.key] / 100 : 0.5
          }
        }
      }
      // Send to backend
      await backendApi('/profiles/quiz', {
        body: { answers: neuroVector },
      })
      // Also save to localStorage
      localStorage.setItem('neuro_vector_24d', JSON.stringify(neuroVector))
      localStorage.removeItem(STORAGE_KEY) // Clear onboarding progress
      setSaving(false)
      setCurrentStep(totalSteps - 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="onboarding-page">
      {/* Progress Bar */}
      <div className="onboarding-progress">
        <div className="onboarding-progress-bar" style={{ width: `${progressPct}%` }} />
        <span className="onboarding-progress-text">
          Paso {currentStep + 1} de {totalSteps}
        </span>
      </div>

      <div className="onboarding-content">
        {/* Step Header */}
        <div className="onboarding-header">
          <h1 className="onboarding-title">{step.title}</h1>
          <p className="onboarding-subtitle">{step.subtitle}</p>
        </div>

        {/* Welcome Step */}
        {step.type === 'welcome' && (
          <div className="onboarding-welcome">
            <div className="welcome-icon">🧠</div>
            <div className="welcome-features">
              <div className="welcome-feature">
                <span className="welcome-feature-icon">✨</span>
                <div>
                  <h3>Descubre tus superpoderes</h3>
                  <p>24 dimensiones neurocognitivas que te hacen único</p>
                </div>
              </div>
              <div className="welcome-feature">
                <span className="welcome-feature-icon">🎯</span>
                <div>
                  <h3>Matching personalizado</h3>
                  <p>Encuentra empleos que valoran tus fortalezas</p>
                </div>
              </div>
              <div className="welcome-feature">
                <span className="welcome-feature-icon">🔒</span>
                <div>
                  <h3>Privacidad total</h3>
                  <p>Tus datos están protegidos bajo GDPR</p>
                </div>
              </div>
            </div>
            <p className="welcome-note">
              No hay respuestas buenas ni malas. Cada persona tiene un perfil único.
              <br />Puedes cerrar el navegador y continuar donde lo dejaste.
            </p>
          </div>
        )}

        {/* Slider Steps */}
        {step.type === 'sliders' && (
          <div className="onboarding-sliders">
            {step.dimensions.map(dim => (
              <div key={dim.key} className="slider-group">
                <div className="slider-label-row">
                  <span className="slider-label">{dim.label}</span>
                  <span className="slider-value">
                    {values[dim.key] !== undefined ? values[dim.key] : '—'}
                  </span>
                </div>
                <p className="slider-desc">{dim.desc}</p>
                <div className="slider-track-container">
                  <span className="slider-min">Bajo</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={values[dim.key] ?? 50}
                    onChange={e => handleSliderChange(dim.key, Number(e.target.value))}
                    className="slider-input"
                  />
                  <span className="slider-max">Alto</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complete Step */}
        {step.type === 'complete' && (
          <div className="onboarding-complete">
            <div className="complete-icon">🎉</div>
            <h2>Tu perfil neurocognitivo 24D está listo</h2>
            <p>
              Nuestro algoritmo ya puede encontrar empleos compatibles con tu perfil.
              Ve al dashboard para explorar tus fortalezas y ofertas recomendadas.
            </p>
            <div className="complete-summary">
              <h3>Resumen de tus dimensiones</h3>
              <div className="complete-dims">
                {STEPS.filter(s => s.dimensions).flatMap(s => s.dimensions).map(dim => (
                  <div key={dim.key} className="complete-dim">
                    <span className="complete-dim-label">{dim.label}</span>
                    <div className="complete-dim-bar">
                      <div
                        className="complete-dim-fill"
                        style={{ width: `${values[dim.key] ?? 50}%` }}
                      />
                    </div>
                    <span className="complete-dim-value">{values[dim.key] ?? 50}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding-nav">
          {currentStep > 0 && step.type !== 'complete' && (
            <button className="onboarding-btn back" onClick={handleBack}>
              ← Anterior
            </button>
          )}
          <div className="onboarding-nav-spacer" />
          {step.type === 'complete' ? (
            <button className="onboarding-btn primary" onClick={handleGoToDashboard}>
              Ir al Dashboard →
            </button>
          ) : (
            <button
              className="onboarding-btn primary"
              onClick={handleNext}
              disabled={!canProceed() || saving}
            >
              {saving ? 'Guardando...' : currentStep === totalSteps - 2 ? 'Generar Perfil' : 'Siguiente →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
