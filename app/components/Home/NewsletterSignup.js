'use client'

import React, { useState } from 'react';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(t('newsletter.error'));
      return;
    }
    setSubmitted(true);
    setEmail('');
    // Here you would send the email to your backend or newsletter service
  };

  return (
    <section style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderTop: '1px solid rgba(147, 51, 234, 0.10)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.10)'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          color: 'var(--primary-gold)',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontSize: '2.3rem',
          marginBottom: '1.5rem',
          letterSpacing: '-0.01em'
        }}>
          {t('newsletter.title')}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif' }}>
          {t('newsletter.description')}
        </p>
        {submitted ? (
          <div style={{ color: 'var(--primary-gold)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FaCheckCircle style={{ color: 'var(--primary-purple)' }} /> {t('newsletter.thankYou')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto', background: '#23213a', borderRadius: 32, overflow: 'hidden', boxShadow: '0 2px 12px #9333ea22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--primary-gold)', fontSize: 22, background: 'none' }}><FaEnvelope /></span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '1rem',
                fontSize: '1.1rem',
                fontFamily: 'Rajdhani, sans-serif',
                background: 'none',
                color: '#fff',
                minWidth: 0
              }}
              disabled={submitted}
              required
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #9333EA 100%)',
                color: '#181024',
                fontWeight: 700,
                fontFamily: 'Orbitron, Rajdhani, sans-serif',
                fontSize: '1.1rem',
                border: 'none',
                padding: '0 2rem',
                borderRadius: 32,
                cursor: 'pointer',
                transition: 'background 0.2s',
                minHeight: 56
              }}
              disabled={submitted}
            >
              {t('newsletter.subscribe')}
            </button>
          </form>
        )}
        {error && <div style={{ color: '#FFD700', marginTop: 12, fontWeight: 600 }}>{error}</div>}
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.98rem', marginTop: 24, fontFamily: 'Rajdhani, sans-serif' }}>
          {t('newsletter.privacy')}
        </div>
      </div>
    </section>
  );
} 