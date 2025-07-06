"use client";
import React, { useState, useEffect } from "react";
import { FaSortNumericDown } from "react-icons/fa";

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
            aiTips: "Scan the grid and look for patterns to find numbers faster!",
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
      <h2 className="gameplay-title">Number Sequence</h2>
      <div className="number-sequence-grid" role="grid" aria-label="Number grid">
        {grid.map((num, idx) => (
          <button
            key={num}
            className={`number-cell${num < next ? " correct" : ""}`}
            onClick={() => handleNumberClick(num, idx)}
            aria-label={`Number ${num}`}
            tabIndex={0}
            style={{ cursor: num < next ? 'default' : 'pointer' }}
            disabled={num < next}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="number-sequence-stats">
        <span>Next: {next}</span>
        <span>Correct: {correct}</span>
        <span>Incorrect: {incorrect}</span>
      </div>
    </div>
  );
} 