'use client'

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'What is neurodiversity?',
    answer: 'Neurodiversity refers to the natural variation in human brains and minds. It includes conditions like autism, ADHD, dyslexia, and more, emphasizing strengths as well as challenges.'
  },
  {
    question: 'How does the talent matching work?',
    answer: 'Our AI-driven algorithm matches candidates with roles based on their unique strengths, preferences, and assessment results, ensuring the best fit for both individuals and companies.'
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Yes. We use secure, encrypted storage and never share your personal data without your consent. You control your information at all times.'
  },
  {
    question: 'Can companies and therapists join?',
    answer: 'Absolutely! We support individuals, companies, and therapists with tailored resources, tools, and support.'
  },
  {
    question: 'How do I get started?',
    answer: 'Simply sign up, complete your profile, and take an assessment. Our platform will guide you through the next steps.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
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
          Frequently Asked Questions
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