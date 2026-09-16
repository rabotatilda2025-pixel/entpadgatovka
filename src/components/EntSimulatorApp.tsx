import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DirectionId, SubjectId, Question, MistakeRecord } from '../types/ent';
import {
  DIRECTIONS_CONFIG,
  SUBJECTS_METADATA,
  getFullExamQuestions
} from '../data/entQuestionsBank';
import QuestionGrid from './QuestionGrid';
import QuestionWorkspace from './QuestionWorkspace';
import ReferenceMaterialsModal from './ReferenceMaterialsModal';
import CalculatorModal from './CalculatorModal';
import MistakesReviewPage from './MistakesReviewPage';

export default function EntSimulatorApp() {
  // 1. Language state: 'ru' | 'kk'
  const [language, setLanguage] = useState<'ru' | 'kk'>(() => {
    return (localStorage.getItem('ent_lang') as 'ru' | 'kk') || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('ent_lang', language);
  }, [language]);

  // 2. Direction state: 'fizmat' | 'biohim' | 'geomat'
  const [directionId, setDirectionId] = useState<DirectionId>(() => {
    return (localStorage.getItem('ent_direction') as DirectionId) || 'fizmat';
  });

  useEffect(() => {
    localStorage.setItem('ent_direction', directionId);
  }, [directionId]);

  // 3. Exam questions (FULL 120 QUESTIONS: 20 + 10 + 10 + 40 + 40)
  const examQuestionsBySubject = useMemo(() => {
    return getFullExamQuestions(directionId);
  }, [directionId]);

  // Flattened questions map for quick ID lookups
  const allQuestionsMap = useMemo(() => {
    const map: Record<string, Question> = {};
    Object.values(examQuestionsBySubject).forEach(qList => {
      qList.forEach(q => {
        map[q.id] = q;
      });
    });
    return map;
  }, [examQuestionsBySubject]);

  // Active Subject List for current direction
  const activeSubjectList: SubjectId[] = useMemo(() => {
    const dir = DIRECTIONS_CONFIG.find(d => d.id === directionId) || DIRECTIONS_CONFIG[0];
    return ['history_kz', 'reading', 'math_lit', dir.profileSubject1, dir.profileSubject2];
  }, [directionId]);

  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('history_kz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // User session state
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(240 * 60); // 240 minutes = 14,400s
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<'exam' | 'mistakes'>('exam');

  // Modals
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobileGridDrawer, setShowMobileGridDrawer] = useState(false);

  // Mistakes bank in localStorage
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    const saved = localStorage.getItem('ent_state_mistakes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ent_state_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  // 240-Minute Countdown Timer
  useEffect(() => {
    if (isExamCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamCompleted]);

  // Formatted Timer: HH:MM:SS or MM:SS
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, [timeLeft]);

  // Current Subject Questions & Current Question
  const currentSubjectQuestions = examQuestionsBySubject[activeSubjectId] || [];
  const currentQuestion = currentSubjectQuestions[currentQuestionIndex] || currentSubjectQuestions[0];

  // Option Selection Handler
  const handleSelectOption = (optionIndex: number, isMultiple: boolean) => {
    if (!currentQuestion || isExamCompleted) return;

    setAnswers(prev => {
      const currentSelected = prev[currentQuestion.id] || [];
      if (isMultiple) {
        // Toggle checkbox
        const updated = currentSelected.includes(optionIndex)
          ? currentSelected.filter(i => i !== optionIndex)
          : [...currentSelected, optionIndex];
        return { ...prev, [currentQuestion.id]: updated };
      } else {
        // Radio button single choice
        return { ...prev, [currentQuestion.id]: [optionIndex] };
      }
    });
  };

  const handleClearAnswer = () => {
    if (!currentQuestion || isExamCompleted) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    setBookmarked(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  // Subject and question navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Jump to next subject if available
      const curSubIdx = activeSubjectList.indexOf(activeSubjectId);
      if (curSubIdx < activeSubjectList.length - 1) {
        setActiveSubjectId(activeSubjectList[curSubIdx + 1]);
        setCurrentQuestionIndex(0);
      } else {
        setShowConfirmModal(true);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      const curSubIdx = activeSubjectList.indexOf(activeSubjectId);
      if (curSubIdx > 0) {
        const prevSub = activeSubjectList[curSubIdx - 1];
        setActiveSubjectId(prevSub);
        setCurrentQuestionIndex((examQuestionsBySubject[prevSub]?.length || 1) - 1);
      }
    }
  };

  // Finish Exam & Calculate Score out of 140
  const scoreResults = useMemo(() => {
    let total = 0;
    const subjectScores: Record<SubjectId, { score: number; max: number }> = {} as any;

    activeSubjectList.forEach(sId => {
      const qList = examQuestionsBySubject[sId] || [];
      let subScore = 0;
      let subMax = SUBJECTS_METADATA[sId]?.maxPoints || 0;

      qList.forEach(q => {
        const userAnswers = answers[q.id] || [];
        if (q.type === 'multiple') {
          // Multiple choice scoring (up to 2 points)
          const correctSet = new Set(q.correctIndexes);
          const userSet = new Set(userAnswers);

          // Calculate errors: false positives + missed correct answers
          let errors = 0;
          userAnswers.forEach(ans => {
            if (!correctSet.has(ans)) errors++;
          });
          q.correctIndexes.forEach(ans => {
            if (!userSet.has(ans)) errors++;
          });

          if (errors === 0 && userAnswers.length > 0) {
            subScore += 2;
          } else if (errors === 1) {
            subScore += 1;
          }
        } else {
          // Single choice (1 point)
          if (userAnswers.length === 1 && userAnswers[0] === q.correctIndexes[0]) {
            subScore += 1;
          }
        }
      });

      subjectScores[sId] = { score: subScore, max: subMax };
      total += subScore;
    });

    return {
      totalScore: total,
      maxScore: 140,
      subjectScores
    };
  }, [answers, examQuestionsBySubject, activeSubjectList]);

  const handleFinishExam = () => {
    setShowConfirmModal(false);
    setIsExamCompleted(true);

    // Collect all mistakes
    const newMistakes: MistakeRecord[] = [];
    Object.values(examQuestionsBySubject).forEach(qList => {
      qList.forEach(q => {
        const userAns = answers[q.id] || [];
        let isCorrect = false;

        if (q.type === 'multiple') {
          isCorrect =
            userAns.length === q.correctIndexes.length &&
            q.correctIndexes.every(idx => userAns.includes(idx));
        } else {
          isCorrect = userAns.length === 1 && userAns[0] === q.correctIndexes[0];
        }

        if (!isCorrect) {
          newMistakes.push({
            mistakeId: `m_${Date.now()}_${q.id}`,
            questionId: q.id,
            subjectId: q.subjectId,
            studentAnswerIndexes: userAns,
            status: 'needs_review',
            dateOccurred: new Date().toISOString(),
            attemptsCount: 1
          });
        }
      });
    });

    setMistakes(prev => {
      const existingQIds = new Set(prev.map(p => p.questionId));
      const filtered = newMistakes.filter(m => !existingQIds.has(m.questionId));
      return [...filtered, ...prev];
    });

    setViewMode('mistakes');
  };

  const handleRetakeFullExam = () => {
    setAnswers({});
    setBookmarked({});
    setTimeLeft(240 * 60);
    setCurrentQuestionIndex(0);
    setActiveSubjectId('history_kz');
    setIsExamCompleted(false);
    setViewMode('exam');
  };

  const handleUpdateMistakeStatus = (mistakeId: string, status: 'needs_review' | 'resolved') => {
    setMistakes(prev =>
      prev.map(m => (m.mistakeId === mistakeId ? { ...m, status } : m))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP HEADER (U-Study / NTC Standard) */}
      <header className="bg-[#0f2444] text-white sticky top-0 z-40 shadow-xl border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-0 min-h-[56px] sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Direction Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-md border border-white/20 flex-shrink-0">
              ЕНТ
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-black truncate text-white">
                  {language === 'kk' ? 'Мемлекеттік ҰБТ' : 'Симулятор ЕНТ 2026'}
                </h1>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  120 сұрақ / 140 балл
                </span>
              </div>

              {/* Direction Dropdown */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={directionId}
                  disabled={!isExamCompleted && Object.keys(answers).length > 0}
                  onChange={(e) => {
                    setDirectionId(e.target.value as DirectionId);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setActiveSubjectId('history_kz');
                  }}
                  className="bg-blue-950/90 border border-blue-700/80 rounded-lg px-2 py-0.5 text-[11px] sm:text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-400 max-w-[140px] sm:max-w-none truncate"
                >
                  {DIRECTIONS_CONFIG.map(dir => (
                    <option key={dir.id} value={dir.id}>
                      {dir.name[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Tools & Timer & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* View Switcher: Exam vs Mistakes */}
            <div className="flex bg-blue-950/80 p-0.5 sm:p-1 rounded-xl border border-blue-800 text-[11px] sm:text-xs font-bold">
              <button
                onClick={() => setViewMode('exam')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition ${
                  viewMode === 'exam' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white'
                }`}
              >
                {language === 'kk' ? 'Тест' : 'Тест'}
              </button>
              <button
                onClick={() => setViewMode('mistakes')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition relative ${
                  viewMode === 'mistakes' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">{language === 'kk' ? 'Қатемен жұмыс' : 'Ошибки'}</span>
                <span className="sm:hidden">❌</span>
                {mistakes.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                    {mistakes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Reference Materials Button */}
            <button
              onClick={() => setShowReference(true)}
              className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-800 text-blue-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Справочные материалы"
            >
              <span>📖</span>
              <span className="hidden md:inline">{language === 'kk' ? 'Анықтама' : 'Справочник'}</span>
            </button>

            {/* Calculator Button */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`p-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                showCalculator
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-blue-950/70 hover:bg-blue-900/80 border-blue-800 text-blue-200'
              }`}
              title="Калькулятор"
            >
              <span>🧮</span>
              <span className="hidden md:inline">{language === 'kk' ? 'Калькулятор' : 'Калькулятор'}</span>
            </button>

            {/* 240-MINUTE COUNTDOWN TIMER */}
            <div className={`px-2.5 sm:px-3 py-1 sm:py-2 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
              timeLeft < 600
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : timeLeft < 1800
                ? 'bg-amber-600 border-amber-400 text-white'
                : 'bg-blue-950 border-blue-700 text-emerald-400'
            }`}>
              <span className="text-[11px] sm:text-sm">⏱️</span>
              <span>{formattedTime}</span>
            </div>

            {/* Language Toggle */}
            <div className="flex bg-blue-950 border border-blue-700 rounded-xl p-0.5">
              <button
                onClick={() => setLanguage('kk')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold transition ${
                  language === 'kk' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'
                }`}
              >
                ҚАЗ
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold transition ${
                  language === 'ru' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'
                }`}
              >
                РУС
              </button>
            </div>
          </div>
        </div>

        {/* 5 SUBJECTS TABS STRIP - HORIZONTAL TOUCH SCROLL */}
        {viewMode === 'exam' && (
          <div className="bg-[#0b1d38] px-3 sm:px-6 py-2 overflow-x-auto border-t border-blue-950 flex scrollbar-none snap-x touch-pan-x">
            <div className="max-w-7xl mx-auto flex items-center gap-2 flex-nowrap">
              {activeSubjectList.map((sId, idx) => {
                const isActive = activeSubjectId === sId;
                const subMeta = SUBJECTS_METADATA[sId];
                const qList = examQuestionsBySubject[sId] || [];
                const answeredInSub = qList.filter(
                  q => answers[q.id] && answers[q.id].length > 0
                ).length;

                return (
                  <button
                    key={sId}
                    onClick={() => {
                      setActiveSubjectId(sId);
                      setCurrentQuestionIndex(0);
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border snap-start flex-shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-blue-950/60 text-blue-200 hover:text-white hover:bg-blue-900 border-blue-900/60'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{subMeta?.shortName[language] || sId}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/25 text-white font-black' : 'bg-blue-900/80 text-blue-300'
                    }`}>
                      {answeredInSub}/{qList.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN VIEW */}
      <main className="flex-1 w-full pb-20 lg:pb-8">
        {viewMode === 'mistakes' ? (
          <MistakesReviewPage
            language={language}
            mistakes={mistakes}
            allQuestionsMap={allQuestionsMap}
            onUpdateStatus={handleUpdateMistakeStatus}
            examScoreInfo={isExamCompleted ? scoreResults : undefined}
            onRetakeFullExam={handleRetakeFullExam}
          />
        ) : (
          /* ACTIVE EXAM SIMULATOR */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Left/Center: Question Workspace (8 cols) */}
            <div className="lg:col-span-8 col-span-1">
              {currentQuestion && (
                <QuestionWorkspace
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestionsInSubject={currentSubjectQuestions.length}
                  subjectName={SUBJECTS_METADATA[activeSubjectId]?.name[language] || activeSubjectId}
                  selectedIndexes={answers[currentQuestion.id] || []}
                  isBookmarked={!!bookmarked[currentQuestion.id]}
                  language={language}
                  onSelectOption={handleSelectOption}
                  onClearAnswer={handleClearAnswer}
                  onToggleBookmark={handleToggleBookmark}
                  onPrev={handlePrevQuestion}
                  onNext={handleNextQuestion}
                  onFinishExam={() => setShowConfirmModal(true)}
                  isFirst={activeSubjectList.indexOf(activeSubjectId) === 0 && currentQuestionIndex === 0}
                  isLastInExam={
                    activeSubjectList.indexOf(activeSubjectId) === activeSubjectList.length - 1 &&
                    currentQuestionIndex === currentSubjectQuestions.length - 1
                  }
                />
              )}
            </div>

            {/* Right: Full Question Grid (1–20 or 1–40) (HIDDEN ON MOBILE, SHOWN ON DESKTOP) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-36">
              <QuestionGrid
                questions={currentSubjectQuestions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                bookmarked={bookmarked}
                onSelectIndex={setCurrentQuestionIndex}
                language={language}
              />
            </div>
          </div>
        )}
      </main>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR */}
      {viewMode === 'exam' && !isExamCompleted && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-2xl flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            onClick={handlePrevQuestion}
            disabled={activeSubjectList.indexOf(activeSubjectId) === 0 && currentQuestionIndex === 0}
            className={`p-2.5 rounded-xl border flex items-center justify-center font-bold text-xs ${
              activeSubjectList.indexOf(activeSubjectId) === 0 && currentQuestionIndex === 0
                ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm active:scale-95'
            }`}
            title={language === 'kk' ? 'Артқа' : 'Назад'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2.5 rounded-xl border flex items-center justify-center text-xs transition active:scale-95 ${
              currentQuestion && bookmarked[currentQuestion.id]
                ? 'bg-amber-100 border-amber-300 text-amber-600'
                : 'bg-white border-slate-300 text-slate-500'
            }`}
            title="Закладка"
          >
            <svg className="w-5 h-5" fill={currentQuestion && bookmarked[currentQuestion.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Question Matrix Drawer Trigger */}
          <button
            onClick={() => setShowMobileGridDrawer(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{language === 'kk' ? 'Сұрақтар' : 'Сетка'}: {currentQuestionIndex + 1}/{currentSubjectQuestions.length}</span>
          </button>

          {/* Forward button */}
          <button
            onClick={handleNextQuestion}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 flex items-center justify-center"
            title={language === 'kk' ? 'Алға' : 'Вперед'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Finish Exam button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 flex items-center justify-center"
            title={language === 'kk' ? 'Аяқтау' : 'Завершить'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </nav>
      )}

      {/* MOBILE QUESTION GRID BOTTOM SHEET DRAWER */}
      {showMobileGridDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in">
          {/* Backdrop click area */}
          <div className="flex-1" onClick={() => setShowMobileGridDrawer(false)} />

          <div className="bg-white rounded-t-3xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
            <QuestionGrid
              questions={currentSubjectQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              bookmarked={bookmarked}
              onSelectIndex={(idx) => {
                setCurrentQuestionIndex(idx);
                setShowMobileGridDrawer(false);
              }}
              language={language}
              onClose={() => setShowMobileGridDrawer(false)}
            />
          </div>
        </div>
      )}

      {/* 3. MODALS */}
      {showCalculator && (
        <CalculatorModal onClose={() => setShowCalculator(false)} />
      )}

      {showReference && (
        <ReferenceMaterialsModal
          language={language}
          onClose={() => setShowReference(false)}
        />
      )}

      {/* CONFIRMATION BEFORE FINISHING EXAM */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl font-black">
              !
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
              {language === 'kk' ? 'Емтиханды аяқтағыңыз келе ме?' : 'Завершить экзамен?'}
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-500 mb-6 leading-relaxed">
              {language === 'kk'
                ? 'Барлық 120 сұрақ бойынша жауаптарыңыз тексеріліп, 140 баллдық шкала бойынша қорытынды шығарылады.'
                : 'Ваши ответы по всем 120 заданиям будут проверены, будет рассчитан итоговый балл (из 140) и открыт разбор ошибок.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100"
              >
                {language === 'kk' ? 'Тестке оралу' : 'Вернуться к тесту'}
              </button>
              <button
                onClick={handleFinishExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow transition"
              >
                {language === 'kk' ? 'Иә, аяқтау' : 'Да, завершить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
