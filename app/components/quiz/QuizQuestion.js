"use client";
import React, { useState, useEffect } from "react";
import DraggableList from "./DraggableList";
import { FaCheckCircle } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

export default function QuizQuestion({ idx, question, value, onAnswer }) {
  const { t } = useLanguage();
  const [input, setInput] = useState(value ?? (question.type === "slider" ? question.min : question.type === "draggable" ? question.options : question.type === "mcq" ? null : ""));
  useEffect(() => { setInput(value ?? (question.type === "slider" ? question.min : question.type === "draggable" ? question.options : question.type === "mcq" ? null : "")); }, [value, question]);

  // For stats (e.g., time per question)
  const [start, setStart] = useState(Date.now());

  useEffect(() => { setStart(Date.now()); }, [idx]);

  // MCQ
  if (question.type === "mcq") {
    return (
      <div>
        <div className="quiz-q">{question.question}</div>
        <div className="mcq-options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`mcq-option${input === i ? " selected" : ""}`}
              onClick={() => { setInput(i); onAnswer(idx, i, { time: Date.now() - start }); }}
              aria-label={opt}
              tabIndex={0}
            >
              {input === i && <FaCheckCircle style={{ color: "#ffd700" }} />} {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }
  // Slider
  if (question.type === "slider") {
    return (
      <div className="slider-area">
        <div className="quiz-q">{question.question}</div>
        <input
          type="range"
          min={question.min}
          max={question.max}
          value={input}
          className="quiz-slider"
          onChange={e => { setInput(Number(e.target.value)); onAnswer(idx, Number(e.target.value), { time: Date.now() - start }); }}
          aria-valuenow={input}
          aria-valuemin={question.min}
          aria-valuemax={question.max}
        />
        <div className="slider-value">{input}</div>
      </div>
    );
  }
  // Text
  if (question.type === "text") {
    return (
      <div className="text-area">
        <div className="quiz-q">{question.question}</div>
        <textarea
          className="quiz-text-input"
          value={input}
          onChange={e => { setInput(e.target.value); onAnswer(idx, e.target.value, { time: Date.now() - start }); }}
          aria-label={t('quizContent.quiz.textAnswer')}
        />
      </div>
    );
  }
  // Draggable/reorderable
  if (question.type === "draggable") {
    return (
      <div>
        <div className="quiz-q">{question.question}</div>
        <DraggableList
          items={input}
          onChange={list => { setInput(list); onAnswer(idx, list, { time: Date.now() - start }); }}
        />
      </div>
    );
  }
  return null;
} 