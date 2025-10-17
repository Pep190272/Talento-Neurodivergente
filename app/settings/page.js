'use client'

import React, { useState, useEffect } from 'react';
import { FaKey, FaSave, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      padding: '6rem 2rem 3rem',
      fontFamily: 'Rajdhani, sans-serif'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto'
      }}>
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '2.5rem',
          color: '#FFD700',
          marginBottom: '1rem',
          fontWeight: 900,
          textAlign: 'center'
        }}>
          {t('settings.title') || 'Configuración'}
        </h1>

        <p style={{
          color: '#fff',
          fontSize: '1.1rem',
          textAlign: 'center',
          marginBottom: '3rem',
          opacity: 0.8
        }}>
          {t('settings.subtitle') || 'Configura tu clave de OpenAI para usar el agente neurológico'}
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <FaKey style={{ color: '#FFD700', fontSize: '1.5rem' }} />
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.5rem',
              color: '#FFD700',
              margin: 0
            }}>
              OpenAI API Key
            </h2>
          </div>

          <p style={{
            color: '#fff',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            Para usar el agente neurológico conversacional, necesitas una clave API de OpenAI.
            Puedes obtenerla en{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#FFD700', textDecoration: 'underline' }}
            >
              platform.openai.com/api-keys
            </a>
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#fff',
              marginBottom: '0.5rem',
              fontWeight: 600
            }}>
              Clave API
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
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFD700'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)'}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '1rem',
              background: saved ? '#10b981' : '#FFD700',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: 'Orbitron, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!saved) {
                e.target.style.background = '#ffd70099';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saved) {
                e.target.style.background = '#FFD700';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {saved ? <FaCheck /> : <FaSave />}
            {saved ? 'Guardado' : 'Guardar Configuración'}
          </button>

          {saved && (
            <p style={{
              marginTop: '1rem',
              color: '#10b981',
              textAlign: 'center',
              fontWeight: 600
            }}>
              ✓ Configuración guardada correctamente
            </p>
          )}

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <p style={{
              color: '#FFD700',
              margin: 0,
              fontSize: '0.95rem',
              lineHeight: 1.5
            }}>
              <strong>Nota de seguridad:</strong> Tu clave API se guarda localmente en tu navegador
              y nunca se envía a nuestros servidores. Solo se usa para comunicarse directamente con OpenAI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
