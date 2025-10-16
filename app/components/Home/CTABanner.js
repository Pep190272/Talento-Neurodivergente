'use client'

import React from 'react';
import Link from 'next/link';
import { FaRocket, FaHandshake } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

export default function CTABanner() {
  const { t } = useLanguage();

  return (
    <section style={{
      padding: '3.5rem 2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderRadius: '24px',
      margin: '3rem auto',
      maxWidth: 1100,
      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h2 style={{
        color: '#181024',
        fontFamily: 'Orbitron, Rajdhani, sans-serif',
        fontSize: '2.2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: 900,
        letterSpacing: '-0.01em',
        textShadow: '0 2px 12px #fff8'
      }}>
        {t('cta.title')}
      </h2>
      <p style={{
        color: '#23213a',
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '1.2rem',
        textAlign: 'center',
        marginBottom: '2.2rem',
        maxWidth: 600,
        fontWeight: 500
      }}>
        {t('cta.description')}
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/get-started" style={{
          background: '#181024',
          color: 'var(--primary-gold)',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 2px 12px #ffd70033',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'background 0.2s, color 0.2s',
          border: '2px solid #FFD700'
        }}>
          <FaRocket /> {t('cta.getStarted')}
        </Link>
        <Link href="/features/partnerships" style={{
          background: '#fff',
          color: '#9333EA',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 2px 12px #9333ea22',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'background 0.2s, color 0.2s',
          border: '2px solid #9333EA'
        }}>
          <FaHandshake /> {t('cta.becomePartner')}
        </Link>
      </div>
    </section>
  );
} 