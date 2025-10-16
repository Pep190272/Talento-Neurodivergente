"use client";
import React, { useState } from "react";
import { FaBrain, FaRobot, FaUserCog, FaLightbulb, FaRocket } from "react-icons/fa";
import "./quiz.css";
import { useLanguage } from '../hooks/useLanguage';

const getQuizzes = (t) => [
  {
    key: "neurodiversity",
    name: t('quizContent.dashboard.neurodiversity.name'),
    icon: <FaBrain />,
    description: t('quizContent.dashboard.neurodiversity.description'),
  },
  {
    key: "workplace",
    name: t('quizContent.dashboard.workplace.name'),
    icon: <FaUserCog />,
    description: t('quizContent.dashboard.workplace.description'),
  },
  {
    key: "cognitive",
    name: t('quizContent.dashboard.cognitive.name'),
    icon: <FaLightbulb />,
    description: t('quizContent.dashboard.cognitive.description'),
  },
];

export default function QuizDashboard() {
  const { t } = useLanguage();
  const QUIZZES = getQuizzes(t);
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
      <h1 className="quiz-title"><FaRocket /> {t('quizContent.dashboard.title')}</h1>
      <div className="quiz-dashboard-grid">
        {QUIZZES.map((quiz) => (
          <div className="quiz-card" key={quiz.key}>
            <div className="quiz-card-icon">{quiz.icon}</div>
            <div className="quiz-card-title">{quiz.name}</div>
            <div className="quiz-card-desc">{quiz.description}</div>
            <button className="quiz-btn" onClick={() => handleStartQuiz(quiz.key)}>{t('quizContent.dashboard.startQuiz')}</button>
          </div>
        ))}
        <div className="quiz-card ai-quiz">
          <div className="quiz-card-icon"><FaRobot /></div>
          <div className="quiz-card-title">{t('quizContent.dashboard.aiQuiz.name')}</div>
          <div className="quiz-card-desc">{t('quizContent.dashboard.aiQuiz.description')}</div>
          <button className="quiz-btn" onClick={handleAIQuiz} disabled={loadingAI}>
            {loadingAI ? t('quizContent.dashboard.aiQuiz.generating') : t('quizContent.dashboard.aiQuiz.button')}
          </button>
        </div>
      </div>
    </div>
  );
} 