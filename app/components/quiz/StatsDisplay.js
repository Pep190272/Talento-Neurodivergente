"use client";
import React from "react";
import { FaStar, FaListOl, FaRegClock, FaRobot } from "react-icons/fa";
import { useLanguage } from '../../hooks/useLanguage';

export default function StatsDisplay({ stats, onRestart }) {
  const { t } = useLanguage();
  return (
    <div className="stats-modal">
      <h2 className="stats-title">{t('quizContent.quiz.results.title')}</h2>
      <div className="stats-list">
        <div className="stat-item"><FaStar className="stat-icon" /> <span>{t('quizContent.quiz.results.score')}</span> <b>{stats?.score ?? 0} / {stats?.total ?? 0}</b></div>
        <div className="stat-item"><FaListOl className="stat-icon" /> <span>{t('quizContent.quiz.results.questions')}</span> <b>{stats?.total ?? 0}</b></div>
        <div className="stat-item"><FaRegClock className="stat-icon" /> <span>{t('quizContent.quiz.results.time')}</span> <b>{stats?.time ?? "-"}s</b></div>
      </div>
      {stats?.aiTips && (
        <div className="ai-tips"><FaRobot className="ai-icon" /> <span>{stats.aiTips}</span></div>
      )}
      <button className="quiz-btn" onClick={onRestart} aria-label={t('quizContent.quiz.results.restart')}>{t('quizContent.quiz.results.restart')}</button>
    </div>
  );
} 