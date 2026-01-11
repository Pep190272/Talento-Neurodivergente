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
      background: '#FFFFFF',
      borderTop: '1px solid rgba(4, 107, 210, 0.15)',
      borderBottom: '1px solid rgba(4, 107, 210, 0.15)'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          color: '#046BD2',
          fontFamily: 'inherit, sans-serif',
          fontSize: '2.3rem',
          marginBottom: '1.5rem',
          letterSpacing: '-0.01em'
        }}>
          {t('newsletter.title')}
        </h2>
        <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: '2rem', fontFamily: 'inherit, sans-serif' }}>
          {t('newsletter.description')}
        </p>
        {submitted ? (
          <div style={{ color: '#046BD2', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FaCheckCircle style={{ color: '#046BD2' }} /> {t('newsletter.thankYou')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto', background: '#F0F5FA', borderRadius: 32, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #E5E7EB' }}>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: '#046BD2', fontSize: 22, background: 'none' }}><FaEnvelope /></span>
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
                fontFamily: 'inherit, sans-serif',
                background: 'none',
                color: '#1E293B',
                minWidth: 0
              }}
              disabled={submitted}
              required
            />
            <button
              type="submit"
              style={{
                background: '#046BD2',
                color: '#FFFFFF',
                fontWeight: 700,
                fontFamily: 'inherit, sans-serif',
                fontSize: '1.1rem',
                border: 'none',
                padding: '0 2rem',
                borderRadius: 32,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minHeight: 56
              }}
              disabled={submitted}
            >
              {t('newsletter.subscribe')}
            </button>
          </form>
        )}
        {error && <div style={{ color: '#046BD2', marginTop: 12, fontWeight: 600 }}>{error}</div>}
        <div style={{ color: '#64748B', fontSize: '0.98rem', marginTop: 24, fontFamily: 'inherit, sans-serif' }}>
          {t('newsletter.privacy')}
        </div>
      </div>
    </section>
  );
} 