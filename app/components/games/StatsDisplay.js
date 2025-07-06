"use client";
import React from "react";
import { FaStar, FaBullseye, FaRegClock, FaRobot } from "react-icons/fa";

export default function StatsDisplay({ stats, onRestart }) {
  return (
    <div className="stats-modal">
      <h2 className="stats-title">Game Over</h2>
      <div className="stats-list">
        <div className="stat-item"><FaStar className="stat-icon" /> <span>Score:</span> <b>{stats?.score ?? 0}</b></div>
        <div className="stat-item"><FaBullseye className="stat-icon" /> <span>Accuracy:</span> <b>{stats?.accuracy ?? "-"}%</b></div>
        <div className="stat-item"><FaRegClock className="stat-icon" /> <span>Avg. Reaction:</span> <b>{stats?.reactionTime ?? "-"}ms</b></div>
      </div>
      {stats?.aiTips && (
        <div className="ai-tips"><FaRobot className="ai-icon" /> <span>{stats.aiTips}</span></div>
      )}
      <button className="btn-primary" onClick={onRestart} aria-label="Restart game">Play Again</button>
    </div>
  );
} 