"use client";
import React from "react";
import { FaGraduationCap, FaArrowLeft, FaBookOpen } from "react-icons/fa";

const samplePaths = [
  { title: "Data Analysis Mastery", steps: ["Intro to Data", "Excel Skills", "Python for Data", "Project: Analyze Trends"] },
  { title: "Creative Design", steps: ["Design Principles", "Color Theory", "UX/UI Basics", "Project: App Mockup"] },
];

export default function SkillsDevelopmentFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaGraduationCap /> Skills Development</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Personalized learning paths and skill development programs tailored to individual neurodivergent profiles.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {samplePaths.map((p, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaBookOpen style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{p.title}</div>
            <ul style={{ color: '#ffe066', margin: '8px 0', paddingLeft: 18 }}>
              {p.steps.map((s, j) => <li key={j}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Start Learning Path</button>
    </div>
  );
} 