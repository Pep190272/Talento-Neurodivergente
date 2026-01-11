'use client'
import React from 'react';
import { FaQuoteLeft, FaUserCircle } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const testimonials = [
  {
    name: 'Alex Kim',
    role: 'Profesional Neurodivergente',
    text: 'Esta plataforma me ayudó a descubrir mis fortalezas y conseguir un trabajo que realmente me encaja. ¡La evaluación fue precisa y el equipo de soporte es increíble!',
    avatar: null
  },
  {
    name: 'Jordan Lee',
    role: 'Gerente de RRHH, TechNova',
    text: 'Encontramos talento increíble a través de esta plataforma. El proceso de emparejamiento es perfecto y las analíticas nos dieron información real sobre nuestro equipo.',
    avatar: null
  },
  {
    name: 'Morgan Patel',
    role: 'Terapeuta y Coach',
    text: 'Lo recomiendo a todos mis clientes. Los recursos y juegos son atractivos y el soporte de IA siempre es útil.',
    avatar: null
  },
  {
    name: 'Samantha Chen',
    role: 'Líder de Diversidad e Inclusión, InnovateX',
    text: 'Asociarnos con esta plataforma ha transformado nuestro proceso de contratación. Ahora somos una empresa más inclusiva e innovadora.',
    avatar: null
  }
];

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section style={{
      padding: '4rem 2rem',
      background: '#F0F5FA',
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
          {t('testimonials.title')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch',
          justifyItems: 'center'
        }}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2.5rem 2rem 2rem 2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              fontFamily: 'inherit, sans-serif',
              position: 'relative',
              zIndex: 2
            }}>
              <FaQuoteLeft style={{ fontSize: 28, color: '#046BD2', marginBottom: 16, opacity: 0.7 }} />
              <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: 18, fontStyle: 'italic', lineHeight: 1.6 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #046BD2' }} />
                ) : (
                  <FaUserCircle style={{ fontSize: 44, color: '#046BD2' }} />
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#046BD2', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'inherit, sans-serif' }}>{t.name}</div>
                  <div style={{ color: '#64748B', fontSize: '0.98rem' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 