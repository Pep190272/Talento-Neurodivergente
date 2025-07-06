"use client";
import React from "react";
import { FaShieldAlt, FaArrowLeft, FaAccessibleIcon } from "react-icons/fa";

const sampleAccommodations = [
  { title: "Noise-Cancelling Headphones", desc: "Reduce auditory distractions in open offices." },
  { title: "Flexible Work Hours", desc: "Allow for non-traditional schedules to support focus and well-being." },
  { title: "Quiet Workspace", desc: "Provide access to low-stimulation environments." },
];

export default function WorkplaceAccommodationsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaShieldAlt /> Workplace Accommodations</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Expert guidance on implementing effective workplace accommodations and support systems.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleAccommodations.map((a, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaAccessibleIcon style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{a.title}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{a.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Request Support</button>
    </div>
  );
} 