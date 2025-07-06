"use client";
import React, { useState } from "react";
import { FaBrain, FaRobot, FaUserCog, FaLightbulb, FaRocket } from "react-icons/fa";
import "./quiz.css";

const QUIZZES = [
  {
    key: "neurodiversity",
    name: "Neurodiversity Basics",
    icon: <FaBrain />,
    description: "Test your knowledge of neurodiversity concepts and terminology.",
  },
  {
    key: "workplace",
    name: "Workplace Skills",
    icon: <FaUserCog />,
    description: "Assess your understanding of inclusive workplace practices.",
  },
  {
    key: "cognitive",
    name: "Cognitive Strengths",
    icon: <FaLightbulb />,
    description: "Explore your unique cognitive strengths and learning styles.",
  },
];

export default function QuizDashboard() {
  const [loadingAI, setLoadingAI] = useState(false);

  const handleStartQuiz = (quizKey) => {
    window.location.href = `/quiz?quiz=${quizKey}`;
  };
  const handleAIQuiz = async () => {
    setLoadingAI(true);
    // --- AI Quiz Generation Stub ---
    // Here you would call OpenAI or a free API to generate questions
    setTimeout(() => {
      setLoadingAI(false);
      window.location.href = "/quiz?quiz=ai";
    }, 1800);
  };

  return (
    <div className="quiz-area">
      <h1 className="quiz-title"><FaRocket /> Quiz & Assessment Dashboard</h1>
      <div className="quiz-dashboard-grid">
        {QUIZZES.map((quiz) => (
          <div className="quiz-card" key={quiz.key}>
            <div className="quiz-card-icon">{quiz.icon}</div>
            <div className="quiz-card-title">{quiz.name}</div>
            <div className="quiz-card-desc">{quiz.description}</div>
            <button className="quiz-btn" onClick={() => handleStartQuiz(quiz.key)}>Start Quiz</button>
          </div>
        ))}
        <div className="quiz-card ai-quiz">
          <div className="quiz-card-icon"><FaRobot /></div>
          <div className="quiz-card-title">AI-Generated Quiz</div>
          <div className="quiz-card-desc">Let our AI create a custom quiz just for you, based on your interests and profile.</div>
          <button className="quiz-btn" onClick={handleAIQuiz} disabled={loadingAI}>
            {loadingAI ? "Generating..." : "New AI Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
} 