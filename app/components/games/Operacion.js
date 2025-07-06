"use client";
import React, { useState, useEffect } from "react";
import { FaHandPointer, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TARGETS = [
  { key: "head", label: "Head", cx: 50, cy: 30 },
  { key: "chest", label: "Chest", cx: 50, cy: 60 },
  { key: "leftArm", label: "Left Arm", cx: 20, cy: 60 },
  { key: "rightArm", label: "Right Arm", cx: 80, cy: 60 },
  { key: "leftLeg", label: "Left Leg", cx: 35, cy: 100 },
  { key: "rightLeg", label: "Right Leg", cx: 65, cy: 100 },
];

function getRandomTarget() {
  return TARGETS[Math.floor(Math.random() * TARGETS.length)];
}

export default function Operacion({ onGameOver, savedStats }) {
  const [currentTarget, setCurrentTarget] = useState(getRandomTarget());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'hit' or 'miss'

  useEffect(() => {
    setCurrentTarget(getRandomTarget());
    setHits(0);
    setMisses(0);
    setStartTime(Date.now());
    setGameOver(false);
    setFeedback(null);
    if (savedStats && savedStats.hits !== undefined) {
      setHits(savedStats.hits);
      setMisses(savedStats.misses);
      setStartTime(savedStats.startTime);
    }
    // eslint-disable-next-line
  }, []);

  const handleZoneClick = (key) => {
    if (gameOver) return;
    if (key === currentTarget.key) {
      setHits((h) => h + 1);
      setFeedback('hit');
      if (hits + 1 >= 5) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver && onGameOver({
          score: 1000 - totalTime / 10 - misses * 30,
          accuracy: Math.round((hits + 1) / (hits + misses + 1) * 100),
          reactionTime: Math.round(totalTime / (hits + 1)),
          hits: hits + 1,
          misses,
          aiTips: "Focus on the highlighted area and react quickly!",
        });
        return;
      }
      setTimeout(() => {
        setCurrentTarget(getRandomTarget());
        setFeedback(null);
      }, 600);
    } else {
      setMisses((m) => m + 1);
      setFeedback('miss');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  return (
    <div className="operacion-area">
      <h2 className="gameplay-title">Operación 2.0</h2>
      <div className="operacion-instructions">
        Tap the <b>{currentTarget.label}</b>!
      </div>
      <svg
        className="operacion-svg"
        viewBox="0 0 100 130"
        width="220"
        height="300"
        aria-label="Human body diagram"
      >
        {/* Body outline */}
        <ellipse cx="50" cy="60" rx="30" ry="50" fill="#18181b" stroke="#ffd700" strokeWidth="2" />
        {/* Head */}
        <circle cx="50" cy="30" r="15" fill="#18181b" stroke="#9333ea" strokeWidth="2" />
        {/* Arms */}
        <rect x="10" y="60" width="20" height="10" fill="#18181b" stroke="#ffd700" strokeWidth="2" />
        <rect x="70" y="60" width="20" height="10" fill="#18181b" stroke="#ffd700" strokeWidth="2" />
        {/* Legs */}
        <rect x="35" y="110" width="10" height="20" fill="#18181b" stroke="#9333ea" strokeWidth="2" />
        <rect x="55" y="110" width="10" height="20" fill="#18181b" stroke="#9333ea" strokeWidth="2" />
        {/* Target zones */}
        {TARGETS.map((zone) => (
          <circle
            key={zone.key}
            cx={zone.cx}
            cy={zone.cy}
            r={7}
            fill={
              currentTarget.key === zone.key
                ? feedback === 'hit'
                  ? '#4ade80' // green
                  : feedback === 'miss'
                  ? '#ef4444' // red
                  : '#ffd700'
                : '#222'
            }
            stroke="#fff"
            strokeWidth={currentTarget.key === zone.key ? 3 : 1}
            style={{ cursor: 'pointer', transition: 'fill 0.2s, stroke 0.2s' }}
            onClick={() => handleZoneClick(zone.key)}
            aria-label={zone.label}
            tabIndex={0}
          />
        ))}
      </svg>
      <div className="operacion-stats">
        <span>Hits: {hits}</span>
        <span>Misses: {misses}</span>
        {feedback === 'hit' && <FaCheckCircle className="hit-icon" aria-label="Correct!" />}
        {feedback === 'miss' && <FaTimesCircle className="miss-icon" aria-label="Incorrect!" />}
      </div>
    </div>
  );
} 