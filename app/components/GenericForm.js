'use client'
import React, { useState } from 'react';

// Placeholder schemas for each form type
const SCHEMAS = {
  individual: [
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Diagnoses', name: 'diagnoses', type: 'text', required: false },
    { label: 'Preferences', name: 'preferences', type: 'textarea', required: false },
    // ...add more fields as needed
  ],
  company: [
    { label: 'Company Name', name: 'companyName', type: 'text', required: true },
    { label: 'Role/Tasks', name: 'roles', type: 'textarea', required: true },
    { label: 'Timeline', name: 'timeline', type: 'text', required: false },
    // ...add more fields as needed
  ],
  therapist: [
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Specialties', name: 'specialties', type: 'text', required: true },
    { label: 'Rates/Availability', name: 'rates', type: 'text', required: false },
    // ...add more fields as needed
  ],
};

export default function GenericForm({ type = 'individual', onSubmit }) {
  const schema = SCHEMAS[type] || [];
  const [form, setForm] = useState(() => Object.fromEntries(schema.map(f => [f.name, ''])));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: form,
          formType: type
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Form submission failed');
      }

      // Save user data to localStorage for session continuity
      const userData = {
        type,
        ...form,
        submittedAt: new Date().toISOString(),
        summary: result.submission.summary
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      if (onSubmit) onSubmit(result.submission);
      alert(`Form submitted successfully! ${result.submission.summary}`);

      // Redirect to appropriate dashboard
      const redirectUrl = type === 'individual' ? '/dashboard' :
                         type === 'company' ? '/company' :
                         '/therapist';
      window.location.href = redirectUrl;

    } catch (err) {
      setError(err.message);
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(24, 24, 27, 0.95)', borderRadius: 16, boxShadow: '0 4px 32px #9333ea22', padding: 32, border: '1.5px solid #9333ea', marginTop: 8 }}>
      {schema.map(field => (
        <div key={field.name} style={{ marginBottom: 8 }}>
          <label style={{ color: '#ffd700', fontWeight: 600, fontFamily: 'Rajdhani, Orbitron, sans-serif', fontSize: '1.08rem', marginBottom: 6, display: 'block' }}>
            {field.label}
            {field.required && <span style={{ color: '#e53935', marginLeft: 4 }}> *</span>}
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                style={{
                  width: '100%',
                  minHeight: 70,
                  background: 'rgba(34, 24, 44, 0.95)',
                  border: '1.5px solid #9333ea',
                  borderRadius: 10,
                  color: '#fff',
                  fontFamily: 'Rajdhani, Orbitron, sans-serif',
                  fontSize: '1rem',
                  padding: '12px 14px',
                  marginTop: 6,
                  outline: 'none',
                  boxShadow: '0 2px 8px #9333ea11',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  resize: 'vertical',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #ffd700'}
                onBlur={e => e.target.style.border = '1.5px solid #9333ea'}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                style={{
                  width: '100%',
                  background: 'rgba(34, 24, 44, 0.95)',
                  border: '1.5px solid #9333ea',
                  borderRadius: 10,
                  color: '#fff',
                  fontFamily: 'Rajdhani, Orbitron, sans-serif',
                  fontSize: '1rem',
                  padding: '12px 14px',
                  marginTop: 6,
                  outline: 'none',
                  boxShadow: '0 2px 8px #9333ea11',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #ffd700'}
                onBlur={e => e.target.style.border = '1.5px solid #9333ea'}
              />
            )}
          </label>
        </div>
      ))}
      {error && <div style={{ color: '#e53935', background: 'rgba(229,57,53,0.08)', borderRadius: 8, padding: '8px 14px', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
      <button type="submit" disabled={submitting} style={{ padding: '0.85rem 2.2rem', borderRadius: 10, background: 'linear-gradient(90deg, #9333ea 60%, #ffd700 100%)', color: '#18181b', fontWeight: 700, fontFamily: 'Orbitron, Rajdhani, sans-serif', fontSize: '1.08rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px #9333ea22', letterSpacing: '0.04em', marginTop: 8, transition: 'background 0.2s, color 0.2s' }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
} 