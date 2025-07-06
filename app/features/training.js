"use client";
import React from "react";
import { FaUsers, FaArrowLeft, FaChalkboardTeacher } from "react-icons/fa";

const sampleModules = [
  { title: "Neurodiversity 101", desc: "Introduction to neurodiversity and its value in the workplace." },
  { title: "Inclusive Communication", desc: "Best practices for clear, accessible communication." },
  { title: "Bias Awareness", desc: "Recognizing and addressing unconscious bias." },
];

export default function InclusiveTeamBuildingFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><FaUsers /> Inclusive Team Building</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Comprehensive training and resources for companies to build diverse, inclusive, and high-performing teams.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleModules.map((m, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 220, color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaChalkboardTeacher style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{m.title}</div>
            <div style={{ color: '#ffe066', margin: '8px 0' }}>{m.desc}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>Start Training</button>
    </div>
  );
} 