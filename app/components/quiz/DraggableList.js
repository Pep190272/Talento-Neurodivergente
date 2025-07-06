"use client";
import React, { useRef, useState } from "react";
import { FaGripLines } from "react-icons/fa";

export default function DraggableList({ items, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const listRef = useRef();

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (idx) => setDragOverIdx(idx);
  const handleDrop = () => {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newList = [...items];
    const [removed] = newList.splice(dragIdx, 1);
    newList.splice(dragOverIdx, 0, removed);
    setDragIdx(null);
    setDragOverIdx(null);
    onChange(newList);
  };
  // Keyboard support: move up/down
  const handleKeyDown = (e, idx) => {
    if (e.key === "ArrowUp" && idx > 0) {
      const newList = [...items];
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
      onChange(newList);
    }
    if (e.key === "ArrowDown" && idx < items.length - 1) {
      const newList = [...items];
      [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
      onChange(newList);
    }
  };
  return (
    <div className="draggable-list" ref={listRef} role="list">
      {items.map((item, idx) => (
        <div
          key={item}
          className={`draggable-item${dragIdx === idx ? " dragging" : ""}`}
          draggable
          tabIndex={0}
          aria-label={`Reorder item: ${item}`}
          style={{ cursor: "pointer" }}
          onDragStart={() => handleDragStart(idx)}
          onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
          onDrop={handleDrop}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          onKeyDown={e => handleKeyDown(e, idx)}
        >
          <FaGripLines style={{ marginRight: 8, color: "#ffd700" }} />
          {item}
        </div>
      ))}
    </div>
  );
} 