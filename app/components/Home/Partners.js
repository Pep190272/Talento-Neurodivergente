'use client'

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const partners = [
  { name: 'TechNova', logo: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=80&q=80' },
  { name: 'BrightPath', logo: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=80&q=80' },
  { name: 'InnovateX', logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=80&q=80' },
  { name: 'NeuroWorks', logo: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=80&q=80' },
  { name: 'Mindful Inc.', logo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=80&q=80' }
];

export default function Partners() {
  const { t } = useLanguage();

  return (
    <section style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderTop: '1px solid rgba(147, 51, 234, 0.10)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.10)'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          color: 'var(--primary-gold)',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontSize: '2.3rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          letterSpacing: '-0.01em'
        }}>
          {t('partners.title')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          justifyItems: 'center',
          marginBottom: '1.5rem'
        }}>
          {partners.map((p, idx) => (
            <div key={idx} style={{
              background: '#181024',
              borderRadius: '14px',
              padding: '2rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 12px #9333ea22',
              border: '1px solid rgba(255,255,255,0.06)',
              minHeight: 120
            }}>
              <img src={p.logo} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', marginBottom: 16, filter: 'brightness(1.2) drop-shadow(0 2px 8px #FFD70033)', borderRadius: '50%' }} />
              <div style={{ color: 'var(--primary-gold)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Orbitron, Rajdhani, sans-serif', textAlign: 'center' }}>{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 