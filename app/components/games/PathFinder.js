"use client";
import React, { useState, useEffect } from "react";
import { FaRoute, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaFlagCheckered } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

const SIZE = 5;
const START = { x: 0, y: 0 };
const END = { x: SIZE - 1, y: SIZE - 1 };

function isSame(a, b) {
  return a.x === b.x && a.y === b.y;
}

export default function PathFinder({ onGameOver, savedStats }) {
  const { t } = useLanguage();
  const [pos, setPos] = useState(START);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setPos(START);
    setMoves(0);
    setStartTime(Date.now());
    setGameOver(false);
    if (savedStats && savedStats.pos) {
      setPos(savedStats.pos);
      setMoves(savedStats.moves);
      setStartTime(savedStats.startTime);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isSame(pos, END) && !gameOver) {
      setGameOver(true);
      const totalTime = Date.now() - startTime;
      // --- AI Feedback Stub ---
      onGameOver &&
        onGameOver({
          score: 1000 - totalTime / 10 - moves * 10,
          accuracy: 100,
          reactionTime: Math.round(totalTime / (moves || 1)),
          moves,
          aiTips: t('gamesContent.pathFinder.aiTips'),
        });
    }
    // eslint-disable-next-line
  }, [pos]);

  const move = (dx, dy) => {
    if (gameOver) return;
    setPos((p) => {
      const nx = Math.max(0, Math.min(SIZE - 1, p.x + dx));
      const ny = Math.max(0, Math.min(SIZE - 1, p.y + dy));
      if (nx !== p.x || ny !== p.y) setMoves((m) => m + 1);
      return { x: nx, y: ny };
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [gameOver]);

  return (
    <div className="path-finder-area">
      <h2 className="gameplay-title">{t('gamesContent.pathFinder.title')}</h2>
      <div className="path-finder-grid" role="grid" aria-label="Path grid">
        {[...Array(SIZE)].map((_, y) => (
          <div className="path-row" key={y}>
            {[...Array(SIZE)].map((_, x) => (
              <div
                key={x}
                className={`path-cell${isSame(pos, { x, y }) ? " current" : ""}${isSame(END, { x, y }) ? " end" : ""}`}
                aria-label={isSame(pos, { x, y }) ? t('gamesContent.pathFinder.currentPosition') : isSame(END, { x, y }) ? t('gamesContent.pathFinder.finish') : t('gamesContent.pathFinder.cell')}
              >
                {isSame(pos, { x, y }) && <FaRoute className="path-icon" />}
                {isSame(END, { x, y }) && <FaFlagCheckered className="end-icon" />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="path-controls">
        <button onClick={() => move(0, -1)} aria-label={t('gamesContent.pathFinder.up')} className="path-btn"><FaArrowUp /></button>
        <div>
          <button onClick={() => move(-1, 0)} aria-label={t('gamesContent.pathFinder.left')} className="path-btn"><FaArrowLeft /></button>
          <button onClick={() => move(1, 0)} aria-label={t('gamesContent.pathFinder.right')} className="path-btn"><FaArrowRight /></button>
        </div>
        <button onClick={() => move(0, 1)} aria-label={t('gamesContent.pathFinder.down')} className="path-btn"><FaArrowDown /></button>
      </div>
      <div className="path-finder-stats">
        <span>{t('gamesContent.pathFinder.moves')}: {moves}</span>
      </div>
    </div>
  );
} 