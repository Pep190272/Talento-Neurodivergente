"use client";
import React from "react";
import { FaLightbulb, FaArrowLeft, FaFlask } from "react-icons/fa";

const sampleLabs = [
  { name: "AI for Accessibility", desc: "Developing AI tools to improve workplace accessibility." },
  { name: "Neurodiverse Design", desc: "Innovating inclusive product design strategies." },
  { name: "Cognitive Tech", desc: "Exploring new tech for cognitive support." },
];

export default function InnovationLabsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaLightbulb /> Innovation Labs</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Collaborative spaces where neurodivergent talent can showcase their unique problem-solving approaches.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleLabs.map((l, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaFlask style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{l.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{l.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Join Lab</button>
    </div>
  );
} 