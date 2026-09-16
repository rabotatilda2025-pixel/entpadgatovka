import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { questionsData } from '../data/questionsData';

export default function EntTestingApp({ initialQuestions = questionsData, subjectName = "Математическая грамотность (ЕНТ)" }) {
  // State variables
  const questions = initialQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: "A" | "B" | "C" | "D" }
  const [bookmarked, setBookmarked] = useState({}); // { [questionId]: boolean }
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes in seconds (7200s)
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [fontSize, setFontSize] = useState("normal"); // "small" | "normal" | "large"
  const [filterMode, setFilterMode] = useState("all"); // "all" | "answered" | "unanswered" | "bookmarked"
  const [reviewFilter, setReviewFilter] = useState("all"); // "all" | "correct" | "incorrect" | "skipped"
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);
  const [calcResetOnNext, setCalcResetOnNext] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (isTestFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTestFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestFinished]);

  // Format timer into MM:SS or HH:MM:SS
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      // 120 minutes is 2 hours; can display as HH:MM:SS or pure minutes like 119:59
      const totalMinutes = Math.floor(timeLeft / 60);
      return `${totalMinutes}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [timeLeft]);

  // Current question data
  const currentQuestion = questions[currentIndex] || questions[0];

  // Statistics
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const bookmarkedCount = useMemo(() => Object.values(bookmarked).filter(Boolean).length, [bookmarked]);
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Handle option selection
  const handleSelectOption = (optionId) => {
    if (isTestFinished) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  // Clear answer for current question
  const handleClearAnswer = () => {
    if (isTestFinished) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  // Toggle bookmark / flag for current question
  const handleToggleBookmark = (qId = currentQuestion.id) => {
    setBookmarked(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Navigation handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleFinishTest = () => {
    setShowConfirmModal(false);
    setIsTestFinished(true);
  };

  const handleRestartTest = () => {
    setAnswers({});
    setBookmarked({});
    setTimeLeft(120 * 60);
    setCurrentIndex(0);
    setIsTestFinished(false);
    setShowConfirmModal(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTestFinished || showConfirmModal || showCalculator) return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (currentQuestion.options[idx]) {
          handleSelectOption(currentQuestion.options[idx].id);
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key.toLowerCase())) {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(key)) {
          handleSelectOption(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTestFinished, showConfirmModal, showCalculator, currentQuestion]);

  // Calculator Logic
  const handleCalcDigit = (d) => {
    if (calcResetOnNext || calcDisplay === "0") {
      setCalcDisplay(String(d));
      setCalcResetOnNext(false);
    } else {
      if (calcDisplay.length < 12) {
        setCalcDisplay(calcDisplay + d);
      }
    }
  };

  const handleCalcOp = (op) => {
    const current = parseFloat(calcDisplay);
    if (calcPrev === null) {
      setCalcPrev(current);
    } else if (calcOp) {
      const res = executeCalc(calcPrev, current, calcOp);
      setCalcDisplay(String(res));
      setCalcPrev(res);
    }
    setCalcOp(op);
    setCalcResetOnNext(true);
  };

  const executeCalc = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Ошибка';
      default: return b;
    }
  };

  const handleCalcEqual = () => {
    if (calcOp && calcPrev !== null) {
      const res = executeCalc(calcPrev, parseFloat(calcDisplay), calcOp);
      setCalcDisplay(String(res));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcResetOnNext(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay("0");
    setCalcPrev(null);
    setCalcOp(null);
    setCalcResetOnNext(false);
  };

  // Calculate Final Score
  const scoreResults = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach(q => {
      const studentAns = answers[q.id];
      if (!studentAns) {
        skipped++;
      } else if (studentAns === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const percent = Math.round((correct / questions.length) * 100);
    const timeSpent = 120 * 60 - timeLeft;
    const spentMinutes = Math.floor(timeSpent / 60);
    const spentSeconds = timeSpent % 60;

    return {
      correct,
      incorrect,
      skipped,
      percent,
      total: questions.length,
      spentMinutes,
      spentSeconds
    };
  }, [answers, questions, timeLeft]);

  // Font size styles
  const fontClasses = {
    small: "text-sm",
    normal: "text-base",
    large: "text-lg"
  };

  // Filtered questions for the matrix
  const filteredQuestionIndices = useMemo(() => {
    return questions.map((q, idx) => {
      const isAnswered = answers[q.id] !== undefined;
      const isFlagged = !!bookmarked[q.id];

      if (filterMode === 'answered' && !isAnswered) return null;
      if (filterMode === 'unanswered' && isAnswered) return null;
      if (filterMode === 'bookmarked' && !isFlagged) return null;
      return idx;
    }).filter(idx => idx !== null);
  }, [questions, answers, bookmarked, filterMode]);

  // Render Result / Review Screen
  if (isTestFinished) {
    const filteredReviewQuestions = questions.filter(q => {
      const studentAns = answers[q.id];
      const isCorrect = studentAns === q.correctAnswer;
      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'incorrect') return studentAns && !isCorrect;
      if (reviewFilter === 'skipped') return !studentAns;
      return true;
    });

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Result Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-6 sm:p-8 text-center relative">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium mb-3 backdrop-blur-sm border border-blue-400/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Тестирование завершено
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{subjectName}</h1>
            <p className="text-blue-200 text-sm">Официальный формат Единого национального тестирования (ЕНТ)</p>

            {/* Score circle & key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">{scoreResults.correct} <span className="text-xl text-blue-300 font-normal">/ {scoreResults.total}</span></div>
                <div className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1">Итоговый балл</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300">{scoreResults.percent}%</div>
                <div className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1">Процент успеха</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-300">{scoreResults.spentMinutes}м {scoreResults.spentSeconds}с</div>
                <div className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1">Затраченное время</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="text-3xl sm:text-4xl font-extrabold text-rose-300">{scoreResults.incorrect + scoreResults.skipped}</div>
                <div className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1">Ошибок / Пропусков</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleRestartTest}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Пройти тест заново
              </button>
            </div>
          </div>

          {/* Detailed Question Review Section */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Подробный разбор заданий</h2>
                <p className="text-sm text-slate-500">Проверьте правильные ответы и изучите подробные решения задач</p>
              </div>

              {/* Review Filters */}
              <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-medium">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Все ({questions.length})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'correct' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Верно ({scoreResults.correct})
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'incorrect' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Ошибки ({scoreResults.incorrect})
                </button>
                <button
                  onClick={() => setReviewFilter('skipped')}
                  className={`px-3 py-1.5 rounded-lg transition ${reviewFilter === 'skipped' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Пропущено ({scoreResults.skipped})
                </button>
              </div>
            </div>

            {/* List of reviewed questions */}
            <div className="space-y-6">
              {filteredReviewQuestions.map((q) => {
                const studentAns = answers[q.id];
                const isCorrect = studentAns === q.correctAnswer;
                const isSkipped = !studentAns;

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 transition ${
                      isSkipped
                        ? 'border-amber-300 bg-amber-50/40'
                        : isCorrect
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">Вопрос {q.id}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                          {q.category}
                        </span>
                      </div>
                      <div>
                        {isSkipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            Пропущен
                          </span>
                        ) : isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ Верно (+1 балл)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                            ✕ Неверно (0 баллов)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-800 text-base font-medium mb-4 leading-relaxed">
                      {q.question}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                      {q.options.map(opt => {
                        const isStudentChoice = studentAns === opt.id;
                        const isTargetCorrect = q.correctAnswer === opt.id;

                        let optClass = "border-slate-200 bg-white text-slate-700";
                        let badgeClass = "bg-slate-100 text-slate-700 border-slate-300";

                        if (isTargetCorrect) {
                          optClass = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500";
                          badgeClass = "bg-emerald-600 text-white border-emerald-600 font-bold";
                        } else if (isStudentChoice && !isCorrect) {
                          optClass = "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400";
                          badgeClass = "bg-rose-600 text-white border-rose-600 font-bold";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${optClass}`}
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${badgeClass}`}>
                              {opt.id}
                            </span>
                            <span className="flex-1 pt-0.5">{opt.text}</span>
                            {isTargetCorrect && (
                              <span className="text-emerald-600 text-xs font-bold self-center">✓ Правильный</span>
                            )}
                            {isStudentChoice && !isTargetCorrect && (
                              <span className="text-rose-600 text-xs font-bold self-center">Ваш ответ</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs sm:text-sm text-blue-900">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-800">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Пояснение и решение:
                        </div>
                        <div className="text-blue-950 font-sans leading-relaxed">
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Test UI
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col select-none">
      {/* 1. HEADER (U-Study style) */}
      <header className="bg-[#0f2444] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Subject & State Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 flex items-center justify-center font-black text-lg tracking-tight shadow-md flex-shrink-0">
              ЕНТ
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-bold truncate text-white">
                  {subjectName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Идет экзамен
                </span>
              </div>
              <div className="text-xs text-blue-200 hidden sm:block">
                Официальный симулятор тестирования (U-Study / НЦТ)
              </div>
            </div>
          </div>

          {/* Quick Tools & Timer & Finish */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Font Size Adjuster */}
            <div className="hidden lg:flex items-center bg-blue-950/60 border border-blue-800/60 rounded-xl p-1 text-xs">
              <button
                onClick={() => setFontSize("small")}
                className={`px-2 py-1 rounded-lg transition ${fontSize === 'small' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
                title="Мелкий шрифт"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2 py-1 rounded-lg transition ${fontSize === 'normal' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
                title="Обычный шрифт"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2 py-1 rounded-lg transition ${fontSize === 'large' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
                title="Крупный шрифт"
              >
                A+
              </button>
            </div>

            {/* Built-in Calculator button */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border transition ${
                showCalculator
                  ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                  : 'bg-blue-950/50 hover:bg-blue-900 border-blue-800 text-blue-200'
              }`}
              title="Открыть калькулятор"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Калькулятор</span>
            </button>

            {/* COUNTDOWN TIMER */}
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border font-mono font-bold tracking-wider transition ${
                timeLeft < 300
                  ? 'bg-rose-600/90 border-rose-400 text-white animate-pulse'
                  : timeLeft < 600
                  ? 'bg-amber-600/90 border-amber-400 text-white'
                  : 'bg-blue-950/80 border-blue-700/60 text-emerald-400'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm sm:text-base">{formattedTime}</div>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-blue-900/60 border border-blue-700 text-blue-200 hover:text-white"
              title="Открыть список вопросов"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Finish Test Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Завершить тест
            </button>
          </div>
        </div>

        {/* Progress Bar under header */}
        <div className="w-full bg-blue-950 h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: QUESTION BLOCK (cols 12 on mobile, cols 8 on desktop) */}
        <main className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {/* Question Top Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-lg shadow-sm">
                  Вопрос {currentQuestion.id} из {questions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700">
                  {currentQuestion.category}
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                  • 1 балл
                </span>
              </div>

              {/* Bookmark (Flag) Button */}
              <button
                onClick={() => handleToggleBookmark(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  bookmarked[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-300'
                }`}
                title="Пометить вопрос флажком для повторного просмотра"
              >
                <svg
                  className={`w-4 h-4 ${bookmarked[currentQuestion.id] ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`}
                  fill={bookmarked[currentQuestion.id] ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="hidden sm:inline">
                  {bookmarked[currentQuestion.id] ? 'В закладках' : 'В закладки'}
                </span>
              </button>
            </div>

            {/* Question Prompt */}
            <div className={`p-6 sm:p-8 ${fontClasses[fontSize]}`}>
              <div className="text-slate-900 font-medium leading-relaxed mb-6 select-text">
                {currentQuestion.question}
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;

                  return (
                    <label
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 shadow-sm text-blue-950 font-medium'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700 bg-white'
                      }`}
                    >
                      {/* Radio Badge */}
                      <div className="pt-0.5 flex-shrink-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'border-slate-300 bg-slate-50 text-slate-600 group-hover:border-blue-400'
                          }`}
                        >
                          {option.id}
                        </div>
                      </div>

                      {/* Option Text */}
                      <div className="flex-1 pt-1 leading-relaxed text-sm sm:text-base">
                        {option.text}
                      </div>

                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="text-blue-600 pt-1 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls inside Question Card */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
                    currentIndex === 0
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm active:scale-95'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Назад</span>
                </button>

                {answers[currentQuestion.id] && (
                  <button
                    onClick={handleClearAnswer}
                    className="text-xs text-slate-500 hover:text-rose-600 underline font-medium px-2 py-1 transition"
                  >
                    Сбросить ответ
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md transition"
                  >
                    <span>Далее</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md transition"
                  >
                    <span>Завершить тест</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick tips & shortcuts footer */}
          <div className="hidden sm:flex items-center justify-between text-xs text-slate-400 px-2">
            <div>
              Горячие клавиши: <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-mono">1..4</kbd> или <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-mono">A..D</kbd> для выбора, <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-mono">→</kbd> для навигации
            </div>
            <div>
              Отвечено: <span className="font-semibold text-slate-600">{answeredCount}</span> из {questions.length}
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: QUESTION MATRIX NAVIGATION (cols 4 on desktop, hidden on mobile unless drawer opened) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Карта вопросов ({questions.length})
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {progressPercent}%
              </span>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl mb-4 text-[11px] font-semibold text-center">
              <button
                onClick={() => setFilterMode("all")}
                className={`py-1 rounded-lg transition ${filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterMode("answered")}
                className={`py-1 rounded-lg transition ${filterMode === 'answered' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Отв.
              </button>
              <button
                onClick={() => setFilterMode("unanswered")}
                className={`py-1 rounded-lg transition ${filterMode === 'unanswered' ? 'bg-slate-300 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Проп.
              </button>
              <button
                onClick={() => setFilterMode("bookmarked")}
                className={`py-1 rounded-lg transition ${filterMode === 'bookmarked' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Флаг
              </button>
            </div>

            {/* 1-40 Question Grid Matrix */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                const isFlagged = !!bookmarked[q.id];

                // Filter check
                if (filterMode === 'answered' && !isAnswered) return null;
                if (filterMode === 'unanswered' && isAnswered) return null;
                if (filterMode === 'bookmarked' && !isFlagged) return null;

                let btnStyles = "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200";

                if (isAnswered) {
                  btnStyles = "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm";
                }

                if (isCurrent) {
                  btnStyles += " ring-2 ring-blue-600 ring-offset-1 font-extrabold scale-105 border-blue-600 z-10";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${btnStyles}`}
                    title={`Вопрос ${q.id} (${isAnswered ? 'Отвечен' : 'Не отвечен'})`}
                  >
                    {q.id}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend / Status Badges */}
            <div className="border-t border-slate-200 mt-5 pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block"></span>
                  Отвечено:
                </span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300 inline-block"></span>
                  Пропущено:
                </span>
                <span className="font-bold text-slate-700">{unansweredCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-500 inline-block"></span>
                  В закладках:
                </span>
                <span className="font-bold text-amber-600">{bookmarkedCount}</span>
              </div>
            </div>

            {/* Complete Test Action */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-98"
            >
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Завершить тестирование
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE DRAWER (For small screens) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl p-5 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="font-bold text-slate-900 text-base">Сетка вопросов</h2>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                const isFlagged = !!bookmarked[q.id];

                let btnStyles = "bg-slate-100 text-slate-700";
                if (isAnswered) btnStyles = "bg-emerald-600 text-white";
                if (isCurrent) btnStyles += " ring-2 ring-blue-600 font-bold border-blue-600";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobileDrawerOpen(false);
                    }}
                    className={`relative h-10 rounded-xl border text-xs font-semibold flex items-center justify-center ${btnStyles}`}
                  >
                    {q.id}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowConfirmModal(true);
                }}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow"
              >
                Завершить тест
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR MODAL */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 w-72 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Калькулятор ЕНТ
            </div>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Calculator screen */}
          <div className="bg-slate-950 rounded-xl p-3 text-right font-mono text-xl tracking-wider text-emerald-400 mb-3 overflow-x-auto border border-slate-800">
            {calcDisplay}
          </div>

          {/* Calculator keypad */}
          <div className="grid grid-cols-4 gap-1.5 text-sm font-semibold">
            <button onClick={handleCalcClear} className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg">C</button>
            <button onClick={() => handleCalcOp('/')} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg">÷</button>
            <button onClick={() => handleCalcOp('*')} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg">×</button>

            <button onClick={() => handleCalcDigit(7)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">7</button>
            <button onClick={() => handleCalcDigit(8)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">8</button>
            <button onClick={() => handleCalcDigit(9)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">9</button>
            <button onClick={() => handleCalcOp('-')} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg">−</button>

            <button onClick={() => handleCalcDigit(4)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">4</button>
            <button onClick={() => handleCalcDigit(5)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">5</button>
            <button onClick={() => handleCalcDigit(6)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">6</button>
            <button onClick={() => handleCalcOp('+')} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg">+</button>

            <button onClick={() => handleCalcDigit(1)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">1</button>
            <button onClick={() => handleCalcDigit(2)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">2</button>
            <button onClick={() => handleCalcDigit(3)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">3</button>
            <button onClick={handleCalcEqual} className="row-span-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">=</button>

            <button onClick={() => handleCalcDigit(0)} className="col-span-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">0</button>
            <button onClick={() => handleCalcDigit('.')} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg">.</button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
              Завершить тестирование?
            </h3>
            
            <p className="text-sm text-center text-slate-500 mb-5">
              После подтверждения ваши ответы будут зафиксированы и пересданы для итоговой оценки.
            </p>

            {/* Quick summary inside modal */}
            <div className="bg-slate-50 rounded-xl p-3.5 mb-5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Всего вопросов:</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Отвечено:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Не отвечено:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
              {bookmarkedCount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Вопросов в закладках:</span>
                  <span className="font-bold">{bookmarkedCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>У вас осталось <b>{unansweredCount}</b> неотвеченных вопросов. Вы можете вернуться к тесту и дорешать их.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
              >
                Вернуться к тесту
              </button>
              <button
                onClick={handleFinishTest}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow transition"
              >
                Да, завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
