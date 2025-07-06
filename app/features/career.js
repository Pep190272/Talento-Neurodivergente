"use client";
import React from "react";
import { FaRocket, FaArrowLeft, FaMedal } from "react-icons/fa";

const samplePrograms = [
  { name: "Leadership Fast-Track", desc: "Accelerated leadership development for neurodivergent professionals." },
  { name: "Tech Skills Bootcamp", desc: "Intensive upskilling in high-demand tech fields." },
  { name: "Mentorship Connect", desc: "One-on-one mentorship with industry leaders." },
];

export default function CareerAccelerationFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaRocket /> Career Acceleration</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Fast-track career development programs designed for neurodivergent professionals.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {samplePrograms.map((p, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaMedal style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{p.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Join Program</button>
    </div>
  );
} 