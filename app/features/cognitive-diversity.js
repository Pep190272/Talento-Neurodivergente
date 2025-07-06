"use client";
import React from "react";
import { FaBrain, FaChartLine, FaArrowLeft } from "react-icons/fa";

const sampleResults = [
  { label: "Pattern Recognition", value: 92 },
  { label: "Attention to Detail", value: 88 },
  { label: "Creativity", value: 81 },
  { label: "Memory", value: 76 },
];

export default function CognitiveDiversityFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaBrain /> Cognitive Diversity Assessment</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Advanced AI-powered assessment tools to identify and leverage unique cognitive strengths and neurodivergent superpowers.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleResults.map((r, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 180, textAlign: 'center', color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaChartLine style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{r.label}</div>
            <div style={{ fontSize: 24, color: '#ffe066' }}>{r.value}%</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Run Assessment</button>
    </div>
  );
} 