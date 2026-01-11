'use client'

import React from 'react';
import Link from 'next/link';
import { FaLifeRing } from 'react-icons/fa';

export default function ContactSupportTeaser() {
  return (
    <section style={{
      padding: '3.5rem 2rem',
      background: '#F0F5FA',
      borderTop: '1px solid rgba(4, 107, 210, 0.15)',
      borderBottom: '1px solid rgba(4, 107, 210, 0.15)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 48, color: '#046BD2', marginBottom: 18 }}>
          <FaLifeRing />
        </div>
        <h2 style={{
          color: '#046BD2',
          fontFamily: 'inherit, sans-serif',
          fontSize: '2rem',
          marginBottom: '1.2rem',
          letterSpacing: '-0.01em'
        }}>
          ¿Necesitas Ayuda o Tienes Preguntas?
        </h2>
        <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: '2rem', fontFamily: 'inherit, sans-serif' }}>
          Nuestro equipo está aquí para apoyarte. Contáctanos para asistencia, comentarios o consultas de asociación.
        </p>
        <Link href="/forms" style={{
          background: '#046BD2',
          color: '#FFFFFF',
          fontWeight: 700,
          fontFamily: 'inherit, sans-serif',
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 4px 14px 0 rgba(4, 107, 210, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.7rem',
          transition: 'all 0.3s ease',
          border: '2px solid #046BD2'
        }}>
          <FaLifeRing /> Contactar Soporte
        </Link>
      </div>
    </section>
  );
} 