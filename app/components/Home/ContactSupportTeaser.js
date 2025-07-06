'use client'

import React from 'react';
import Link from 'next/link';
import { FaLifeRing } from 'react-icons/fa';

export default function ContactSupportTeaser() {
  return (
    <section style={{
      padding: '3.5rem 2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderTop: '1px solid rgba(147, 51, 234, 0.10)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.10)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 48, color: 'var(--primary-gold)', marginBottom: 18 }}>
          <FaLifeRing />
        </div>
        <h2 style={{
          color: 'var(--primary-gold)',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontSize: '2rem',
          marginBottom: '1.2rem',
          letterSpacing: '-0.01em'
        }}>
          Need Help or Have Questions?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem', fontFamily: 'Rajdhani, sans-serif' }}>
          Our team is here to support you. Reach out for assistance, feedback, or partnership inquiries.
        </p>
        <Link href="/forms" style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #9333EA 100%)',
          color: '#181024',
          fontWeight: 700,
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 2px 12px #ffd70033',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'background 0.2s, color 0.2s',
          border: '2px solid #FFD700'
        }}>
          <FaLifeRing /> Contact Support
        </Link>
      </div>
    </section>
  );
} 