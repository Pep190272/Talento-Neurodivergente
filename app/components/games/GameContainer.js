"use client";
import React, { useState, useEffect } from "react";
import MemoryGrid from "./MemoryGrid";
import PatternMatrix from "./PatternMatrix";
import Operacion from "./Operacion";
import ReactionTime from "./ReactionTime";
import SimonSays from "./SimonSays";
import NumberSequence from "./NumberSequence";
import WordBuilder from "./WordBuilder";
import ShapeSorter from "./ShapeSorter";
import ColorMatch from "./ColorMatch";
import PathFinder from "./PathFinder";
import StatsDisplay from "./StatsDisplay";

const gameComponents = {
  memory: MemoryGrid,
  pattern: PatternMatrix,
  operacion: Operacion,
  reaction: ReactionTime,
  simon: SimonSays,
  numberseq: NumberSequence,
  wordbuilder: WordBuilder,
  shapesorter: ShapeSorter,
  colormatch: ColorMatch,
  pathfinder: PathFinder,
};

export default function GameContainer({ gameKey }) {
  const [gameStats, setGameStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`game-progress-${gameKey}`);
    if (saved) setGameStats(JSON.parse(saved));
  }, [gameKey]);

  // Save progress to localStorage
  useEffect(() => {
    if (gameStats) localStorage.setItem(`game-progress-${gameKey}`, JSON.stringify(gameStats));
  }, [gameStats, gameKey]);

  const handleGameOver = (stats) => {
    setGameStats(stats);
    setShowStats(true);
    // --- AI Feedback Stub ---
    // Here you would call OpenAI API with stats to get adaptive tips:
    // fetch('/api/ai-feedback', { method: 'POST', body: JSON.stringify({ gameKey, stats }) })
    //   .then(res => res.json()).then(data => setGameStats(s => ({ ...s, aiTips: data.tips })));
  };

  const GameComponent = gameComponents[gameKey];
  if (!GameComponent) return <div style={{ color: '#ffd700', padding: 32 }}>Game not found.</div>;

  return (
    <div className="gameplay-area">
      {!showStats ? (
        <GameComponent onGameOver={handleGameOver} savedStats={gameStats} />
      ) : (
        <StatsDisplay stats={gameStats} onRestart={() => setShowStats(false)} />
      )}
    </div>
  );
} 