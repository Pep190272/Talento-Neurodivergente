"use client";
import React, { useState, useEffect } from "react";
import { FaSortNumericDown } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const NUMBERS = Array.from({ length: 16 }, (_, i) => i + 1);

export default function NumberSequence({ onGameOver, savedStats }) {
  const { t } = useLanguage();
  const [grid, setGrid] = useState([]);
  const [next, setNext] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Start new game or resume
    setGrid(shuffle(NUMBERS));
    setNext(1);
    setStartTime(Date.now());
    setCorrect(0);
    setIncorrect(0);
    setGameOver(false);
    if (savedStats && savedStats.grid) {
      setGrid(savedStats.grid);
      setNext(savedStats.next);
      setStartTime(savedStats.startTime);
      setCorrect(savedStats.correct);
      setIncorrect(savedStats.incorrect);
    }
    // eslint-disable-next-line
  }, []);

  const handleNumberClick = (num, idx) => {
    if (gameOver) return;
    if (num === next) {
      setCorrect((c) => c + 1);
      if (next === 16) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver &&
          onGameOver({
            score: 1000 - totalTime / 10 - incorrect * 20,
            accuracy: Math.round((correct + 1) / (correct + incorrect + 1) * 100),
            reactionTime: Math.round(totalTime / (correct + 1)),
            grid,
            correct: correct + 1,
            incorrect,
            aiTips: t('gamesContent.numberSequence.aiTips'),
          });
      } else {
        setNext((n) => n + 1);
      }
    } else {
      setIncorrect((i) => i + 1);
    }
  };

  return (
    <div className="number-sequence-area">
      <h2 className="gameplay-title">{t('gamesContent.numberSequence.title')}</h2>
      <div className="number-sequence-grid" role="grid" aria-label="Number grid">
        {grid.map((num, idx) => (
          <button
            key={num}
            className={`number-cell${num < next ? " correct" : ""}`}
            onClick={() => handleNumberClick(num, idx)}
            aria-label={`${t('gamesContent.numberSequence.number')} ${num}`}
            tabIndex={0}
            style={{ cursor: num < next ? 'default' : 'pointer' }}
            disabled={num < next}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="number-sequence-stats">
        <span>{t('gamesContent.numberSequence.next')}: {next}</span>
        <span>{t('gamesContent.numberSequence.correct')}: {correct}</span>
        <span>{t('gamesContent.numberSequence.incorrect')}: {incorrect}</span>
      </div>
    </div>
  );
} 