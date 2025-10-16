'use client'
import React, { useState, useEffect } from 'react';
import { FaPuzzlePiece } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

const GRID_SIZE = 4;
const PATTERNS = [
  // Each pattern: array of cell indices (0-15) that should be filled
  [0, 1, 4, 5],
  [2, 3, 6, 7],
  [8, 9, 12, 13],
  [5, 6, 9, 10],
  [0, 3, 12, 15],
  [1, 2, 13, 14],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

function getRandomPattern() {
  return PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
}

export default function PatternMatrix({ onGameOver, savedStats }) {
  const { t } = useLanguage();
  const [pattern, setPattern] = useState([]);
  const [userGrid, setUserGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [startTime, setStartTime] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Start new game or resume
    const p = getRandomPattern();
    setPattern(p);
    setUserGrid(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setStartTime(Date.now());
    setCorrect(0);
    setIncorrect(0);
    setGameOver(false);
    if (savedStats && savedStats.pattern) {
      setPattern(savedStats.pattern);
      setUserGrid(savedStats.userGrid);
      setStartTime(savedStats.startTime);
      setCorrect(savedStats.correct);
      setIncorrect(savedStats.incorrect);
    }
    // eslint-disable-next-line
  }, []);

  const handleCellClick = (idx) => {
    if (gameOver) return;
    if (userGrid[idx]) return;
    const newGrid = [...userGrid];
    newGrid[idx] = true;
    setUserGrid(newGrid);
    if (pattern.includes(idx)) {
      setCorrect((c) => c + 1);
      // Check for win
      if (pattern.every((i) => newGrid[i])) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver && onGameOver({
          score: 1000 - totalTime / 10 - incorrect * 20,
          accuracy: Math.round((correct + 1) / (correct + incorrect + 1) * 100),
          reactionTime: Math.round(totalTime / (correct + 1)),
          pattern,
          userGrid: newGrid,
          correct: correct + 1,
          incorrect,
          aiTips: t('gamesContent.patternMatrix.aiTips'),
        });
      }
    } else {
      setIncorrect((i) => i + 1);
    }
  };

  return (
    <div className="pattern-matrix-area">
      <h2 className="gameplay-title">{t('gamesContent.patternMatrix.title')}</h2>
      <div className="pattern-matrix-grid" role="grid" aria-label="Pattern matrix">
        {userGrid.map((filled, idx) => (
          <button
            key={idx}
            className={`pattern-cell${filled ? (pattern.includes(idx) ? " correct" : " incorrect") : ""}`}
            onClick={() => handleCellClick(idx)}
            aria-label={filled ? (pattern.includes(idx) ? t('gamesContent.patternMatrix.correctCell') : t('gamesContent.patternMatrix.incorrectCell')) : t('gamesContent.patternMatrix.fillCell')}
            tabIndex={0}
            style={{ cursor: filled ? 'default' : 'pointer' }}
          >
            {filled && pattern.includes(idx) && <FaPuzzlePiece className="cell-icon" />}
            {filled && !pattern.includes(idx) && <span className="cell-x">×</span>}
          </button>
        ))}
      </div>
      <div className="pattern-matrix-stats">
        <span>{t('gamesContent.patternMatrix.correct')}: {correct}</span>
        <span>{t('gamesContent.patternMatrix.incorrect')}: {incorrect}</span>
      </div>
    </div>
  );
} 