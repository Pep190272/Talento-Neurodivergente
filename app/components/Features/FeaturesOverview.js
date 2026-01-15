import React from 'react';
import { 
  FaBrain, FaSearch, FaGraduationCap, FaUsers, FaRocket, FaLightbulb, FaHandshake, FaStar, FaCog, FaShieldAlt, FaComments, FaPlay
} from 'react-icons/fa';
import { IoAnalytics } from 'react-icons/io5';
import Link from 'next/link';

const features = [
  {
    icon: FaBrain,
    title: "Cognitive Diversity Assessment",
    description: "AI-powered tools to identify and leverage unique cognitive strengths.",
    route: "cognitive-diversity"
  },
  {
    icon: FaSearch,
    title: "Smart Talent Matching",
    description: "AI-driven matching algorithm for neurodivergent candidates and roles.",
    route: "matching"
  },
  {
    icon: FaGraduationCap,
    title: "Skills Development",
    description: "Personalized learning paths and skill development programs.",
    route: "development"
  },
  {
    icon: FaUsers,
    title: "Inclusive Team Building",
    description: "Training and resources for building diverse, high-performing teams.",
    route: "training"
  },
  {
    icon: IoAnalytics,
    title: "Performance Analytics",
    description: "Data-driven insights into team performance and diversity impact.",
    route: "analytics"
  },
  {
    icon: FaShieldAlt,
    title: "Workplace Accommodations",
    description: "Guidance on effective workplace accommodations and support systems.",
    route: "support"
  },
  {
    icon: FaHandshake,
    title: "Employer Partnerships",
    description: "Strategic partnerships for neurodiversity inclusion.",
    route: "partnerships"
  },
  {
    icon: FaRocket,
    title: "Career Acceleration",
    description: "Fast-track career development for neurodivergent professionals.",
    route: "career"
  }
];

export default function FeaturesOverview() {
  return (
    <section style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #181024 0%, #23213a 100%)',
      borderTop: '1px solid rgba(4, 107, 210, 0.10)',
      borderBottom: '1px solid rgba(4, 107, 210, 0.10)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ color: 'var(--primary-gold)', marginBottom: '2rem', textAlign: 'center', fontSize: '2.5rem', fontFamily: 'Orbitron, Rajdhani, sans-serif' }}>
          Platform Features
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{
              background: '#23213a',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 24px rgba(4, 107, 210, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ fontSize: 40, color: 'var(--primary-purple)', marginBottom: 16 }}>
                <feature.icon />
              </div>
              <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.3rem', marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 16 }}>{feature.description}</p>
              <Link href={`/features/${feature.route}`} style={{
                color: 'var(--primary-purple)',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: 'auto',
                fontSize: '1rem'
              }}>
                Learn More <FaPlay style={{ fontSize: 16 }} />
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/features" style={{
            background: 'var(--primary-gold)',
            color: '#181024',
            padding: '0.75rem 2rem',
            borderRadius: '24px',
            fontWeight: 700,
            fontSize: '1.1rem',
            textDecoration: 'none',
            boxShadow: '0 2px 12px #ffd70033',
            fontFamily: 'Orbitron, Rajdhani, sans-serif'
          }}>
            View All Features
          </Link>
        </div>
      </div>
    </section>
  );
} 