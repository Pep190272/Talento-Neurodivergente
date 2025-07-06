'use client'
import React, { useState, useEffect } from 'react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'multiple-choice',
    question: 'What is the most common form of neurodivergence?',
    options: ['ADHD', 'Autism', 'Dyslexia', 'Dyspraxia'],
    correctAnswer: 0,
    explanation: 'ADHD (Attention Deficit Hyperactivity Disorder) is the most common neurodivergent condition, affecting approximately 5-10% of children and 2-5% of adults worldwide.',
    category: 'General Knowledge',
    difficulty: 'Easy'
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'Which of the following is NOT a common strength associated with autism?',
    options: ['Pattern recognition', 'Attention to detail', 'Hyperfocus', 'Impulsivity'],
    correctAnswer: 3,
    explanation: 'Impulsivity is typically associated with ADHD, not autism. Autistic individuals often excel at pattern recognition, attention to detail, and can demonstrate intense focus on specific interests.',
    category: 'Autism',
    difficulty: 'Medium'
  },
  {
    id: 3,
    type: 'slider',
    question: 'Rate how much you agree: "Neurodivergent individuals often have unique perspectives that can benefit workplaces."',
    min: 1,
    max: 5,
    labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    correctAnswer: 4,
    explanation: 'Research shows that neurodivergent individuals often bring unique perspectives, problem-solving approaches, and innovative thinking to workplaces, making them valuable team members.',
    category: 'Workplace',
    difficulty: 'Easy'
  },
  {
    id: 4,
    type: 'multiple-choice',
    question: 'What is "masking" in the context of neurodivergence?',
    options: [
      'Wearing a physical mask',
      'Hiding neurodivergent traits to fit in',
      'Avoiding social situations',
      'Taking medication'
    ],
    correctAnswer: 1,
    explanation: 'Masking refers to the practice of hiding or suppressing neurodivergent traits to appear more "normal" or fit into social expectations. This can be mentally exhausting and is common among autistic individuals and those with ADHD.',
    category: 'Social Understanding',
    difficulty: 'Medium'
  },
  {
    id: 5,
    type: 'ranking',
    question: 'Rank these workplace accommodations from most to least important for neurodivergent employees:',
    options: [
      'Flexible work hours',
      'Quiet workspace',
      'Clear written instructions',
      'Regular breaks'
    ],
    correctAnswer: [2, 1, 3, 0], // Clear instructions, quiet space, breaks, flexible hours
    explanation: 'While all accommodations are valuable, clear written instructions provide essential structure, quiet workspaces reduce sensory overload, regular breaks help with focus, and flexible hours offer additional support.',
    category: 'Workplace Accommodations',
    difficulty: 'Hard'
  },
  {
    id: 6,
    type: 'multiple-choice',
    question: 'Which sensory processing difference is most commonly associated with autism?',
    options: ['Hyposensitivity', 'Hypersensitivity', 'Both equally', 'Neither'],
    correctAnswer: 2,
    explanation: 'Autistic individuals commonly experience both hypersensitivity (over-responsiveness) and hyposensitivity (under-responsiveness) to sensory stimuli, though the specific patterns vary greatly between individuals.',
    category: 'Sensory Processing',
    difficulty: 'Medium'
  },
  {
    id: 7,
    type: 'free-text',
    question: 'Describe one way that neurodivergent thinking can be an advantage in problem-solving.',
    correctKeywords: ['pattern', 'detail', 'focus', 'creative', 'different', 'perspective', 'unique'],
    explanation: 'Neurodivergent individuals often excel at pattern recognition, attention to detail, creative problem-solving, and bringing unique perspectives that can lead to innovative solutions.',
    category: 'Problem Solving',
    difficulty: 'Medium'
  },
  {
    id: 8,
    type: 'multiple-choice',
    question: 'What percentage of the population is estimated to be neurodivergent?',
    options: ['5-10%', '15-20%', '25-30%', '35-40%'],
    correctAnswer: 1,
    explanation: 'Research suggests that approximately 15-20% of the population is neurodivergent, including conditions like ADHD, autism, dyslexia, dyspraxia, and others.',
    category: 'Statistics',
    difficulty: 'Medium'
  },
  {
    id: 9,
    type: 'scenario',
    question: 'A neurodivergent employee seems overwhelmed in team meetings. What is the BEST first step?',
    options: [
      'Ask them to speak up more',
      'Provide meeting agendas in advance',
      'Exclude them from future meetings',
      'Tell them to "get over it"'
    ],
    correctAnswer: 1,
    explanation: 'Providing meeting agendas in advance helps neurodivergent individuals prepare mentally, reduces anxiety, and allows them to process information more effectively.',
    category: 'Workplace Support',
    difficulty: 'Easy'
  },
  {
    id: 10,
    type: 'multiple-choice',
    question: 'Which of the following is a common misconception about neurodivergence?',
    options: [
      'It only affects children',
      'It can be a strength',
      'It requires accommodations',
      'It varies between individuals'
    ],
    correctAnswer: 0,
    explanation: 'A common misconception is that neurodivergence only affects children. In reality, neurodivergent conditions persist throughout life, though symptoms may change over time.',
    category: 'Misconceptions',
    difficulty: 'Easy'
  }
];

export default function NeurodivergentQuiz({ onQuizComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    let interval;
    if (isStarted && !showResults) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, showResults]);

  const startQuiz = () => {
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setShowResults(false);
    setTimeSpent(0);
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let correctAnswers = 0;

    QUIZ_QUESTIONS.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (question.type === 'multiple-choice' || question.type === 'scenario') {
          if (userAnswer === question.correctAnswer) {
            totalScore += 10;
            correctAnswers++;
          }
        } else if (question.type === 'slider') {
          const difference = Math.abs(userAnswer - question.correctAnswer);
          if (difference === 0) {
            totalScore += 10;
            correctAnswers++;
          } else if (difference === 1) {
            totalScore += 7;
            correctAnswers++;
          } else if (difference === 2) {
            totalScore += 4;
          }
        } else if (question.type === 'ranking') {
          const userRanking = userAnswer;
          const correctRanking = question.correctAnswer;
          let rankingScore = 0;
          for (let i = 0; i < userRanking.length; i++) {
            if (userRanking[i] === correctRanking[i]) {
              rankingScore += 2.5;
            }
          }
          totalScore += rankingScore;
          if (rankingScore >= 7.5) correctAnswers++;
        }
      }
    });

    setScore(totalScore);
    setShowResults(true);
    
    if (onQuizComplete) {
      onQuizComplete({
        quiz: 'Neurodivergent Knowledge',
        score: totalScore,
        maxScore: QUIZ_QUESTIONS.length * 10,
        correctAnswers,
        totalQuestions: QUIZ_QUESTIONS.length,
        timeSpent
      });
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'scenario':
        return (
          <div className="question-options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`option-button ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="slider-container">
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={answers[currentQuestion.id] || 3}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              {currentQuestion.labels.map((label, index) => (
                <span key={index} className="slider-label">
                  {label}
                </span>
              ))}
            </div>
            <div className="slider-value">
              Current: {currentQuestion.labels[answers[currentQuestion.id] - 1] || 'Neutral'}
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="ranking-container">
            <p>Drag to reorder (most important first):</p>
            <div className="ranking-list">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="ranking-item">
                  <span className="rank-number">{index + 1}</span>
                  <span className="rank-text">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'free-text':
        return (
          <div className="free-text-container">
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="free-text-input"
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / (QUIZ_QUESTIONS.length * 10)) * 100;
    if (percentage >= 90) return 'Excellent! You have a deep understanding of neurodivergence.';
    if (percentage >= 80) return 'Great job! You have good knowledge of neurodivergent topics.';
    if (percentage >= 70) return 'Good work! You have a solid foundation of knowledge.';
    if (percentage >= 60) return 'Not bad! You have some understanding but room to learn more.';
    return 'Keep learning! There\'s always more to discover about neurodivergence.';
  };

  if (!isStarted) {
    return (
      <div className="quiz-intro">
        <h2>Neurodivergent Knowledge Quiz</h2>
        <p>Test your understanding of neurodivergence, workplace accommodations, and inclusive practices.</p>
        <div className="quiz-info">
          <p>📝 {QUIZ_QUESTIONS.length} questions</p>
          <p>⏱️ Estimated time: 10-15 minutes</p>
          <p>🎯 Multiple question types</p>
          <p>💡 Detailed explanations provided</p>
        </div>
        <button onClick={startQuiz} className="btn btn-primary">
          Start Quiz
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-results">
        <h2>Quiz Complete!</h2>
        <div className="results-summary">
          <div className="result-stat">
            <span className="result-label">Score:</span>
            <span className="result-value">{score}/{QUIZ_QUESTIONS.length * 10}</span>
          </div>
          <div className="result-stat">
            <span className="result-label">Time:</span>
            <span className="result-value">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="result-stat">
            <span className="result-label">Percentage:</span>
            <span className="result-value">{Math.round((score / (QUIZ_QUESTIONS.length * 10)) * 100)}%</span>
          </div>
        </div>
        <p className="score-message">{getScoreMessage()}</p>
        <button onClick={startQuiz} className="btn btn-primary">
          Take Quiz Again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
        </div>
        <div className="quiz-timer">
          Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="question-container">
        <div className="question-meta">
          <span className="question-category">{currentQuestion.category}</span>
          <span className="question-difficulty">{currentQuestion.difficulty}</span>
        </div>
        
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        {renderQuestion()}

        {showExplanation && (
          <div className="explanation">
            <h4>Explanation:</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="question-actions">
          {answers[currentQuestion.id] !== undefined && (
            <button onClick={() => setShowExplanation(!showExplanation)} className="btn btn-secondary">
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
          )}
          
          <button 
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined}
            className="btn btn-primary"
          >
            {currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .quiz-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .quiz-progress {
          font-weight: bold;
          color: var(--primary-gold);
        }
        
        .quiz-timer {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-gold), var(--primary-purple));
          transition: width 0.3s ease;
        }
        
        .question-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
        }
        
        .question-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .question-category, .question-difficulty {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .question-category {
          background: rgba(255, 215, 0, 0.2);
          color: var(--primary-gold);
        }
        
        .question-difficulty {
          background: rgba(147, 51, 234, 0.2);
          color: var(--primary-purple);
        }
        
        .question-text {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .question-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .option-button {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--white);
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .option-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary-gold);
        }
        
        .option-button.selected {
          background: rgba(255, 215, 0, 0.2);
          border-color: var(--primary-gold);
          color: var(--primary-gold);
        }
        
        .slider-container {
          margin-bottom: 2rem;
        }
        
        .slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          margin-bottom: 1rem;
        }
        
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .slider-value {
          text-align: center;
          color: var(--primary-gold);
          font-weight: bold;
          margin-top: 0.5rem;
        }
        
        .free-text-input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: var(--white);
          font-family: var(--font-secondary);
          resize: vertical;
        }
        
        .explanation {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid var(--primary-gold);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        
        .explanation h4 {
          color: var(--primary-gold);
          margin-bottom: 0.5rem;
        }
        
        .question-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .quiz-intro, .quiz-results {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .quiz-info {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
        }
        
        .results-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .result-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .result-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .result-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary-gold);
        }
        
        .score-message {
          font-size: 1.1rem;
          color: var(--primary-gold);
          margin: 2rem 0;
        }
        
        @media (max-width: 768px) {
          .quiz-container {
            padding: 1rem;
          }
          
          .question-container {
            padding: 1rem;
          }
          
          .question-actions {
            flex-direction: column;
          }
          
          .results-summary {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
} 