import React, { useState, useMemo } from 'react';
import { SUBJECTS_CONFIG, getSubjectById, getTopicById } from '../config/subjectsConfig';
import { BILINGUAL_QUESTIONS } from '../data/bilingualQuestions';
import { TRANSLATIONS } from '../i18n/translations';

export default function MistakesReview({
  language = "ru",
  mistakes = [],
  onUpdateMistakeStatus,
  onLaunchRetest
}) {
  const t = TRANSLATIONS[language];

  // Filters State
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all" | "needs_review" | "resolved"
  const [searchQuery, setSearchQuery] = useState("");

  // Prepare full data joining mistake records with questions database
  const enrichedMistakes = useMemo(() => {
    return mistakes.map(m => {
      // Find question by ID or fallback matching
      let q = BILINGUAL_QUESTIONS.find(item => item.id === m.questionId);
      
      // If language changed, try to find equivalent question in current language
      if (q && q.language !== language) {
        const equivalent = BILINGUAL_QUESTIONS.find(
          item => item.subjectId === q.subjectId && item.topicId === q.topicId && item.language === language
        );
        if (equivalent) q = equivalent;
      }

      const subject = getSubjectById(m.subjectId);
      const topic = getTopicById(m.subjectId, m.topicId);

      return {
        ...m,
        questionData: q,
        subjectData: subject,
        topicData: topic
      };
    }).filter(item => item.questionData); // keep only with valid question data
  }, [mistakes, language]);

  // Dynamic list of topics based on selected subject
  const availableTopics = useMemo(() => {
    if (selectedSubject === "all") {
      // Collect all topics across all subjects
      const allTopics = [];
      SUBJECTS_CONFIG.mandatory.forEach(s => s.topics && allTopics.push(...s.topics));
      SUBJECTS_CONFIG.profileCombinations.forEach(combo => {
        combo.subjects.forEach(s => s.topics && allTopics.push(...s.topics));
      });
      return allTopics;
    }
    const subject = getSubjectById(selectedSubject);
    return subject?.topics || [];
  }, [selectedSubject]);

  // Apply filters
  const filteredMistakes = useMemo(() => {
    return enrichedMistakes.filter(item => {
      if (selectedSubject !== "all" && item.subjectId !== selectedSubject) return false;
      if (selectedTopic !== "all" && item.topicId !== selectedTopic) return false;
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const qText = item.questionData.question.toLowerCase();
        if (!qText.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [enrichedMistakes, selectedSubject, selectedTopic, selectedStatus, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = enrichedMistakes.length;
    const needsReview = enrichedMistakes.filter(m => m.status === 'needs_review').length;
    const resolved = enrichedMistakes.filter(m => m.status === 'resolved').length;
    return { total, needsReview, resolved };
  }, [enrichedMistakes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Top Banner with Statistics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {t.navMistakesReview}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t.mistakesTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.mistakesSubtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
              {t.totalMistakes}
            </div>
          </div>
          <div className="bg-rose-500/10 backdrop-blur-sm rounded-2xl p-4 border border-rose-500/20">
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{stats.needsReview}</div>
            <div className="text-xs text-rose-300 mt-1 uppercase font-semibold tracking-wider">
              {t.activeMistakes}
            </div>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.resolved}</div>
            <div className="text-xs text-emerald-300 mt-1 uppercase font-semibold tracking-wider">
              {t.resolvedMistakes}
            </div>
          </div>
        </div>

        {/* Quick Launch Retest Banner Action */}
        {stats.needsReview > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-blue-600/30 border border-blue-500/40 rounded-2xl p-4">
            <div className="text-xs sm:text-sm text-blue-100">
              💡 У вас есть <b>{stats.needsReview}</b> нерешенных ошибок. Закрепите их прямо сейчас!
            </div>
            <button
              onClick={() => onLaunchRetest(filteredMistakes.filter(m => m.status === 'needs_review'))}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.retestActionBtn} ({stats.needsReview})
            </button>
          </div>
        )}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {t.filterSubject}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic("all");
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">{t.allSubjects}</option>
              <optgroup label={t.mandatoryTitle}>
                {SUBJECTS_CONFIG.mandatory.map(s => (
                  <option key={s.id} value={s.id}>{s.name[language]}</option>
                ))}
              </optgroup>
              <optgroup label={t.profileTitle}>
                {SUBJECTS_CONFIG.profileCombinations.map(combo => (
                  combo.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name[language]}</option>
                  ))
                ))}
              </optgroup>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {t.filterTopic}
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">{t.allTopics}</option>
              {availableTopics.map(top => (
                <option key={top.id} value={top.id}>{top.name[language]}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {t.filterStatus}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="needs_review">🔴 {t.statusNeedsReview}</option>
              <option value="resolved">🟢 {t.statusResolved}</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Поиск по формулировке
            </label>
            <input
              type="text"
              placeholder="Начните вводить текст..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* LIST OF MISTAKE CARDS */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t.emptyMistakes}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{t.emptyMistakesDesc}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMistakes.map((item, idx) => {
            const q = item.questionData;
            const subjectName = item.subjectData?.name[language] || item.subjectId;
            const topicName = item.topicData?.name[language] || item.topicId;
            const isResolved = item.status === 'resolved';

            const studentChosenOption = q.options[item.studentAnswerIndex] || "—";
            const correctOption = q.options[q.correctIndex];

            return (
              <div
                key={item.mistakeId || idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                  isResolved
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-white'
                }`}
              >
                {/* Card Header Bar */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                      {subjectName}
                    </span>
                    <span className="font-semibold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
                      {t.topicBadge}: {topicName}
                    </span>
                  </div>

                  {/* Status Indicator & Toggle Action */}
                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {t.statusResolved}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                        {t.statusNeedsReview}
                      </span>
                    )}

                    <button
                      onClick={() => onUpdateMistakeStatus(item.mistakeId, isResolved ? 'needs_review' : 'resolved')}
                      className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1 transition"
                      title="Сменить статус вручную"
                    >
                      {isResolved ? t.markNeedsReview : t.markAsResolved}
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-6">
                  <div className="text-slate-900 font-semibold text-base sm:text-lg mb-5 leading-relaxed">
                    {q.question}
                  </div>

                  {/* Visual Comparison: Your Answer vs Correct Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    
                    {/* Student's Wrong Choice */}
                    <div className="rounded-xl p-4 border-2 border-rose-300 bg-rose-50/70 text-rose-950">
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2">
                        <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t.yourAnswer}
                      </div>
                      <div className="font-medium text-sm sm:text-base">
                        {studentChosenOption}
                      </div>
                    </div>

                    {/* Verified Correct Option */}
                    <div className="rounded-xl p-4 border-2 border-emerald-400 bg-emerald-50/80 text-emerald-950">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {t.correctAnswer}
                      </div>
                      <div className="font-medium text-sm sm:text-base">
                        {correctOption}
                      </div>
                    </div>
                  </div>

                  {/* Methodological Explanation (Textbook Quote / Rule) */}
                  {q.explanation && (
                    <div className="rounded-xl bg-blue-50/90 border border-blue-200 p-4 text-blue-950 text-xs sm:text-sm leading-relaxed">
                      <div className="font-bold flex items-center gap-1.5 mb-1.5 text-blue-900">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {t.methodExplanation}
                      </div>
                      <div className="text-slate-800">
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer with Single Retest Action */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Попыток ответа: <span className="font-semibold text-slate-700">{item.attemptsCount || 1}</span>
                  </div>
                  <button
                    onClick={() => onLaunchRetest([item])}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Закрепить этот вопрос
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
