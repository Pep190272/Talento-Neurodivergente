"use client";
import React, { useState, useEffect } from "react";
import { FaCircle, FaSquare, FaStar, FaHeart } from "react-icons/fa";

const SHAPES = [
  { name: "circle", icon: <FaCircle />, color: "#9333ea" },
  { name: "square", icon: <FaSquare />, color: "#ffd700" },
  { name: "star", icon: <FaStar />, color: "#3b82f6" },
  { name: "heart", icon: <FaHeart />, color: "#ec4899" },
];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ShapeSorter({ onGameOver, savedStats }) {
  const [shapes, setShapes] = useState([]);
  const [targets, setTargets] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [placed, setPlaced] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setShapes(shuffle(SHAPES));
    setTargets(shuffle(SHAPES));
    setPlaced({});
    setStartTime(Date.now());
    setCorrect(0);
    setIncorrect(0);
    setGameOver(false);
    if (savedStats && savedStats.shapes) {
      setShapes(savedStats.shapes);
      setTargets(savedStats.targets);
      setPlaced(savedStats.placed);
      setStartTime(savedStats.startTime);
      setCorrect(savedStats.correct);
      setIncorrect(savedStats.incorrect);
    }
    // eslint-disable-next-line
  }, []);

  const handleDragStart = (idx) => setDragged(idx);
  const handleDrop = (targetIdx) => {
    if (dragged === null || gameOver) return;
    const shape = shapes[dragged];
    const target = targets[targetIdx];
    if (shape.name === target.name) {
      setPlaced((p) => ({ ...p, [targetIdx]: dragged }));
      setCorrect((c) => c + 1);
      if (Object.keys(placed).length + 1 === shapes.length) {
        setGameOver(true);
        const totalTime = Date.now() - startTime;
        // --- AI Feedback Stub ---
        onGameOver &&
          onGameOver({
            score: 1000 - totalTime / 10 - incorrect * 30,
            accuracy: Math.round((correct + 1) / (correct + incorrect + 1) * 100),
            reactionTime: Math.round(totalTime / (correct + 1)),
            shapes,
            targets,
            placed: { ...placed, [targetIdx]: dragged },
            correct: correct + 1,
            incorrect,
            aiTips: "Look for shape outlines and colors to match quickly!",
          });
      }
    } else {
      setIncorrect((i) => i + 1);
    }
    setDragged(null);
  };

  return (
    <div className="shape-sorter-area">
      <h2 className="gameplay-title">Shape Sorter</h2>
      <div className="shape-drag-row">
        {shapes.map((shape, idx) => (
          <div
            key={shape.name}
            className="shape-draggable"
            draggable={!Object.values(placed).includes(idx) && !gameOver}
            onDragStart={() => handleDragStart(idx)}
            aria-label={shape.name}
            tabIndex={0}
            style={{ opacity: Object.values(placed).includes(idx) ? 0.3 : 1, color: shape.color, cursor: Object.values(placed).includes(idx) ? 'default' : 'grab' }}
          >
            {shape.icon}
          </div>
        ))}
      </div>
      <div className="shape-target-row">
        {targets.map((target, idx) => (
          <div
            key={target.name}
            className={`shape-target${placed[idx] !== undefined ? " filled" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            aria-label={`Target for ${target.name}`}
            tabIndex={0}
            style={{ color: target.color, borderColor: target.color, background: placed[idx] !== undefined ? '#18181b' : 'transparent' }}
          >
            {placed[idx] !== undefined ? shapes[placed[idx]].icon : "?"}
          </div>
        ))}
      </div>
      <div className="shape-sorter-stats">
        <span>Correct: {correct}</span>
        <span>Incorrect: {incorrect}</span>
      </div>
    </div>
  );
} 