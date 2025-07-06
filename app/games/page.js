'use client'
'use client'
import React, { useState } from 'react';
import GameContainer from '../components/games/GameContainer';

import { FaBrain, FaPuzzlePiece, FaRegClock, FaShapes, FaPalette, FaRoute, FaSortNumericDown, FaFont, FaGripHorizontal, FaHandPointer } from 'react-icons/fa';
import './games.css';

const gamesList = [
  { key: 'memory', name: 'Memory Grid', icon: <FaBrain /> },
  { key: 'pattern', name: 'Pattern Matrix', icon: <FaPuzzlePiece /> },
  { key: 'operacion', name: 'Operación 2.0', icon: <FaHandPointer /> },
  { key: 'reaction', name: 'Reaction Time', icon: <FaRegClock /> },
  { key: 'simon', name: 'Simon Says', icon: <FaGripHorizontal /> },
  { key: 'numberseq', name: 'Number Sequence', icon: <FaSortNumericDown /> },
  { key: 'wordbuilder', name: 'Word Builder', icon: <FaFont /> },
  { key: 'shapesorter', name: 'Shape Sorter', icon: <FaShapes /> },
  { key: 'colormatch', name: 'Color Match', icon: <FaPalette /> },
  { key: 'pathfinder', name: 'Path Finder', icon: <FaRoute /> },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="games-hero-bg">
      <div className="games-container">
        <h1 className="games-title">Brain Games Suite</h1>
        <p className="games-subtitle">Sharpen your mind with 10 interactive, adaptive games. Progress and stats are saved automatically!</p>
        <div className="games-grid" role="list">
          {gamesList.map((game) => (
            <button
              key={game.key}
              className="game-card"
              onClick={() => setActiveGame(game.key)}
              aria-label={`Play ${game.name}`}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{game.name}</span>
            </button>
          ))}
        </div>
        {activeGame && (
          <div className="game-modal" role="dialog" aria-modal="true" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(10,10,10,0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ position: 'relative', background: 'rgba(20,20,20,0.98)', borderRadius: 18, boxShadow: '0 2px 32px #9333ea33', padding: 32, minWidth: 340, maxWidth: 600, width: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
              <button
                className="close-modal"
                style={{ position: 'absolute', top: 16, right: 16, fontSize: '2.2rem', color: '#fff', background: '#e53935', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101, boxShadow: '0 2px 8px rgba(229,57,53,0.2)' }}
                onClick={() => setActiveGame(null)}
                aria-label="Close game"
                tabIndex={0}
              >
                ×
              </button>
              <GameContainer gameKey={activeGame} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 