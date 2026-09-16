import React, { useState, useEffect, useMemo } from 'react';
import { SUBJECTS_CONFIG, getSubjectById } from '../config/subjectsConfig';
import { BILINGUAL_QUESTIONS, getQuestionsBySubjectAndLang } from '../data/bilingualQuestions';
import { TRANSLATIONS } from '../i18n/translations';

export default function TestSimulator({
  language = "ru",
  profileCombinationId = "math_physics",
  onFinishTestWithMistakes
}) {
  const t = TRANSLATIONS[language];

  // Resolve active subjects for this test session: 3 Mandatory + 2 Profile Subjects
  const activeSubjects = useMemo(() => {
    const list = [...SUBJECTS_CONFIG.mandatory];
    const combo = SUBJECTS_CONFIG.profileCombinations.find(c => c.id === profileCombinationId);
    if (combo && combo.subjects) {
      list.push(...combo.subjects);
    }
    return list;
  }, [profileCombinationId]);

  const [activeSubjectId, setActiveSubjectId] = useState(activeSubjects[0].id);

  // Collect questions for the active subject in the selected language
  const currentQuestions = useMemo(() => {
    const list = getQuestionsBySubjectAndLang(activeSubjectId, language);
    if (list.length > 0) return list;

    // Fallback: if questions aren't translated yet, load all available for this subject
    return BILINGUAL_QUESTIONS.filter(q => q.subjectId === activeSubjectId);
  }, [activeSubjectId, language]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [bookmarked, setBookmarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Ensure currentIndex stays within bounds when switching subjects
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeSubjectId]);

  // Timer countdown
  useEffect(() => {
    if (isTestFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTestFinished]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [timeLeft]);

  const currentQ = currentQuestions[currentIndex] || currentQuestions[0];
  const activeSubjectInfo = getSubjectById(activeSubjectId);

  const handleSelectOption = (idx) => {
    if (!currentQ || isTestFinished) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: idx
    }));
  };

  const handleClearOption = () => {
    if (!currentQ || isTestFinished) return;
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleBookmark = () => {
    if (!currentQ) return;
    setBookmarked(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Check if there is next subject
      const currSubIdx = activeSubjects.findIndex(s => s.id === activeSubjectId);
      if (currSubIdx < activeSubjects.length - 1) {
        setActiveSubjectId(activeSubjects[currSubIdx + 1].id);
        setCurrentIndex(0);
      } else {
        setShowConfirmModal(true);
      }
    }
  };

  // Complete Exam & detect mistakes to push into Mistake Bank
  const handleCompleteExam = () => {
    setShowConfirmModal(false);
    setIsTestFinished(true);

    const generatedMistakes = [];
    BILINGUAL_QUESTIONS.forEach(q => {
      const chosen = answers[q.id];
      if (chosen !== undefined && chosen !== q.correctIndex) {
        generatedMistakes.push({
          mistakeId: `m_${Date.now()}_${q.id}`,
          questionId: q.id,
          subjectId: q.subjectId,
          topicId: q.topicId,
          language: q.language,
          studentAnswerIndex: chosen,
          dateOccurred: new Date().toISOString(),
          status: "needs_review",
          attemptsCount: 1
        });
      }
    });

    if (onFinishTestWithMistakes) {
      onFinishTestWithMistakes(generatedMistakes);
    }
  };

  const answeredCountForCurrentSubject = useMemo(() => {
    return currentQuestions.filter(q => answers[q.id] !== undefined).length;
  }, [currentQuestions, answers]);

  // If no questions in this subject
  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Вопросы по выбранному предмету загружаются...</h3>
        <p className="text-sm text-slate-500 mb-4">Выберите другой предмет из списка сверху.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {activeSubjects.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubjectId(s.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              {s.name[language]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* 1. Subjects Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {activeSubjects.map((sub, sIdx) => {
          const isActive = activeSubjectId === sub.id;
          const subQs = getQuestionsBySubjectAndLang(sub.id, language);
          const answeredInSub = subQs.filter(q => answers[q.id] !== undefined).length;

          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {sIdx + 1}
              </span>
              <span>{sub.shortName ? sub.shortName[language] : sub.name[language]}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {answeredInSub}/{subQs.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Test Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Question Prompt & Options (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Question Top Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm">
                  {t.question} {currentIndex + 1} {t.of} {currentQuestions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
                  {activeSubjectInfo?.name[language]}
                </span>
              </div>

              {/* Bookmark Toggle */}
              <button
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  bookmarked[currentQ.id]
                    ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <svg
                  className={`w-4 h-4 ${bookmarked[currentQ.id] ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`}
                  fill={bookmarked[currentQ.id] ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{bookmarked[currentQ.id] ? t.bookmarked : t.bookmark}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="p-6 sm:p-8">
              <h3 className="text-slate-900 font-semibold text-base sm:text-lg mb-6 leading-relaxed select-text">
                {currentQ.question}
              </h3>

              {/* Options A, B, C, D */}
              <div className="space-y-3">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = answers[currentQ.id] === oIdx;
                  const letters = ["A", "B", "C", "D"];

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 text-blue-950 font-semibold shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}>
                          {letters[oIdx]}
                        </div>
                      </div>

                      <div className="flex-1 pt-0.5 text-sm sm:text-base leading-relaxed">
                        {opt}
                      </div>

                      {isSelected && (
                        <div className="text-blue-600 pt-0.5 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                    currentIndex === 0
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{t.prevQuestion}</span>
                </button>

                {answers[currentQ.id] !== undefined && (
                  <button
                    onClick={handleClearOption}
                    className="text-xs text-slate-500 hover:text-rose-600 underline font-medium px-2 py-1"
                  >
                    {t.clearAnswer}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
                >
                  <span>{t.nextQuestion}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Grid Matrix (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            
            {/* Timer & Question Grid Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800 text-sm">
                  {t.questionMatrix}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 text-sm">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {currentQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                const isFlagged = !!bookmarked[q.id];

                let btnStyle = "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200";
                if (isAnswered) btnStyle = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                if (isCurrent) btnStyle += " ring-2 ring-blue-600 ring-offset-1 font-black border-blue-600 scale-105";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl border text-xs font-bold flex items-center justify-center transition ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status counters */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
                  {t.answered}:
                </span>
                <span className="font-bold text-emerald-700">{answeredCountForCurrentSubject}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
                  {t.unanswered}:
                </span>
                <span className="font-bold text-slate-700">{currentQuestions.length - answeredCountForCurrentSubject}</span>
              </div>
            </div>

            {/* Finish Test Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.finishTest}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
              {t.confirmFinishTitle}
            </h3>
            <p className="text-xs sm:text-sm text-center text-slate-500 mb-6 leading-relaxed">
              {t.confirmFinishDesc} Ошибки будут автоматически отправлены в модуль <b>«Работа над ошибками»</b>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100"
              >
                {t.returnToTest}
              </button>
              <button
                onClick={handleCompleteExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow transition"
              >
                {t.confirmFinishBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
