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
      background: '#FFFFFF',
      borderTop: '1px solid rgba(4, 107, 210, 0.15)',
      borderBottom: '1px solid rgba(4, 107, 210, 0.15)'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          color: '#046BD2',
          fontFamily: 'inherit, sans-serif',
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
              background: '#F0F5FA',
              borderRadius: '14px',
              padding: '2rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
              minHeight: 120
            }}>
              <img src={p.logo} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', marginBottom: 16, filter: 'brightness(1) drop-shadow(0 2px 8px rgba(4, 107, 210, 0.2))', borderRadius: '50%' }} />
              <div style={{ color: '#046BD2', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'inherit, sans-serif', textAlign: 'center' }}>{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 