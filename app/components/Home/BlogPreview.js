'use client'

import React from 'react';
import Link from 'next/link';

const posts = [
  {
    title: 'Desbloqueando el Talento Neurodivergente: Guía para Empleadores',
    summary: 'Descubre las mejores prácticas para contratar, incorporar y apoyar a profesionales neurodivergentes en tu organización.',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    link: '/blog/unlocking-neurodivergent-talent'
  },
  {
    title: 'IA en la Neurodiversidad: Cómo la Tecnología Empodera la Inclusión',
    summary: 'Explora cómo las herramientas impulsadas por IA están transformando la evaluación, el emparejamiento y el apoyo para individuos neurodivergentes.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    link: '/blog/ai-in-neurodiversity'
  },
  {
    title: 'Construyendo Equipos Inclusivos: Estrategias que Funcionan',
    summary: 'Aprende estrategias accionables para fomentar una cultura de inclusión e innovación en tu lugar de trabajo.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    link: '/blog/building-inclusive-teams'
  }
];

export default function BlogPreview() {
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
          Blog y Recursos
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch',
          justifyItems: 'center'
        }}>
          {posts.map((post, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 380
            }}>
              <div style={{ width: '100%', height: 180, overflow: 'hidden', background: '#F0F5FA' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
              </div>
              <div style={{ padding: '1.5rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#046BD2', fontFamily: 'inherit, sans-serif', fontSize: '1.25rem', marginBottom: 10, fontWeight: 600 }}>{post.title}</h3>
                <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: 18, flex: 1 }}>{post.summary}</p>
                <Link href={post.link} style={{
                  color: '#046BD2',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: 'inherit, sans-serif',
                  fontSize: '1.05rem',
                  marginTop: 'auto',
                  display: 'inline-block'
                }}>
                  Leer Más &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 