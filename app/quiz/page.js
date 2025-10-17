"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import QuizQuestion from "../components/quiz/QuizQuestion";

import StatsDisplay from "../components/quiz/StatsDisplay";
import { FaBrain, FaCheck, FaListOl, FaRegClock, FaRobot, FaVolumeUp, FaRedo } from "react-icons/fa";
import "./quiz.css";
import QuizDashboard from "./dashboard";
import { useLanguage } from '../hooks/useLanguage';

// Local quiz sets
const getQuizSets = (lang) => ({
  neurodiversity: [
    {
      id: 1,
      type: "mcq",
      question: lang === 'es' ? "¿Cuál de estos es un rasgo neurodivergente común?" : "Which of these is a common neurodivergent trait?",
      options: lang === 'es' ? ["Hiperfoco", "Telepatía", "Fotosíntesis", "Levitación"] : ["Hyperfocus", "Telepathy", "Photosynthesis", "Levitation"],
      answer: 0,
      explanation: lang === 'es' ? "El hiperfoco es un rasgo común en TDAH y autismo." : "Hyperfocus is a common trait in ADHD and autism."
    },
    {
      id: 2,
      type: "slider",
      question: lang === 'es' ? "¿Qué tan cómodo te sientes con los cambios?" : "How comfortable are you with change?",
      min: 1,
      max: 10,
      answer: 7,
      explanation: lang === 'es' ? "Muchas personas neurodivergentes prefieren la rutina, pero la comodidad con el cambio varía." : "Many neurodivergent people prefer routine, but comfort with change varies."
    },
    {
      id: 3,
      type: "text",
      question: lang === 'es' ? "Describe una estrategia que uses para mantenerte organizado:" : "Describe a strategy you use to stay organized:",
      answer: "",
      explanation: lang === 'es' ? "Las estrategias de organización son muy individuales." : "Organization strategies are highly individual."
    },
    {
      id: 4,
      type: "draggable",
      question: lang === 'es' ? "Ordena estas adaptaciones laborales de más a menos importantes para empleados neurodivergentes:" : "Rank these workplace accommodations from most to least important for neurodivergent employees:",
      options: lang === 'es' ? [
        "Horarios de trabajo flexibles",
        "Espacio de trabajo tranquilo",
        "Instrucciones escritas claras",
        "Descansos regulares",
      ] : [
        "Flexible work hours",
        "Quiet workspace",
        "Clear written instructions",
        "Regular breaks",
      ],
      answer: [0, 1, 2, 3],
      explanation: lang === 'es' ? "Todas son importantes; la clasificación depende de las necesidades individuales." : "All are important; ranking depends on individual needs."
    },
  ],
  workplace: [
    {
      id: 1,
      type: "mcq",
      question: lang === 'es' ? "¿Qué es un ejemplo de práctica laboral inclusiva?" : "What is an example of an inclusive workplace practice?",
      options: lang === 'es' ? ["Proporcionar auriculares con cancelación de ruido", "Ignorar la accesibilidad", "Horas extras obligatorias", "Sin retroalimentación"] : ["Providing noise-cancelling headphones", "Ignoring accessibility", "Mandatory overtime", "No feedback"],
      answer: 0,
      explanation: lang === 'es' ? "Proporcionar adaptaciones es una práctica inclusiva." : "Providing accommodations is an inclusive practice."
    },
    {
      id: 2,
      type: "slider",
      question: lang === 'es' ? "¿Qué tan apoyado te sientes en el trabajo?" : "How supported do you feel at work?",
      min: 1,
      max: 10,
      answer: 8,
      explanation: lang === 'es' ? "El apoyo puede mejorarse con una comunicación abierta." : "Support can be improved with open communication."
    },
    {
      id: 3,
      type: "text",
      question: lang === 'es' ? "Describe una vez que abogaste por ti mismo o por un colega:" : "Describe a time you advocated for yourself or a colleague:",
      answer: "",
      explanation: lang === 'es' ? "La autodefensa es clave para la inclusión laboral." : "Self-advocacy is key to workplace inclusion."
    },
    {
      id: 4,
      type: "draggable",
      question: lang === 'es' ? "Ordena estas prácticas inclusivas:" : "Rank these inclusive practices:",
      options: lang === 'es' ? [
        "Horarios flexibles",
        "Reuniones accesibles",
        "Comunicación clara",
        "Programas de mentoría",
      ] : [
        "Flexible scheduling",
        "Accessible meetings",
        "Clear communication",
        "Mentorship programs",
      ],
      answer: [0, 1, 2, 3],
      explanation: lang === 'es' ? "Todas son valiosas; el orden puede variar según el contexto." : "All are valuable; order may vary by context."
    },
  ],
  cognitive: [
    {
      id: 1,
      type: "mcq",
      question: lang === 'es' ? "¿Cuál es una fortaleza cognitiva?" : "Which is a cognitive strength?",
      options: lang === 'es' ? ["Reconocimiento de patrones", "Invisibilidad", "Viaje en el tiempo", "Ninguna"] : ["Pattern recognition", "Invisibility", "Time travel", "None"],
      answer: 0,
      explanation: lang === 'es' ? "El reconocimiento de patrones es una fortaleza cognitiva." : "Pattern recognition is a cognitive strength."
    },
    {
      id: 2,
      type: "slider",
      question: lang === 'es' ? "¿Cuánto disfrutas resolver acertijos?" : "How much do you enjoy solving puzzles?",
      min: 1,
      max: 10,
      answer: 9,
      explanation: lang === 'es' ? "El disfrute de los acertijos puede indicar fuertes habilidades de resolución de problemas." : "Enjoyment of puzzles can indicate strong problem-solving skills."
    },
    {
      id: 3,
      type: "text",
      question: lang === 'es' ? "Describe una ocasión en que resolviste un problema difícil:" : "Describe a time you solved a difficult problem:",
      answer: "",
      explanation: lang === 'es' ? "La resolución de problemas es una habilidad cognitiva valiosa." : "Problem-solving is a valuable cognitive skill."
    },
    {
      id: 4,
      type: "draggable",
      question: lang === 'es' ? "Ordena estas habilidades cognitivas:" : "Rank these cognitive skills:",
      options: lang === 'es' ? [
        "Memoria",
        "Atención al detalle",
        "Creatividad",
        "Razonamiento lógico",
      ] : [
        "Memory",
        "Attention to detail",
        "Creativity",
        "Logical reasoning",
      ],
      answer: [0, 1, 2, 3],
      explanation: lang === 'es' ? "Todas son importantes; la clasificación depende del contexto." : "All are important; ranking depends on context."
    },
  ],
});

// Removed getQueryParam - using useSearchParams hook instead

// AI Quiz fetcher (stub)
async function fetchAIQuiz(lang) {
  // --- Replace with OpenAI or OpenTDB API call ---
  // For now, return a sample quiz
  return [
    {
      id: 1,
      type: "mcq",
      question: lang === 'es' ? "¿Qué región del cerebro está más asociada con la memoria?" : "Which brain region is most associated with memory?",
      options: lang === 'es' ? ["Hipocampo", "Cerebelo", "Amígdala", "Tálamo"] : ["Hippocampus", "Cerebellum", "Amygdala", "Thalamus"],
      answer: 0,
      explanation: lang === 'es' ? "El hipocampo es crucial para la formación de la memoria." : "The hippocampus is crucial for memory formation."
    },
    {
      id: 2,
      type: "slider",
      question: lang === 'es' ? "¿Qué tan confiado te sientes en tus habilidades para resolver problemas?" : "How confident are you in your problem-solving skills?",
      min: 1,
      max: 10,
      answer: 8,
      explanation: lang === 'es' ? "La confianza se puede construir con la práctica." : "Confidence can be built through practice."
    },
    {
      id: 3,
      type: "text",
      question: lang === 'es' ? "Describe una solución creativa que hayas encontrado recientemente:" : "Describe a creative solution you found recently:",
      answer: "",
      explanation: lang === 'es' ? "La creatividad es una fortaleza cognitiva clave." : "Creativity is a key cognitive strength."
    },
    {
      id: 4,
      type: "draggable",
      question: lang === 'es' ? "Ordena estos estilos de aprendizaje:" : "Rank these learning styles:",
      options: lang === 'es' ? [
        "Visual",
        "Auditivo",
        "Kinestésico",
        "Lectura/Escritura",
      ] : [
        "Visual",
        "Auditory",
        "Kinesthetic",
        "Reading/Writing",
      ],
      answer: [0, 1, 2, 3],
      explanation: lang === 'es' ? "Cada persona tiene un estilo de aprendizaje preferido." : "Everyone has a preferred learning style."
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

function QuizPageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [quizKey, setQuizKey] = useState(null);
  const [quizSet, setQuizSet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [voice, setVoice] = useState(null);

  // Load quiz set based on query param
  useEffect(() => {
    const key = searchParams.get("quiz") || "neurodiversity";
    setQuizKey(key);
    async function loadQuiz() {
      setLoading(true);
      let set = [];
      console.log('🌍 Current language:', language);
      const QUIZ_SETS = getQuizSets(language || 'es');
      if (key === "ai") {
        set = await fetchAIQuiz(language || 'es');
      } else {
        set = QUIZ_SETS[key] || QUIZ_SETS["neurodiversity"];
      }
      console.log('📝 Quiz set loaded:', set[0]);
      setQuizSet(set);
      setState(getInitialState(key, set));
      setLoading(false);
    }
    loadQuiz();
    // eslint-disable-next-line
  }, [language]);

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
    const tips = language === 'es' ? "¡Excelente trabajo! Revisa tus respuestas e intenta nuevamente para obtener una puntuación más alta." : "Great job! Review your answers and try again for a higher score.";
    setState((s) => ({ ...s, completed: true, aiTips: tips }));
    speak(t('quizContent.quiz.results.congratulations'));
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
      aiTips: state.aiTips || (language === 'es' ? '¡Excelente trabajo! Revisa tus respuestas e intenta nuevamente para obtener una puntuación más alta.' : 'Great job! Review your answers and try again for a higher score.')
    };
  }

  // --- FIX: Speak results only when completed and stats available ---
  useEffect(() => {
    if (state && state.completed && stats && typeof window !== 'undefined' && window.speechSynthesis && stats.aiTips) {
      const scoreMsg = `${t('quizContent.quiz.results.yourScore')} ${stats.score} ${t('quizContent.quiz.results.outOf')} ${stats.total}. ${stats.aiTips}`;
      const utter = new window.SpeechSynthesisUtterance(scoreMsg);
      utter.rate = 1.05;
      utter.pitch = 1.1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    }
  }, [state && state.completed]);

  if (loading || !state) {
    return <div className="quiz-area"><div className="quiz-title"><FaRobot /> {t('quizContent.quiz.loading')}</div></div>;
  }

  // If no quiz is selected, show the dashboard
  if (!searchParams.get("quiz")) {
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
          aria-label={t('quizContent.quiz.backToDashboard')}
          style={{ position: 'absolute', top: 18, right: 24, fontSize: '2.2rem', color: '#fff', background: '#e53935', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101, boxShadow: '0 2px 8px rgba(229,57,53,0.2)' }}
        >
          ×
        </button>
        <StatsDisplay stats={stats} onRestart={handleRestart} />
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.speechSynthesis && stats.aiTips) {
              const scoreMsg = `${t('quizContent.quiz.results.yourScore')} ${stats.score} ${t('quizContent.quiz.results.outOf')} ${stats.total}. ${stats.aiTips}`;
              const utter = new window.SpeechSynthesisUtterance(scoreMsg);
              utter.rate = 1.05;
              utter.pitch = 1.1;
              utter.volume = 1;
              window.speechSynthesis.speak(utter);
            }
          }}
          className="quiz-btn"
          style={{ marginTop: 18 }}
        >
          <FaVolumeUp style={{ marginRight: 8 }} /> {t('quizContent.quiz.replayVoice')}
        </button>
      </div>
    );
  }

  const q = quizSet[state.current];
  return (
    <div className="quiz-area" style={{ position: 'relative' }}>
      <button
        onClick={handleCloseQuiz}
        aria-label={t('quizContent.quiz.closeQuiz')}
        style={{ position: 'absolute', top: 18, right: 24, fontSize: '2.2rem', color: '#fff', background: '#e53935', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101, boxShadow: '0 2px 8px rgba(229,57,53,0.2)' }}
      >
        ×
      </button>
      <h1 className="quiz-title"><FaBrain /> {t('quizContent.quiz.quizLabel')} {t(`quizContent.quiz.titles.${quizKey}`)}</h1>
      <div className="quiz-progress">
        <FaListOl /> {t('quizContent.quiz.question')} {state.current + 1} / {quizSet.length}
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
        <button onClick={handlePrev} disabled={state.current === 0} className="quiz-btn">{t('quizContent.quiz.back')}</button>
        <button onClick={() => setShowExplanation(true)} className="quiz-btn" style={{ minWidth: 120 }}>{t('quizContent.quiz.showExplanation')}</button>
        {state.current < quizSet.length - 1 ? (
          <button onClick={handleNext} className="quiz-btn" disabled={state.answers[state.current] == null}>{t('quizContent.quiz.next')}</button>
        ) : (
          <button onClick={handleSubmit} className="quiz-btn" disabled={state.answers[state.current] == null}>{t('quizContent.quiz.submit')}</button>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="quiz-area"><div className="quiz-title"><FaRobot /> Cargando...</div></div>}>
      <QuizPageContent />
    </Suspense>
  );
} 