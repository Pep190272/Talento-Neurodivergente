"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaBrain, FaStar } from "react-icons/fa";

const icons = [
  <FaBrain />, <FaStar />, <FaBrain />, <FaStar />,
  <FaBrain />, <FaStar />, <FaBrain />, <FaStar />
];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MemoryGrid({ onGameOver, savedStats }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const gridRef = useRef();

  useEffect(() => {
    // Start new game or resume
    let initialCards = shuffle([...icons, ...icons]);
    setCards(initialCards.map((icon, i) => ({ id: i, icon, matched: false })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStartTime(Date.now());
    setReactionTimes([]);
    setGameOver(false);
    if (savedStats && savedStats.cards) {
      setCards(savedStats.cards);
      setMatched(savedStats.matched);
      setMoves(savedStats.moves);
      setStartTime(savedStats.startTime);
      setReactionTimes(savedStats.reactionTimes);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameOver(true);
      const totalTime = Date.now() - startTime;
      const avgReaction = reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
      const accuracy = moves ? Math.round((matched.length / (moves * 2)) * 100) : 100;
      // --- AI Feedback Stub ---
      // Here you could call OpenAI API with stats for tips
      onGameOver && onGameOver({
        score: 1000 - moves * 10 - avgReaction,
        accuracy,
        reactionTime: avgReaction,
        moves,
        matched,
        cards,
        aiTips: "Try to remember card positions and use patterns!"
      });
    }
    // eslint-disable-next-line
  }, [matched]);

  const handleFlip = (idx) => {
    if (flipped.length === 2 || matched.includes(idx) || flipped.includes(idx)) return;
    setFlipped((prev) => [...prev, idx]);
    setReactionTimes((prev) => [...prev, Date.now() - (startTime || Date.now())]);
    if (flipped.length === 1) setMoves((m) => m + 1);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [i1, i2] = flipped;
      if (cards[i1].icon.type === cards[i2].icon.type) {
        setMatched((prev) => [...prev, i1, i2]);
      }
      setTimeout(() => setFlipped([]), 900);
    }
    // eslint-disable-next-line
  }, [flipped]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!gridRef.current) return;
      const focusable = Array.from(gridRef.current.querySelectorAll('.card-btn'));
      const idx = focusable.indexOf(document.activeElement);
      if (e.key === 'ArrowRight') focusable[(idx + 1) % focusable.length]?.focus();
      if (e.key === 'ArrowLeft') focusable[(idx - 1 + focusable.length) % focusable.length]?.focus();
      if (e.key === 'Enter' || e.key === ' ') focusable[idx]?.click();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="memory-grid-area">
      <h2 className="gameplay-title">Memory Grid</h2>
      <div className="memory-grid" ref={gridRef} role="grid" aria-label="Memory cards">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            className={`card-btn${flipped.includes(idx) || matched.includes(idx) ? ' flipped' : ''}`}
            onClick={() => handleFlip(idx)}
            disabled={flipped.length === 2 || matched.includes(idx)}
            aria-label={matched.includes(idx) ? "Matched card" : "Flip card"}
            tabIndex={0}
            style={{ cursor: matched.includes(idx) ? 'default' : 'pointer' }}
          >
            <span className="card-face">
              {(flipped.includes(idx) || matched.includes(idx)) ? card.icon : "?"}
            </span>
          </button>
        ))}
      </div>
      <div className="memory-stats">
        <span>Moves: {moves}</span>
        <span>Matched: {matched.length}/{cards.length}</span>
      </div>
    </div>
  );
} 