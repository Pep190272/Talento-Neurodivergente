"use client";
import React from "react";
import { FaHandshake, FaArrowLeft, FaBuilding } from "react-icons/fa";

const samplePartners = [
  { name: "TechNova Inc.", desc: "Leading the way in neurodiversity hiring." },
  { name: "BrightPath Solutions", desc: "Championing inclusive workplace culture." },
  { name: "InnovateX", desc: "Pioneers in accessible technology." },
];

export default function EmployerPartnershipsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaHandshake /> Employer Partnerships</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Strategic partnerships with forward-thinking companies committed to neurodiversity inclusion.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {samplePartners.map((p, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaBuilding style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{p.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Become a Partner</button>
    </div>
  );
} 