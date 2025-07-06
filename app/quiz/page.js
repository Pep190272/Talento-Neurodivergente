"use client";
import React, { useState, useEffect } from "react";
import QuizQuestion from "../components/quiz/QuizQuestion";
import DraggableList from "../components/Quiz/DraggableList";
import StatsDisplay from "../components/quiz/StatsDisplay";
import { FaBrain, FaCheck, FaListOl, FaRegClock, FaRobot, FaVolumeUp, FaRedo } from "react-icons/fa";
import "./quiz.css";
import QuizDashboard from "./dashboard";

// Local quiz sets
const QUIZ_SETS = {
  neurodiversity: [
    {
      id: 1,
      type: "mcq",
      question: "Which of these is a common neurodivergent trait?",
      options: ["Hyperfocus", "Telepathy", "Photosynthesis", "Levitation"],
      answer: 0,
      explanation: "Hyperfocus is a common trait in ADHD and autism."
    },
    {
      id: 2,
      type: "slider",
      question: "How comfortable are you with change?",
      min: 1,
      max: 10,
      answer: 7,
      explanation: "Many neurodivergent people prefer routine, but comfort with change varies."
    },
    {
      id: 3,
      type: "text",
      question: "Describe a strategy you use to stay organized:",
      answer: "",
      explanation: "Organization strategies are highly individual."
    },
    {
      id: 4,
      type: "draggable",
      question: "Rank these workplace accommodations from most to least important for neurodivergent employees:",
      options: [
        "Flexible work hours",
        "Quiet workspace",
        "Clear written instructions",
        "Regular breaks",
      ],
      answer: [0, 1, 2, 3],
      explanation: "All are important; ranking depends on individual needs."
    },
  ],
  workplace: [
    {
      id: 1,
      type: "mcq",
      question: "What is an example of an inclusive workplace practice?",
      options: ["Providing noise-cancelling headphones", "Ignoring accessibility", "Mandatory overtime", "No feedback"],
      answer: 0,
      explanation: "Providing accommodations is an inclusive practice."
    },
    {
      id: 2,
      type: "slider",
      question: "How supported do you feel at work?",
      min: 1,
      max: 10,
      answer: 8,
      explanation: "Support can be improved with open communication."
    },
    {
      id: 3,
      type: "text",
      question: "Describe a time you advocated for yourself or a colleague:",
      answer: "",
      explanation: "Self-advocacy is key to workplace inclusion."
    },
    {
      id: 4,
      type: "draggable",
      question: "Rank these inclusive practices:",
      options: [
        "Flexible scheduling",
        "Accessible meetings",
        "Clear communication",
        "Mentorship programs",
      ],
      answer: [0, 1, 2, 3],
      explanation: "All are valuable; order may vary by context."
    },
  ],
  cognitive: [
    {
      id: 1,
      type: "mcq",
      question: "Which is a cognitive strength?",
      options: ["Pattern recognition", "Invisibility", "Time travel", "None"],
      answer: 0,
      explanation: "Pattern recognition is a cognitive strength."
    },
    {
      id: 2,
      type: "slider",
      question: "How much do you enjoy solving puzzles?",
      min: 1,
      max: 10,
      answer: 9,
      explanation: "Enjoyment of puzzles can indicate strong problem-solving skills."
    },
    {
      id: 3,
      type: "text",
      question: "Describe a time you solved a difficult problem:",
      answer: "",
      explanation: "Problem-solving is a valuable cognitive skill."
    },
    {
      id: 4,
      type: "draggable",
      question: "Rank these cognitive skills:",
      options: [
        "Memory",
        "Attention to detail",
        "Creativity",
        "Logical reasoning",
      ],
      answer: [0, 1, 2, 3],
      explanation: "All are important; ranking depends on context."
    },
  ],
};

function getQueryParam(name) {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// AI Quiz fetcher (stub)
async function fetchAIQuiz() {
  // --- Replace with OpenAI or OpenTDB API call ---
  // For now, return a sample quiz
  return [
    {
      id: 1,
      type: "mcq",
      question: "Which brain region is most associated with memory?",
      options: ["Hippocampus", "Cerebellum", "Amygdala", "Thalamus"],
      answer: 0,
      explanation: "The hippocampus is crucial for memory formation."
    },
    {
      id: 2,
      type: "slider",
      question: "How confident are you in your problem-solving skills?",
      min: 1,
      max: 10,
      answer: 8,
      explanation: "Confidence can be built through practice."
    },
    {
      id: 3,
      type: "text",
      question: "Describe a creative solution you found recently:",
      answer: "",
      explanation: "Creativity is a key cognitive strength."
    },
    {
      id: 4,
      type: "draggable",
      question: "Rank these learning styles:",
      options: [
        "Visual",
        "Auditory",
        "Kinesthetic",
        "Reading/Writing",
      ],
      answer: [0, 1, 2, 3],
      explanation: "Everyone has a preferred learning style."
    },
  ];
}

function getInitialState(quizKey, quizSet) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`quiz-progress-${quizKey}`);
    if (saved) return JSON.parse(saved);
  }
  return {
    current: 0,
    answers: Array(quizSet.length).fill(null),
    startTime: Date.now(),
    stats: {},
    completed: false,
    aiTips: null,
    review: false,
    timer: 0,
  };
}

export default function QuizPage() {
  const [quizKey, setQuizKey] = useState(null);
  const [quizSet, setQuizSet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [voice, setVoice] = useState(null);

  // Load quiz set based on query param
  useEffect(() => {
    const key = getQueryParam("quiz") || "neurodiversity";
    setQuizKey(key);
    async function loadQuiz() {
      setLoading(true);
      let set = [];
      if (key === "ai") {
        set = await fetchAIQuiz();
      } else {
        set = QUIZ_SETS[key] || QUIZ_SETS["neurodiversity"];
      }
      setQuizSet(set);
      setState(getInitialState(key, set));
      setLoading(false);
    }
    loadQuiz();
    // eslint-disable-next-line
  }, []);

  // Timer
  useEffect(() => {
    if (!state || state.completed) return;
    const interval = setInterval(() => setTimer(Math.round((Date.now() - state.startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Save progress
  useEffect(() => {
    if (quizKey && state) localStorage.setItem(`quiz-progress-${quizKey}`, JSON.stringify(state));
  }, [state, quizKey]);

  // Voice feedback (Web Speech API)
  const speak = (text) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
      setVoice(utter);
    }
  };

  const handleAnswer = (idx, value, stats) => {
    const newAnswers = [...state.answers];
    newAnswers[idx] = value;
    setState((s) => ({
      ...s,
      answers: newAnswers,
      stats: { ...s.stats, [idx]: stats },
    }));
  };

  const handleNext = () => {
    setShowExplanation(false);
    setState((s) => ({ ...s, current: s.current + 1 }));
  };
  const handlePrev = () => {
    setShowExplanation(false);
    setState((s) => ({ ...s, current: s.current - 1 }));
  };
  const handleSubmit = () => {
    // --- AI Feedback Stub ---
    // Here you would call OpenAI or API with answers for feedback
    setState((s) => ({ ...s, completed: true, aiTips: "Great job! Review your answers and try again for a higher score." }));
    speak("Congratulations! You completed the quiz. Great job! Here are your results and some tips for improvement.");
  };
  const handleRestart = () => {
    if (quizKey) localStorage.removeItem(`quiz-progress-${quizKey}`);
    setState(getInitialState(quizKey, quizSet));
    setTimer(0);
    setShowExplanation(false);
  };
  const handleReview = () => setState((s) => ({ ...s, review: true }));
  const handleReplayVoice = () => {
    if (state && state.aiTips) speak(state.aiTips);
  };

  // --- NEW: Calculate stats for results if completed ---
  let stats = null;
  if (state && state.completed) {
    const totalQuestions = quizSet.length;
    const correct = state.answers.filter((a, i) => {
      const q = quizSet[i];
      if (!q) return false;
      if (q.type === 'mcq' || q.type === 'slider') return a === q.answer;
      if (q.type === 'draggable') return JSON.stringify(a) === JSON.stringify(q.answer);
      return false;
    }).length;
    const score = correct;
    const percentage = Math.round((score / totalQuestions) * 100);
    const time = Math.round((Date.now() - state.startTime) / 1000);
    stats = {
      score,
      total: totalQuestions,
      time,
      percentage,
      aiTips: state.aiTips || 'Great job! Review your answers and try again for a higher score.'
    };
  }

  // --- FIX: Speak results only when completed and stats available ---
  useEffect(() => {
    if (state && state.completed && stats && typeof window !== 'undefined' && window.speechSynthesis && stats.aiTips) {
      const utter = new window.SpeechSynthesisUtterance(`Quiz complete. Your score is ${stats.score} out of ${stats.total}. ${stats.aiTips}`);
      utter.rate = 1.05;
      utter.pitch = 1.1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    }
  }, [state && state.completed]);

  if (loading || !state) {
    return <div className="quiz-area"><div className="quiz-title"><FaRobot /> Loading Quiz...</div></div>;
  }

  // If no quiz is selected, show the dashboard
  if (!getQueryParam("quiz")) {
    return <QuizDashboard />;
  }

  // Add close button to quiz view
  const handleCloseQuiz = () => {
    window.location.href = '/quiz';
  };

  if (state && state.completed) {
    return (
      <div className="quiz-area" style={{ position: 'relative' }}>
        <button
          onClick={handleCloseQuiz}
          aria-label="Back to dashboard"
          style={{ position: 'absolute', top: 18, right: 24, fontSize: '2.2rem', color: '#fff', background: '#e53935', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101, boxShadow: '0 2px 8px rgba(229,57,53,0.2)' }}
        >
          ×
        </button>
        <StatsDisplay stats={stats} onRestart={handleRestart} />
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.speechSynthesis && stats.aiTips) {
              const utter = new window.SpeechSynthesisUtterance(`Quiz complete. Your score is ${stats.score} out of ${stats.total}. ${stats.aiTips}`);
              utter.rate = 1.05;
              utter.pitch = 1.1;
              utter.volume = 1;
              window.speechSynthesis.speak(utter);
            }
          }}
          className="quiz-btn"
          style={{ marginTop: 18 }}
        >
          <FaVolumeUp style={{ marginRight: 8 }} /> Replay Voice
        </button>
      </div>
    );
  }

  const q = quizSet[state.current];
  return (
    <div className="quiz-area" style={{ position: 'relative' }}>
      <button
        onClick={handleCloseQuiz}
        aria-label="Close quiz"
        style={{ position: 'absolute', top: 18, right: 24, fontSize: '2.2rem', color: '#fff', background: '#e53935', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101, boxShadow: '0 2px 8px rgba(229,57,53,0.2)' }}
      >
        ×
      </button>
      <h1 className="quiz-title"><FaBrain /> Quiz: {quizKey && quizKey !== 'ai' ? quizKey.charAt(0).toUpperCase() + quizKey.slice(1) : 'AI-Generated'}</h1>
      <div className="quiz-progress">
        <FaListOl /> Question {state.current + 1} / {quizSet.length}
        <FaRegClock /> {timer}s
      </div>
      <QuizQuestion
        key={q.id}
        idx={state.current}
        question={q}
        value={state.answers[state.current]}
        onAnswer={handleAnswer}
      />
      {showExplanation && q.explanation && (
        <div className="ai-tips" style={{ marginBottom: 12 }}><FaRobot className="ai-icon" /> {q.explanation}</div>
      )}
      <div className="quiz-nav">
        <button onClick={handlePrev} disabled={state.current === 0} className="quiz-btn">Back</button>
        <button onClick={() => setShowExplanation(true)} className="quiz-btn" style={{ minWidth: 120 }}>Show Explanation</button>
        {state.current < quizSet.length - 1 ? (
          <button onClick={handleNext} className="quiz-btn" disabled={state.answers[state.current] == null}>Next</button>
        ) : (
          <button onClick={handleSubmit} className="quiz-btn" disabled={state.answers[state.current] == null}>Submit</button>
        )}
      </div>
    </div>
  );
} 