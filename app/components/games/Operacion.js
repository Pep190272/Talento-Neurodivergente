"use client";
import React, { useState, useEffect } from "react";
import { FaHandPointer, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

const getTargets = (t) => [
  { key: "head", label: t('gamesContent.operacion.head'), cx: 50, cy: 30 },
  { key: "chest", label: t('gamesContent.operacion.chest'), cx: 50, cy: 60 },
  { key: "leftArm", label: t('gamesContent.operacion.leftArm'), cx: 20, cy: 60 },
  { key: "rightArm", label: t('gamesContent.operacion.rightArm'), cx: 80, cy: 60 },
  { key: "leftLeg", label: t('gamesContent.operacion.leftLeg'), cx: 35, cy: 100 },
  { key: "rightLeg", label: t('gamesContent.operacion.rightLeg'), cx: 65, cy: 100 },
];

function getRandomTarget(targets) {
  return targets[Math.floor(Math.random() * targets.length)];
}

export default function Operacion({ onGameOver, savedStats }) {
  const { t } = useLanguage();
  const TARGETS = getTargets(t);
  const [currentTarget, setCurrentTarget] = useState(getRandomTarget(TARGETS));
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'hit' or 'miss'

  useEffect(() => {
    setCurrentTarget(getRandomTarget(TARGETS));
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
          aiTips: t('gamesContent.operacion.aiTips'),
        });
        return;
      }
      setTimeout(() => {
        setCurrentTarget(getRandomTarget(TARGETS));
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
      <h2 className="gameplay-title">{t('gamesContent.operacion.title')}</h2>
      <div className="operacion-instructions">
        {t('gamesContent.operacion.tap')} <b>{currentTarget.label}</b>!
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
        <span>{t('gamesContent.operacion.hits')}: {hits}</span>
        <span>{t('gamesContent.operacion.misses')}: {misses}</span>
        {feedback === 'hit' && <FaCheckCircle className="hit-icon" aria-label="Correct!" />}
        {feedback === 'miss' && <FaTimesCircle className="miss-icon" aria-label="Incorrect!" />}
      </div>
    </div>
  );
} 