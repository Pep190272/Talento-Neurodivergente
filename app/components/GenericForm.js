'use client'
import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../utils/translations';

// Schema generator function
const getSchemas = (t) => ({
  individual: [
    { label: t.forms.individual.fullName, name: 'name', type: 'text', required: true },
    { label: t.forms.individual.diagnoses, name: 'diagnoses', type: 'text', required: false },
    { label: t.forms.individual.preferences, name: 'preferences', type: 'textarea', required: false },
  ],
  company: [
    { label: t.forms.company.companyName, name: 'companyName', type: 'text', required: true },
    { label: t.forms.company.roles, name: 'roles', type: 'textarea', required: true },
    { label: t.forms.company.timeline, name: 'timeline', type: 'text', required: false },
  ],
  therapist: [
    { label: t.forms.therapist.fullName, name: 'name', type: 'text', required: true },
    { label: t.forms.therapist.specialties, name: 'specialties', type: 'text', required: true },
    { label: t.forms.therapist.rates, name: 'rates', type: 'text', required: false },
  ],
});

export default function GenericForm({ type = 'individual', onSubmit }) {
  const { language } = useLanguage();
  const t = translations[language];
  const schema = getSchemas(t)[type] || [];
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
      if (typeof window !== 'undefined') {
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
      }

    } catch (err) {
      setError(err.message);
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', padding: 32, border: '1px solid #E5E7EB', marginTop: 8 }}>
      {schema.map(field => (
        <div key={field.name} style={{ marginBottom: 8 }}>
          <label style={{ color: '#334155', fontWeight: 600, fontFamily: 'inherit, sans-serif', fontSize: '1.08rem', marginBottom: 6, display: 'block' }}>
            {field.label}
            {field.required && <span style={{ color: '#046BD2', marginLeft: 4 }}> *</span>}
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                style={{
                  width: '100%',
                  minHeight: 70,
                  background: '#F0F5FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  color: '#1E293B',
                  fontFamily: 'inherit, sans-serif',
                  fontSize: '1rem',
                  padding: '12px 14px',
                  marginTop: 6,
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  resize: 'vertical',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid #046BD2';
                  e.target.style.boxShadow = '0 0 0 2px rgba(4, 107, 210, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid #E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
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
                  background: '#F0F5FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  color: '#1E293B',
                  fontFamily: 'inherit, sans-serif',
                  fontSize: '1rem',
                  padding: '12px 14px',
                  marginTop: 6,
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid #046BD2';
                  e.target.style.boxShadow = '0 0 0 2px rgba(4, 107, 210, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid #E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            )}
          </label>
        </div>
      ))}
      {error && <div style={{ color: '#e53935', background: 'rgba(229,57,53,0.08)', borderRadius: 8, padding: '8px 14px', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
      <button type="submit" disabled={submitting} style={{ padding: '0.85rem 2.2rem', borderRadius: 10, background: '#046BD2', color: '#FFFFFF', fontWeight: 700, fontFamily: 'inherit, sans-serif', fontSize: '1.08rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px 0 rgba(4, 107, 210, 0.3)', letterSpacing: '0.04em', marginTop: 8, transition: 'all 0.3s ease', opacity: submitting ? 0.7 : 1 }}>
        {submitting ? t.forms.submitting : t.forms.submit}
      </button>
    </form>
  );
} 