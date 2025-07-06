"use client";
import React from "react";
import { IoAnalytics } from "react-icons/io5";
import { FaArrowLeft, FaChartBar } from "react-icons/fa";

const sampleAnalytics = [
  { label: "Productivity Increase", value: "+18%" },
  { label: "Retention Rate", value: "95%" },
  { label: "Diversity Index", value: "8.7/10" },
];

export default function PerformanceAnalyticsFeature() {
  return (
    <div className="feature-detail-area">
      <button className="quiz-btn" style={{ marginBottom: 24 }} onClick={() => window.location.href = '/features'}><FaArrowLeft /> Back to Features</button>
      <h1 className="quiz-title"><IoAnalytics /> Performance Analytics</h1>
      <p style={{ color: '#ffe066', marginBottom: 24, textAlign: 'center' }}>
        Data-driven insights into team performance, productivity gains, and diversity impact metrics.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {sampleAnalytics.map((a, i) => (
          <div key={i} style={{ background: '#18181b', borderRadius: 12, padding: 18, minWidth: 180, textAlign: 'center', color: '#ffd700', boxShadow: '0 2px 12px #9333ea22' }}>
            <FaChartBar style={{ fontSize: 28, color: '#9333ea', marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>{a.label}</div>
            <div style={{ fontSize: 24, color: '#ffe066' }}>{a.value}</div>
          </div>
        ))}
      </div>
      <button className="quiz-btn" style={{ marginTop: 12 }}>View Report</button>
    </div>
  );
} 