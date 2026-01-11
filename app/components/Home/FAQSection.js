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
      background: '#FFFFFF',
      borderTop: '1px solid rgba(4, 107, 210, 0.15)',
      borderBottom: '1px solid rgba(4, 107, 210, 0.15)'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          color: '#046BD2',
          fontFamily: 'inherit, sans-serif',
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
              background: '#F0F5FA',
              borderRadius: '14px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              fontFamily: 'inherit, sans-serif'
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#046BD2',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  padding: '1.2rem 1.5rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontFamily: 'inherit, sans-serif',
                  outline: 'none',
                  transition: 'background 0.2s'
                }}
                aria-expanded={openIndex === idx}
              >
                {faq.question}
                {openIndex === idx ? (
                  <FaChevronUp style={{ color: '#046BD2' }} />
                ) : (
                  <FaChevronDown style={{ color: '#046BD2' }} />
                )}
              </button>
              {openIndex === idx && (
                <div style={{
                  padding: '1.2rem 1.5rem',
                  color: '#334155',
                  fontSize: '1.08rem',
                  background: '#FFFFFF',
                  borderTop: '1px solid rgba(4, 107, 210, 0.15)',
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