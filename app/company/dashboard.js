"use client";
import React from "react";
import { FaUserTie, FaSearch, FaFilter, FaEnvelope } from "react-icons/fa";

const sampleTalents = [
  { name: "Alex Kim", skills: ["Pattern Recognition", "Data Analysis"], match: 98 },
  { name: "Jordan Lee", skills: ["Creative Problem Solving", "UX Design"], match: 94 },
  { name: "Morgan Patel", skills: ["Attention to Detail", "QA Testing"], match: 91 },
];

export default function CompanyDashboard() {
  return (
    <div className="company-dashboard-area">
      <h1 className="quiz-title"><FaUserTie /> Company Dashboard</h1>
      <div style={{ margin: '24px 0', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
        <input placeholder="Search talent..." style={{ padding: 8, borderRadius: 8, border: '1px solid #ffd700', minWidth: 200 }} />
        <button className="quiz-btn"><FaFilter /> Filter</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleTalents.map((t, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, textAlign: 'center', color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaUserTie style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{t.name}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>Skills: {t.skills.join(', ')}</div>
            <div style={{ color: '#4ade80', fontWeight: 600 }}>Match: {t.match}%</div>
            <button className="quiz-btn" style={{ marginTop: 10, fontSize: 14 }}><FaEnvelope /> Contact</button>
          </div>
        ))}
      </div>
    </div>
  );
} 