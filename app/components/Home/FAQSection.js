'use client'

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useLanguage();

  const faqs = [
    { question: t('faq.questions.q1.question'), answer: t('faq.questions.q1.answer') },
    { question: t('faq.questions.q2.question'), answer: t('faq.questions.q2.answer') },
    { question: t('faq.questions.q3.question'), answer: t('faq.questions.q3.answer') },
    { question: t('faq.questions.q4.question'), answer: t('faq.questions.q4.answer') },
    { question: t('faq.questions.q5.question'), answer: t('faq.questions.q5.answer') }
  ];
  return (
    <section style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      borderTop: '1px solid rgba(147, 51, 234, 0.10)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.10)'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          color: 'var(--primary-gold)',
          fontFamily: 'Orbitron, Rajdhani, sans-serif',
          fontSize: '2.3rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          letterSpacing: '-0.01em'
        }}>
          {t('faq.title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{
              background: '#23213a',
              borderRadius: '14px',
              boxShadow: '0 2px 12px #9333ea22',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              fontFamily: 'Rajdhani, sans-serif'
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-gold)',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  padding: '1.2rem 1.5rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, Rajdhani, sans-serif',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
                aria-expanded={openIndex === idx}
              >
                {faq.question}
                {openIndex === idx ? (
                  <FaChevronUp style={{ color: 'var(--primary-purple)' }} />
                ) : (
                  <FaChevronDown style={{ color: 'var(--primary-purple)' }} />
                )}
              </button>
              {openIndex === idx && (
                <div style={{
                  padding: '1.2rem 1.5rem',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: '1.08rem',
                  background: '#181024',
                  borderTop: '1px solid rgba(147, 51, 234, 0.10)',
                  animation: 'fadeIn 0.3s'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 