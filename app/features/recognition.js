"use client";
import React from "react";
import { FaStar, FaArrowLeft, FaAward } from "react-icons/fa";

const sampleAwards = [
  { name: "Inclusion Champion", desc: "For outstanding leadership in neurodiversity inclusion." },
  { name: "Innovator Award", desc: "For creative solutions advancing accessibility." },
  { name: "Team Excellence", desc: "For high-performing, inclusive teams." },
];

export default function RecognitionProgramsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaStar /> Recognition Programs</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Awards and recognition for companies and individuals leading in neurodiversity inclusion.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleAwards.map((a, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaAward style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{a.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{a.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Nominate</button>
    </div>
  );
} 