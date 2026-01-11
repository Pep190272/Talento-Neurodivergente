'use client'

import React, { useEffect, useState } from 'react';
import { FaChartLine, FaUsers, FaHandshake, FaStar } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

const statsConfig = [
  {
    icon: <FaChartLine />,
    label: 'Incremento de Productividad',
    end: 85,
    suffix: '%',
    color: '#046BD2',
    description: 'Aumento promedio de productividad en equipos inclusivos'
  },
  {
    icon: <FaUsers />,
    label: 'Colocaciones Exitosas',
    end: 750,
    suffix: '+',
    color: '#045CB4',
    description: 'Profesionales neurodivergentes colocados'
  },
  {
    icon: <FaHandshake />,
    label: 'Empresas Asociadas',
    end: 120,
    suffix: '+',
    color: '#046BD2',
    description: 'Organizaciones confían en nuestras soluciones'
  },
  {
    icon: <FaStar />,
    label: 'Tasa de Satisfacción',
    end: 95,
    suffix: '%',
    color: '#045CB4',
    description: 'Satisfacción de candidatos y empleadores'
  }
];

function useAnimatedCounter(end, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let raf;
    function animate() {
      start += increment;
      if (start < end) {
        setValue(Math.floor(start));
        raf = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return value;
}

export default function StatsImpact() {
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
          {t('statsImpact.title')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch',
          justifyItems: 'center'
        }}>
          {statsConfig.map((stat, idx) => {
            const value = useAnimatedCounter(stat.end);
            return (
              <div key={idx} style={{
                background: '#F0F5FA',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
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
                <div style={{ fontSize: 38, color: stat.color, marginBottom: 16 }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: 'inherit, sans-serif',
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.3s'
                }}>
                  {value}{stat.suffix}
                </div>
                <div style={{ color: '#1E293B', fontWeight: 600, fontSize: '1.1rem', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ color: '#64748B', fontSize: '1rem' }}>{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 