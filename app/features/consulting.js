"use client";
import React from "react";
import { FaCog, FaArrowLeft, FaUserTie } from "react-icons/fa";

const sampleServices = [
  { name: "Accessibility Audit", desc: "Comprehensive review of workplace accessibility." },
  { name: "Custom Training", desc: "Tailored workshops for your team." },
  { name: "Policy Development", desc: "Guidance on inclusive policy creation." },
];

export default function CustomSolutionsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaCog /> Custom Solutions</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Tailored solutions and consulting services for organizations of all sizes.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleServices.map((s, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaUserTie style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{s.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Request Consultation</button>
    </div>
  );
} 