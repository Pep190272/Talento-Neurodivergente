'use client'

import React, { useEffect, useState } from 'react';
import { FaChartLine, FaUsers, FaHandshake, FaStar } from 'react-icons/fa';

const statsConfig = [
  {
    icon: <FaChartLine />,
    label: 'Productivity Increase',
    end: 85,
    suffix: '%',
    color: 'var(--primary-gold)',
    description: 'Average productivity boost in inclusive teams'
  },
  {
    icon: <FaUsers />,
    label: 'Successful Placements',
    end: 750,
    suffix: '+',
    color: 'var(--primary-purple)',
    description: 'Neurodivergent professionals placed'
  },
  {
    icon: <FaHandshake />,
    label: 'Partner Companies',
    end: 120,
    suffix: '+',
    color: 'var(--primary-gold)',
    description: 'Organizations trust our solutions'
  },
  {
    icon: <FaStar />,
    label: 'Satisfaction Rate',
    end: 95,
    suffix: '%',
    color: 'var(--primary-purple)',
    description: 'Candidate and employer satisfaction'
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
          Stats & Impact
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
                background: '#181024',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
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
                <div style={{ fontSize: 38, color: stat.color, marginBottom: 16 }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: 'Orbitron, Rajdhani, sans-serif',
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.3s'
                }}>
                  {value}{stat.suffix}
                </div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 