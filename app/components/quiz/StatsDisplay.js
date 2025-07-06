"use client";
import React from "react";
import { FaStar, FaListOl, FaRegClock, FaRobot } from "react-icons/fa";

export default function StatsDisplay({ stats, onRestart }) {
  return (
    <div className="stats-modal">
      <h2 className="stats-title">Quiz Results</h2>
      <div className="stats-list">
        <div className="stat-item"><FaStar className="stat-icon" /> <span>Score:</span> <b>{stats?.score ?? 0} / {stats?.total ?? 0}</b></div>
        <div className="stat-item"><FaListOl className="stat-icon" /> <span>Questions:</span> <b>{stats?.total ?? 0}</b></div>
        <div className="stat-item"><FaRegClock className="stat-icon" /> <span>Time:</span> <b>{stats?.time ?? "-"}s</b></div>
      </div>
      {stats?.aiTips && (
        <div className="ai-tips"><FaRobot className="ai-icon" /> <span>{stats.aiTips}</span></div>
      )}
      <button className="quiz-btn" onClick={onRestart} aria-label="Restart quiz">Restart Quiz</button>
    </div>
  );
} 