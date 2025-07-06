"use client";
import React, { useState, useEffect } from "react";
import { FaFont } from "react-icons/fa";

const WORDS = ["BRAIN", "NEURO", "FOCUS", "QUIZ", "GAMES", "LOGIC", "MEMORY", "SHAPE"];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WordBuilder({ onGameOver, savedStats }) {
  const [target, setTarget] = useState(WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [letters, setLetters] = useState([]);
  const [input, setInput] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Start new game or resume
    const t = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTarget(t);
    setLetters(shuffle(t.split("")));
    setInput([]);
    setStartTime(Date.now());
    setAttempts(0);
    setGameOver(false);
    if (savedStats && savedStats.target) {
      setTarget(savedStats.target);
      setLetters(savedStats.letters);
      setInput(savedStats.input);
      setStartTime(savedStats.startTime);
      setAttempts(savedStats.attempts);
    }
    // eslint-disable-next-line
  }, []);

  const handleLetterClick = (idx) => {
    if (gameOver) return;
    setInput((inp) => [...inp, letters[idx]]);
    setLetters((lets) => lets.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (input.length === target.length && !gameOver) {
      setAttempts((a) => a + 1);
      if (input.join("") === target) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver &&
          onGameOver({
            score: 1000 - totalTime / 10 - (attempts - 1) * 50,
            accuracy: 100,
            reactionTime: Math.round(totalTime / attempts),
            target,
            attempts,
            aiTips: "Look for common letter patterns and try again if you get stuck!",
          });
      } else {
        // Wrong, reset input and reshuffle
        setTimeout(() => {
          setLetters(shuffle(target.split("")));
          setInput([]);
        }, 900);
      }
    }
    // eslint-disable-next-line
  }, [input]);

  return (
    <div className="word-builder-area">
      <h2 className="gameplay-title">Word Builder</h2>
      <div className="word-target">
        <FaFont className="word-icon" />
        <span>Build this word:</span>
        <b>{target}</b>
      </div>
      <div className="word-letters">
        {letters.map((l, idx) => (
          <button
            key={idx}
            className="letter-btn"
            onClick={() => handleLetterClick(idx)}
            aria-label={`Pick letter ${l}`}
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="word-input">
        {input.map((l, idx) => (
          <span key={idx} className="input-letter">{l}</span>
        ))}
      </div>
      <div className="word-stats">
        <span>Attempts: {attempts}</span>
      </div>
    </div>
  );
} 