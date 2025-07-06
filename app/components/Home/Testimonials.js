'use client'
import React from 'react';
import { FaQuoteLeft, FaUserCircle } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Alex Kim',
    role: 'Neurodivergent Professional',
    text: 'This platform helped me discover my strengths and land a job that truly fits me. The assessment was spot-on and the support team is amazing!',
    avatar: null
  },
  {
    name: 'Jordan Lee',
    role: 'HR Manager, TechNova',
    text: 'We found incredible talent through this platform. The matching process is seamless and the analytics gave us real insight into our team.',
    avatar: null
  },
  {
    name: 'Morgan Patel',
    role: 'Therapist & Coach',
    text: 'I recommend this to all my clients. The resources and games are engaging and the AI support is always helpful.',
    avatar: null
  },
  {
    name: 'Samantha Chen',
    role: 'Diversity & Inclusion Lead, InnovateX',
    text: 'Partnering with this platform has transformed our hiring process. We are now a more inclusive and innovative company.',
    avatar: null
  }
];

export default function Testimonials() {
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
          Success Stories
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
              background: '#23213a',
              borderRadius: '16px',
              padding: '2.5rem 2rem 2rem 2rem',
              boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'Rajdhani, sans-serif',
              position: 'relative',
              zIndex: 2
            }}>
              <FaQuoteLeft style={{ fontSize: 28, color: 'var(--primary-gold)', marginBottom: 16, opacity: 0.7 }} />
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1.1rem', marginBottom: 18, fontStyle: 'italic', lineHeight: 1.6 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-gold)' }} />
                ) : (
                  <FaUserCircle style={{ fontSize: 44, color: 'var(--primary-purple)' }} />
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: 'var(--primary-gold)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Orbitron, Rajdhani, sans-serif' }}>{t.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.98rem' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 