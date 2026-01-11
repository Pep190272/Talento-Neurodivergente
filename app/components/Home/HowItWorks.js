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
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontFamily: 'inherit, sans-serif',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ fontSize: 38, color: '#046BD2', marginBottom: 16 }}>
                {step.icon}
              </div>
              <h3 style={{ color: '#046BD2', fontSize: '1.2rem', marginBottom: 8, fontFamily: 'inherit, sans-serif', fontWeight: 600 }}>{step.title}</h3>
              <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: 0 }}>{step.description}</p>
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: '1.1rem',
                color: 'rgba(4, 107, 210, 0.12)',
                fontWeight: 900,
                fontFamily: 'inherit, sans-serif',
                zIndex: 0
              }}>{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 