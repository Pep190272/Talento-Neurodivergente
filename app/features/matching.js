"use client";
import React from "react";
import { FaSearch, FaUserTie, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const sampleTalents = [
  { name: "Alex Kim", skills: ["Pattern Recognition", "Data Analysis"], match: 98 },
  { name: "Jordan Lee", skills: ["Creative Problem Solving", "UX Design"], match: 94 },
  { name: "Morgan Patel", skills: ["Attention to Detail", "QA Testing"], match: 91 },
];

export default function SmartTalentMatchingFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaSearch /> Smart Talent Matching</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        AI-driven matching algorithm that connects neurodivergent candidates with roles that align with their strengths and preferences.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleTalents.map((t, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, textAlign: 'center', color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaUserTie style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{t.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>Skills: {t.skills.join(', ')}</div>
            <div style={{ color: '#4ade80', fontWeight: 600 }}><FaCheckCircle style={{ marginRight: 6 }} />Match: {t.match}%</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Run Matching</button>
    </div>
  );
} 