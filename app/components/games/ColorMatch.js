"use client";
import React, { useState, useEffect } from "react";
import { FaPalette } from "react-icons/fa";

const COLORS = [
  { name: "Purple", color: "#9333ea" },
  { name: "Gold", color: "#ffd700" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Pink", color: "#ec4899" },
];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ColorMatch({ onGameOver, savedStats }) {
  const [colorName, setColorName] = useState(COLORS[0].name);
  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Start new game or resume
    setColorName(COLORS[Math.floor(Math.random() * COLORS.length)].name);
    setOptions(shuffle(COLORS));
    setCorrect(0);
    setIncorrect(0);
    setStartTime(Date.now());
    setGameOver(false);
    if (savedStats && savedStats.colorName) {
      setColorName(savedStats.colorName);
      setOptions(savedStats.options);
      setCorrect(savedStats.correct);
      setIncorrect(savedStats.incorrect);
      setStartTime(savedStats.startTime);
    }
    // eslint-disable-next-line
  }, []);

  const handleColorClick = (color) => {
    if (gameOver) return;
    if (color.name === colorName) {
      setCorrect((c) => c + 1);
      if (correct + 1 >= 5) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver &&
          onGameOver({
            score: 1000 - totalTime / 10 - incorrect * 30,
            accuracy: Math.round((correct + 1) / (correct + incorrect + 1) * 100),
            reactionTime: Math.round(totalTime / (correct + 1)),
            correct: correct + 1,
            incorrect,
            aiTips: "Read the color name carefully and match to the button color!",
          });
      } else {
        setColorName(COLORS[Math.floor(Math.random() * COLORS.length)].name);
        setOptions(shuffle(COLORS));
      }
    } else {
      setIncorrect((i) => i + 1);
    }
  };

  return (
    <div className="color-match-area">
      <h2 className="gameplay-title">Color Match</h2>
      <div className="color-match-question">
        <FaPalette className="color-match-icon" />
        <span>Match this color:</span>
        <b>{colorName}</b>
      </div>
      <div className="color-match-options">
        {options.map((color, idx) => (
          <button
            key={color.name}
            className="color-btn"
            style={{ background: color.color, color: '#18181b', cursor: 'pointer' }}
            onClick={() => handleColorClick(color)}
            aria-label={color.name}
            tabIndex={0}
          >
            {color.name}
          </button>
        ))}
      </div>
      <div className="color-match-stats">
        <span>Correct: {correct}</span>
        <span>Incorrect: {incorrect}</span>
      </div>
    </div>
  );
} 