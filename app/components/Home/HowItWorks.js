'use client'
import React from 'react';
import { FaUserPlus, FaBrain, FaRocket, FaHandshake, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';


export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <FaUserPlus />,
      title: t('howItWorks.steps.signUp.title'),
      description: t('howItWorks.steps.signUp.description')
    },
    {
      icon: <FaBrain />,
      title: t('howItWorks.steps.assessment.title'),
      description: t('howItWorks.steps.assessment.description')
    },
    {
      icon: <FaRocket />,
      title: t('howItWorks.steps.matched.title'),
      description: t('howItWorks.steps.matched.description')
    },
    {
      icon: <FaHandshake />,
      title: t('howItWorks.steps.collaborate.title'),
      description: t('howItWorks.steps.collaborate.description')
    },
    {
      icon: <FaChartLine />,
      title: t('howItWorks.steps.grow.title'),
      description: t('howItWorks.steps.grow.description')
    }
  ];

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
          {t('howItWorks.title')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch',
          justifyItems: 'center'
        }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{
              background: '#23213a',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'transform 0.2s',
              fontFamily: 'Rajdhani, sans-serif',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ fontSize: 38, color: 'var(--primary-purple)', marginBottom: 16, animation: 'gradientShift 4s infinite' }}>
                {step.icon}
              </div>
              <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', marginBottom: 8, fontFamily: 'Orbitron, Rajdhani, sans-serif' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 0 }}>{step.description}</p>
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: '1.1rem',
                color: 'rgba(255,215,0,0.12)',
                fontWeight: 900,
                fontFamily: 'Orbitron, Rajdhani, sans-serif',
                zIndex: 0
              }}>{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 