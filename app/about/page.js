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
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
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
          radial-gradient(ellipse at 20% 30%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)
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
          linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px)
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
            background: 'rgba(16, 16, 16, 0.8)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: '#FFD700',
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
            background: 'linear-gradient(135deg, #ffffff 0%, #FFD700 50%, #9333EA 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'textGradient 6s ease-in-out infinite, fadeInUp 0.8s ease 0.4s both',
          }}>
            {t('about.title')}
          </h1>

          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.3rem',
            color: 'rgba(255, 255, 255, 0.8)',
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
            background: 'rgba(16, 16, 16, 0.6)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease 0.8s both',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.4)';
            e.currentTarget.style.background = 'rgba(16, 16, 16, 0.8)';
            e.currentTarget.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
            e.currentTarget.style.background = 'rgba(16, 16, 16, 0.6)';
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
                background: 'linear-gradient(135deg, #FFD700, #9333EA)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                👥
              </div>
              <h2 style={{
                fontFamily: 'Orbitron, monospace',
                color: '#FFD700',
                fontSize: '1.4rem',
                margin: 0,
                fontWeight: '600',
              }}>
                {t('about.team.title')}
              </h2>
            </div>

            {teamMembers.map((member, index) => (
              <div key={index} style={{
                background: activeSection === index ? 'rgba(147, 51, 234, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: activeSection === index ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
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
                      fontFamily: 'Rajdhani, sans-serif',
                      color: '#FFD700',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                    }}>
                      {member.role}
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, monospace',
                      color: '#9333EA',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                    }}>
                      {member.name}
                    </div>
                  </div>
                </div>
                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'rgba(255, 255, 255, 0.7)',
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
            background: 'rgba(16, 16, 16, 0.6)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.8s ease 1s both',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.4)';
            e.currentTarget.style.background = 'rgba(16, 16, 16, 0.8)';
            e.currentTarget.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
            e.currentTarget.style.background = 'rgba(16, 16, 16, 0.6)';
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
                background: 'linear-gradient(135deg, #FFD700, #9333EA)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                ⚡
              </div>
              <h2 style={{
                fontFamily: 'Orbitron, monospace',
                color: '#FFD700',
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateX(8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                  <div>
                    <h3 style={{
                      fontFamily: 'Orbitron, monospace',
                      color: '#FFD700',
                      fontSize: '1rem',
                      margin: '0 0 4px 0',
                      fontWeight: '600',
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      color: 'rgba(255, 255, 255, 0.7)',
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
          background: 'rgba(16, 16, 16, 0.4)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          animation: 'fadeInUp 0.8s ease 1.2s both',
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
              background: 'linear-gradient(135deg, #FFD700, #9333EA)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              📧
            </div>
            <h2 style={{
              fontFamily: 'Orbitron, monospace',
              color: '#FFD700',
              fontSize: '1.6rem',
              margin: 0,
              fontWeight: '600',
            }}>
              {t('about.contact.title')}
            </h2>
          </div>

          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: 'rgba(255, 255, 255, 0.8)',
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
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            color: '#FFD700',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
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