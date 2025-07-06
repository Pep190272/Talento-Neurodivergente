"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaCircle } from "react-icons/fa";

const COLORS = [
  { name: "purple", color: "#9333ea" },
  { name: "gold", color: "#ffd700" },
  { name: "blue", color: "#3b82f6" },
  { name: "pink", color: "#ec4899" },
];

function getRandomColorIdx() {
  return Math.floor(Math.random() * COLORS.length);
}

export default function SimonSays({ onGameOver, savedStats }) {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [round, setRound] = useState(1);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [errors, setErrors] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showing, setShowing] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    // Start new game or resume
    if (savedStats && savedStats.sequence) {
      setSequence(savedStats.sequence);
      setUserInput(savedStats.userInput);
      setRound(savedStats.round);
      setErrors(savedStats.errors);
      setStartTime(savedStats.startTime);
      setGameOver(savedStats.gameOver);
    } else {
      startNewGame();
    }
    // eslint-disable-next-line
  }, []);

  const startNewGame = () => {
    setSequence([getRandomColorIdx()]);
    setUserInput([]);
    setRound(1);
    setErrors(0);
    setGameOver(false);
    setStartTime(Date.now());
    setActiveIdx(-1);
    setShowing(false);
  };

  const showSequence = () => {
    setShowing(true);
    let i = 0;
    function next() {
      setActiveIdx(sequence[i]);
      timeoutRef.current = setTimeout(() => {
        setActiveIdx(-1);
        if (i < sequence.length - 1) {
          i++;
          setTimeout(next, 350);
        } else {
          setShowing(false);
        }
      }, 600);
    }
    next();
  };

  useEffect(() => {
    if (!gameOver && sequence.length > 0) showSequence();
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line
  }, [sequence, gameOver]);

  const handleColorClick = (idx) => {
    if (showing || gameOver) return;
    const nextInput = [...userInput, idx];
    setUserInput(nextInput);
    if (sequence[nextInput.length - 1] !== idx) {
      setErrors((e) => e + 1);
      setGameOver(true);
      const totalTime = Date.now() - startTime;
      // --- AI Feedback Stub ---
      onGameOver &&
        onGameOver({
          score: round * 100 - errors * 50,
          accuracy: Math.round((round - errors) / round * 100),
          reactionTime: Math.round(totalTime / round),
          round,
          errors: errors + 1,
          aiTips: "Focus on the sequence and repeat it in your mind!",
        });
      return;
    }
    if (nextInput.length === sequence.length) {
      setTimeout(() => {
        setSequence((seq) => [...seq, getRandomColorIdx()]);
        setUserInput([]);
        setRound((r) => r + 1);
      }, 800);
    }
  };

  return (
    <div className="simon-says-area">
      <h2 className="gameplay-title">Simon Says</h2>
      <div className="simon-sequence">
        {COLORS.map((c, idx) => (
          <button
            key={c.name}
            className={`simon-btn${activeIdx === idx ? " active" : ""}`}
            style={{ background: c.color, opacity: activeIdx === idx ? 1 : 0.7, cursor: showing || gameOver ? 'default' : 'pointer' }}
            onClick={() => handleColorClick(idx)}
            aria-label={c.name}
            tabIndex={0}
            disabled={showing || gameOver}
          >
            <FaCircle className="simon-icon" />
          </button>
        ))}
      </div>
      <div className="simon-stats">
        <span>Round: {round}</span>
        <span>Errors: {errors}</span>
      </div>
    </div>
  );
} 