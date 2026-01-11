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
      background: 'rgba(4, 107, 210, 0.06)',
      borderRadius: '24px',
      margin: '3rem auto',
      maxWidth: 1100,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(4, 107, 210, 0.15)'
    }}>
      <h2 style={{
        color: '#046BD2',
        fontFamily: 'inherit, sans-serif',
        fontSize: '2.2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: 900,
        letterSpacing: '-0.01em'
      }}>
        {t('cta.title')}
      </h2>
      <p style={{
        color: '#334155',
        fontFamily: 'inherit, sans-serif',
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
          background: '#046BD2',
          color: '#FFFFFF',
          fontFamily: 'inherit, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 4px 14px 0 rgba(4, 107, 210, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'all 0.3s ease',
          border: '2px solid #046BD2'
        }}>
          <FaRocket /> {t('cta.getStarted')}
        </Link>
        <Link href="/features/partnerships" style={{
          background: '#FFFFFF',
          color: '#046BD2',
          fontFamily: 'inherit, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'all 0.3s ease',
          border: '2px solid #046BD2'
        }}>
          <FaHandshake /> {t('cta.becomePartner')}
        </Link>
      </div>
    </section>
  );
} 