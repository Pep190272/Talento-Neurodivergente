'use client'

import { useState } from 'react'
import { FaKey, FaSave, FaCheckCircle } from 'react-icons/fa'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Por favor ingresa una clave API válida')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/save-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      })

      const data = await response.json()

      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error || 'Error al guardar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      padding: '4rem 2rem',
      fontFamily: 'Rajdhani, sans-serif'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '3rem',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FaKey style={{ fontSize: '4rem', color: '#FFD700', marginBottom: '1rem' }} />
          <h1 style={{
            color: '#fff',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem'
          }}>
            Configuración de OpenAI
          </h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
            Guarda tu clave API de forma permanente en el servidor
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            color: '#FFD700',
            marginBottom: '0.5rem',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>
            Clave API de OpenAI
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border 0.3s',
              fontFamily: 'monospace'
            }}
            onFocus={(e) => e.target.style.border = '2px solid #FFD700'}
            onBlur={(e) => e.target.style.border = '2px solid rgba(255, 215, 0, 0.3)'}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            color: '#ff6b6b',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '1.2rem',
            background: saved ? '#4ade80' : 'linear-gradient(135deg, #9333EA 0%, #FFD700 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 900,
            fontFamily: 'Orbitron, sans-serif',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)'
          }}
        >
          {saved ? (
            <>
              <FaCheckCircle /> Guardado Exitosamente
            </>
          ) : (
            <>
              <FaSave /> {saving ? 'Guardando...' : 'Guardar en el Servidor'}
            </>
          )}
        </button>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(147, 51, 234, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(147, 51, 234, 0.3)'
        }}>
          <h3 style={{ color: '#9333EA', marginBottom: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>
            ¿Cómo obtener tu clave API?
          </h3>
          <ol style={{ color: '#ccc', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>Visita <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: '#FFD700' }}>platform.openai.com/api-keys</a></li>
            <li>Inicia sesión con tu cuenta de OpenAI</li>
            <li>Haz clic en "Create new secret key"</li>
            <li>Copia la clave y pégala arriba</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
