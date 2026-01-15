'use client'
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const teamMembers = [
    {
      role: "Conferenciante experta en neurodiversidad",

      name: "Elisa Farias",
      icon: "🚀",
      description: "Embajadora de Diversia en México"
    },
    {
      role: "Crédito de Idea",
      name: "Olga Cruz",
      icon: "💡",
      description: "Visionaria detrás del concepto de neurodiversidad e innovación inclusiva"
    },
    {
      role: "Asistencia Técnica",
      name: "José Miguel Moreno Carrillo",
      icon: "⚡",
      description: "Consultor técnico que proporciona experiencia en accesibilidad y experiencia de usuario"
    }
  ];

  const features = [
    { icon: "🧠", title: "Enfoque en Neurodiversidad", description: "Celebrando la diversidad cognitiva y perspectivas únicas" },
    { icon: "🔧", title: "Stack Tecnológico Moderno", description: "Construido con tecnologías web de vanguardia e integración de IA" },
    { icon: "♿", title: "Accesibilidad Primero", description: "Diseñado con principios inclusivos y acceso universal" },
    { icon: "🌟", title: "Centro de Innovación", description: "Plataforma para mostrar soluciones creativas e ideas" }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(4, 107, 210, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(4, 92, 180, 0.04) 0%, transparent 50%)
        `,
        animation: 'gradientShift 8s ease-in-out infinite',
        zIndex: 1,
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(4, 107, 210, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(4, 107, 210, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.3,
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(4, 107, 210, 0.08)',
            border: '1px solid rgba(4, 107, 210, 0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: '#046BD2',
            marginBottom: '32px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease 0.2s both',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🌟</span>
            {t('about.badge')}
          </div>

          <h1 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '700',
            margin: '0 0 24px 0',
            lineHeight: '1.2',
            color: '#046BD2',
            animation: 'fadeInUp 0.8s ease 0.4s both',
          }}>
            {t('about.title')}
          </h1>

          <p style={{
            fontFamily: 'inherit, sans-serif',
            fontSize: '1.3rem',
            color: '#334155',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            animation: 'fadeInUp 0.8s ease 0.6s both',
          }}>
            {t('about.subtitle')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '80px',
        }}>
          
          {/* Team Section */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease 0.8s both',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#046BD2';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(4, 107, 210, 0.15)';
            e.currentTarget.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#046BD2',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                👥
              </div>
              <h2 style={{
                fontFamily: 'inherit, sans-serif',
                color: '#046BD2',
                fontSize: '1.4rem',
                margin: 0,
                fontWeight: '600',
              }}>
                {t('about.team.title')}
              </h2>
            </div>

            {teamMembers.map((member, index) => (
              <div key={index} style={{
                background: activeSection === index ? 'rgba(4, 107, 210, 0.08)' : '#F0F5FA',
                border: activeSection === index ? '1px solid rgba(4, 107, 210, 0.3)' : '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                transition: 'all 0.5s ease',
                transform: activeSection === index ? 'scale(1.02)' : 'scale(1)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{member.icon}</span>
                  <div>
                    <div style={{
                      fontFamily: 'inherit, sans-serif',
                      color: '#046BD2',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}>
                      {member.role}
                    </div>
                    <div style={{
                      fontFamily: 'inherit, sans-serif',
                      color: '#1E293B',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                    }}>
                      {member.name}
                    </div>
                  </div>
                </div>
                <p style={{
                  fontFamily: 'inherit, sans-serif',
                  color: '#64748B',
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: '1.4',
                }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease 1s both',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#046BD2';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(4, 107, 210, 0.15)';
            e.currentTarget.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#046BD2',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                ⚡
              </div>
              <h2 style={{
                fontFamily: 'inherit, sans-serif',
                color: '#046BD2',
                fontSize: '1.4rem',
                margin: 0,
                fontWeight: '600',
              }}>
                {t('about.keyFeatures.title')}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gap: '16px',
            }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: '#F0F5FA',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(4, 107, 210, 0.08)';
                  e.currentTarget.style.transform = 'translateX(8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F0F5FA';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                  <div>
                    <h3 style={{
                      fontFamily: 'inherit, sans-serif',
                      color: '#046BD2',
                      fontSize: '1rem',
                      margin: '0 0 4px 0',
                      fontWeight: '600',
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      fontFamily: 'inherit, sans-serif',
                      color: '#64748B',
                      fontSize: '0.9rem',
                      margin: 0,
                      lineHeight: '1.4',
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          animation: 'fadeInUp 0.8s ease 1.2s both',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#046BD2',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              📧
            </div>
            <h2 style={{
              fontFamily: 'inherit, sans-serif',
              color: '#046BD2',
              fontSize: '1.6rem',
              margin: 0,
              fontWeight: '600',
            }}>
              {t('about.contact.title')}
            </h2>
          </div>

          <p style={{
            fontFamily: 'inherit, sans-serif',
            color: '#334155',
            fontSize: '1.1rem',
            maxWidth: '500px',
            margin: '0 auto 24px auto',
            lineHeight: '1.6',
          }}>
            {t('about.contact.description')}
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(4, 107, 210, 0.08)',
            border: '1px solid rgba(4, 107, 210, 0.2)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            color: '#046BD2',
            fontFamily: 'inherit, sans-serif',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(4, 107, 210, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(4, 107, 210, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(4, 107, 210, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(4, 107, 210, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <span>📬</span>
            {t('about.contact.email')}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        @keyframes textGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}