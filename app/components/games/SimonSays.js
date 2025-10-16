"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaCircle } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

const getColors = (t) => [
  { name: t('gamesContent.simonSays.purple'), color: "#9333ea" },
  { name: t('gamesContent.simonSays.gold'), color: "#ffd700" },
  { name: t('gamesContent.simonSays.blue'), color: "#3b82f6" },
  { name: t('gamesContent.simonSays.pink'), color: "#ec4899" },
];

function getRandomColorIdx(colorsLength) {
  return Math.floor(Math.random() * colorsLength);
}

export default function SimonSays({ onGameOver, savedStats }) {
  const { t } = useLanguage();
  const COLORS = getColors(t);
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
    setSequence([getRandomColorIdx(COLORS.length)]);
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
          aiTips: t('gamesContent.simonSays.aiTips'),
        });
      return;
    }
    if (nextInput.length === sequence.length) {
      setTimeout(() => {
        setSequence((seq) => [...seq, getRandomColorIdx(COLORS.length)]);
        setUserInput([]);
        setRound((r) => r + 1);
      }, 800);
    }
  };

  return (
    <div className="simon-says-area">
      <h2 className="gameplay-title">{t('gamesContent.simonSays.title')}</h2>
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
        <span>{t('gamesContent.simonSays.round')}: {round}</span>
        <span>{t('gamesContent.simonSays.errors')}: {errors}</span>
      </div>
    </div>
  );
} 