'use client'
import React from 'react';
import { FaUserPlus, FaBrain, FaRocket, FaHandshake, FaChartLine } from 'react-icons/fa';

const steps = [
  {
    icon: <FaUserPlus />,
    title: 'Sign Up',
    description: 'Create your profile as an individual, company, or therapist.'
  },
  {
    icon: <FaBrain />,
    title: 'Take Assessment',
    description: 'Discover your strengths and preferences with our AI-powered tools.'
  },
  {
    icon: <FaRocket />,
    title: 'Get Matched',
    description: 'Our smart algorithm connects you with the best opportunities or talent.'
  },
  {
    icon: <FaHandshake />,
    title: 'Collaborate',
    description: 'Engage in inclusive teams and access tailored resources.'
  },
  {
    icon: <FaChartLine />,
    title: 'Grow & Succeed',
    description: 'Track your progress and celebrate your achievements!'
  }
];

export default function HowItWorks() {
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
          How It Works
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