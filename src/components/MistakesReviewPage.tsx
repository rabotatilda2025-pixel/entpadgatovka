import React, { useState, useMemo } from 'react';
import { Question, SubjectId, MistakeRecord } from '../types/ent';
import { SUBJECTS_METADATA } from '../data/entQuestionsBank';

interface Props {
  language: 'ru' | 'kk';
  mistakes: MistakeRecord[];
  allQuestionsMap: Record<string, Question>;
  onUpdateStatus: (mistakeId: string, status: 'needs_review' | 'resolved') => void;
  examScoreInfo?: {
    totalScore: number;
    maxScore: number;
    subjectScores: Record<SubjectId, { score: number; max: number }>;
  };
  onRetakeFullExam: () => void;
}

export default function MistakesReviewPage({
  language,
  mistakes,
  allQuestionsMap,
  onUpdateStatus,
  examScoreInfo,
  onRetakeFullExam
}: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [blitzItems, setBlitzItems] = useState<MistakeRecord[] | null>(null);

  // Blitz Test State
  const [blitzIndex, setBlitzIndex] = useState(0);
  const [blitzChoice, setBlitzChoice] = useState<number[]>([]);
  const [blitzChecked, setBlitzChecked] = useState(false);
  const [blitzIsCorrect, setBlitzIsCorrect] = useState(false);

  // Threshold evaluation: Total >= 50 and each subject >= 5
  const thresholdPassed = useMemo(() => {
    if (!examScoreInfo) return true;
    if (examScoreInfo.totalScore < 50) return false;
    for (const sub of Object.values(examScoreInfo.subjectScores)) {
      if (sub.score < 5) return false;
    }
    return true;
  }, [examScoreInfo]);

  // Filtered mistakes list
  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      if (selectedSubject !== 'all' && m.subjectId !== selectedSubject) return false;
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
      return true;
    });
  }, [mistakes, selectedSubject, selectedStatus]);

  const activeMistakesCount = mistakes.filter(m => m.status === 'needs_review').length;
  const resolvedMistakesCount = mistakes.filter(m => m.status === 'resolved').length;

  // Handle Blitz drill start
  const handleStartBlitz = (items: MistakeRecord[]) => {
    setBlitzItems(items);
    setBlitzIndex(0);
    setBlitzChoice([]);
    setBlitzChecked(false);
    setBlitzIsCorrect(false);
  };

  const handleCheckBlitzAnswer = () => {
    if (!blitzItems) return;
    const curMistake = blitzItems[blitzIndex];
    const q = allQuestionsMap[curMistake.questionId];
    if (!q) return;

    // Check match
    const isExact =
      q.correctIndexes.length === blitzChoice.length &&
      q.correctIndexes.every(idx => blitzChoice.includes(idx));

    setBlitzIsCorrect(isExact);
    setBlitzChecked(true);

    if (isExact) {
      onUpdateStatus(curMistake.mistakeId, 'resolved');
    }
  };

  const handleNextBlitz = () => {
    if (!blitzItems) return;
    setBlitzChecked(false);
    setBlitzChoice([]);
    if (blitzIndex < blitzItems.length - 1) {
      setBlitzIndex(blitzIndex + 1);
    } else {
      setBlitzItems(null);
    }
  };

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* 1. Overall Score Summary Banner (Out of 140 points) */}
      {examScoreInfo && (
        <div className="bg-gradient-to-r from-[#0f2444] via-indigo-950 to-[#0f2444] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
                {language === 'kk' ? 'Мемлекеттік ҰБТ қорытынды есебі' : 'Итоговый отчет государственного ЕНТ'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {language === 'kk' ? 'Емтихан нәтижелері' : 'Результаты тестирования'}
              </h2>
            </div>

            {/* Threshold badge */}
            <div className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm border flex items-center gap-2 ${
              thresholdPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              <span>{thresholdPassed ? '✓' : '✕'}</span>
              <span>
                {thresholdPassed
                  ? (language === 'kk' ? 'Шекті балл жиналды (Грантқа қатыса алады)' : 'Пороговый балл набран (Допущен к конкурсу)')
                  : (language === 'kk' ? 'Шекті балл жиналмады (< 50 немесе пән бойынша < 5)' : 'Пороговый балл не набран (< 50 или < 5 по предмету)')}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {examScoreInfo.totalScore} <span className="text-lg text-blue-300 font-normal">/ {examScoreInfo.maxScore}</span>
              </div>
              <div className="text-[11px] text-blue-200 uppercase font-semibold mt-1">
                {language === 'kk' ? 'Жалпы балл' : 'Общий балл (из 140)'}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {Math.round((examScoreInfo.totalScore / examScoreInfo.maxScore) * 100)}%
              </div>
              <div className="text-[11px] text-blue-200 uppercase font-semibold mt-1">
                {language === 'kk' ? 'Жетістік деңгейі' : 'Процент выполнения'}
              </div>
            </div>

            <div className="bg-rose-500/20 rounded-2xl p-4 border border-rose-500/30 text-center">
              <div className="text-3xl sm:text-4xl font-black text-rose-300">
                {mistakes.length}
              </div>
              <div className="text-[11px] text-rose-200 uppercase font-semibold mt-1">
                {language === 'kk' ? 'Жіберілген қателер' : 'Ошибок в тесте'}
              </div>
            </div>

            <div className="bg-emerald-500/20 rounded-2xl p-4 border border-emerald-500/30 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">
                {resolvedMistakesCount}
              </div>
              <div className="text-[11px] text-emerald-200 uppercase font-semibold mt-1">
                {language === 'kk' ? 'Бекітілген қателер' : 'Исправлено ошибок'}
              </div>
            </div>
          </div>

          {/* Breakdown by Subjects */}
          <div className="pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase mb-3">
              {language === 'kk' ? 'Пәндер бойынша бөлініс:' : 'Баллы по 5 предметам:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {Object.entries(examScoreInfo.subjectScores).map(([sId, sc]) => {
                const subMeta = SUBJECTS_METADATA[sId as SubjectId];
                const isPassSub = sc.score >= 5;

                return (
                  <div key={sId} className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                    <div className="text-xs text-blue-200 font-semibold truncate mb-1">
                      {subMeta?.shortName[language] || sId}
                    </div>
                    <div className="text-lg font-black text-white">
                      {sc.score} <span className="text-xs text-slate-400 font-normal">/ {sc.max}</span>
                    </div>
                    <div className={`text-[10px] font-bold mt-0.5 ${isPassSub ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPassSub ? 'Порог пройден' : 'Меньше 5 баллов'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Mistake Review Title & Blitz Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'kk' ? 'Қатемен жұмыс банкі' : 'Банк работы над ошибками'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'kk'
              ? 'Әрбір қатені мұқият талдап, оқулықтағы ережелерді оқыңыз және блиц-тестпен бекітіңіз'
              : 'Изучайте пояснения к неверным ответам и закрепляйте слабые темы в блиц-режиме'}
          </p>
        </div>

        {activeMistakesCount > 0 && (
          <button
            onClick={() => handleStartBlitz(filteredMistakes.filter(m => m.status === 'needs_review'))}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <span>⚡</span>
            <span>
              {language === 'kk'
                ? `Қателер бойынша блиц-тест (${activeMistakesCount})`
                : `Пройти блиц по ошибкам (${activeMistakesCount})`}
            </span>
          </button>
        )}
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            {language === 'kk' ? 'Пән бойынша сүзгі' : 'Фильтр по предмету'}
          </label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <option value="all">{language === 'kk' ? 'Барлық пәндер' : 'Все предметы'}</option>
            {Object.values(SUBJECTS_METADATA).map(s => (
              <option key={s.id} value={s.id}>{s.name[language]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            {language === 'kk' ? 'Мәртебесі' : 'Статус ошибки'}
          </label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <option value="all">{language === 'kk' ? 'Барлық мәртебелер' : 'Все статусы'}</option>
            <option value="needs_review">🔴 {language === 'kk' ? 'Қайталау қажет' : 'Не исправлено'}</option>
            <option value="resolved">🟢 {language === 'kk' ? 'Сәтті қайталанды' : 'Успешно повторено'}</option>
          </select>
        </div>
      </div>

      {/* 4. Error Cards List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            ✓
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">
            {language === 'kk' ? 'Қателер табылған жоқ!' : 'Ошибок по выбранным фильтрам нет!'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {language === 'kk'
              ? 'Барлық тапсырмалар дұрыс орындалды немесе сәтті түзетілді.'
              : 'Все задачи решены верно или уже отработаны в режиме блиц-повторения.'}
          </p>
          <button
            onClick={onRetakeFullExam}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow hover:bg-blue-700"
          >
            {language === 'kk' ? 'Жаңа толық емтиханды бастау' : 'Начать новый полный экзамен'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMistakes.map(m => {
            const q = allQuestionsMap[m.questionId];
            if (!q) return null;

            const isResolved = m.status === 'resolved';
            const subMeta = SUBJECTS_METADATA[m.subjectId];
            const options = q.options[language] || q.options.ru;

            const studentAnswersText = m.studentAnswerIndexes.map(idx => options[idx] || `Вариант ${idx + 1}`).join('; ');
            const correctAnswersText = q.correctIndexes.map(idx => options[idx] || `Вариант ${idx + 1}`).join('; ');

            return (
              <div
                key={m.mistakeId}
                className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-sm transition ${
                  isResolved ? 'border-emerald-200 bg-emerald-50/10' : 'border-rose-200'
                }`}
              >
                {/* Header of Error Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                      {subMeta?.name[language] || m.subjectId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {q.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isResolved
                        ? (language === 'kk' ? '✓ Сәтті қайталанды' : '✓ Успешно повторено')
                        : (language === 'kk' ? '● Қайталау қажет' : '● Не исправлено')}
                    </span>

                    <button
                      onClick={() => onUpdateStatus(m.mistakeId, isResolved ? 'needs_review' : 'resolved')}
                      className="text-xs text-slate-400 hover:text-slate-700 underline px-1"
                    >
                      {language === 'kk' ? 'Мәртебені өзгерту' : 'Сменить'}
                    </button>
                  </div>
                </div>

                {/* Question text */}
                <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-5 leading-relaxed select-text">
                  {q.question[language] || q.question.ru}
                </h4>

                {/* Comparison Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  
                  {/* Student's Wrong Answer */}
                  <div className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/80 text-rose-950">
                    <div className="text-xs font-bold uppercase text-rose-700 mb-1.5 flex items-center gap-1.5">
                      <span>✕</span>
                      <span>{language === 'kk' ? 'Сіздің қате жауабыңыз:' : 'Ваш неверный ответ:'}</span>
                    </div>
                    <div className="text-sm font-medium leading-relaxed">
                      {studentAnswersText || (language === 'kk' ? 'Жауап берілмеді' : 'Ответ не был дан')}
                    </div>
                  </div>

                  {/* Verified Correct Answer */}
                  <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 text-emerald-950">
                    <div className="text-xs font-bold uppercase text-emerald-700 mb-1.5 flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{language === 'kk' ? 'Дұрыс эталон жауап:' : 'Правильный эталонный ответ:'}</span>
                    </div>
                    <div className="text-sm font-medium leading-relaxed">
                      {correctAnswersText}
                    </div>
                  </div>
                </div>

                {/* Methodological Explanation */}
                <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-950 leading-relaxed">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                    <span>📖</span>
                    <span>{language === 'kk' ? 'Әдістемелік түсіндірме (НЦТ / оқулықтан):' : 'Методическое пояснение (НЦТ / учебник РК):'}</span>
                  </div>
                  <div className="text-slate-800 select-text">
                    {q.explanation[language] || q.explanation.ru}
                  </div>
                </div>

                {/* Single Blitz Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleStartBlitz([m])}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>{language === 'kk' ? 'Осы сұрақты қайта тапсыру' : 'Пройти этот вопрос заново'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. BLITZ RETEST MODAL */}
      {blitzItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 font-sans">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  ⚡
                </span>
                <h4 className="font-bold text-slate-900 text-base">
                  {language === 'kk' ? 'Блиц-тест: Қатемен жұмыс' : 'Блиц-тест: Закрепление ошибок'} ({blitzIndex + 1}/{blitzItems.length})
                </h4>
              </div>
              <button
                onClick={() => setBlitzItems(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Blitz Question Content */}
            {(() => {
              const curM = blitzItems[blitzIndex];
              const q = allQuestionsMap[curM.questionId];
              if (!q) return null;

              const isMult = q.type === 'multiple';
              const options = q.options[language] || q.options.ru;

              const toggleChoice = (optIdx: number) => {
                if (blitzChecked) return;
                if (isMult) {
                  setBlitzChoice(prev =>
                    prev.includes(optIdx) ? prev.filter(i => i !== optIdx) : [...prev, optIdx]
                  );
                } else {
                  setBlitzChoice([optIdx]);
                }
              };

              return (
                <div>
                  <div className="font-bold text-slate-900 text-base mb-5 leading-relaxed">
                    {q.question[language] || q.question.ru}
                  </div>

                  <div className="space-y-3 mb-6">
                    {options.map((optText, optIdx) => {
                      const isSelected = blitzChoice.includes(optIdx);
                      const isTargetCorrect = q.correctIndexes.includes(optIdx);

                      let cardStyle = "border-slate-200 bg-white hover:border-blue-400";
                      if (blitzChecked) {
                        if (isTargetCorrect) cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500";
                        else if (isSelected && !blitzIsCorrect) cardStyle = "border-rose-400 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400";
                      } else if (isSelected) {
                        cardStyle = "border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-600";
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => toggleChoice(optIdx)}
                          className={`p-3.5 rounded-2xl border-2 transition cursor-pointer text-sm flex items-start gap-3 ${cardStyle}`}
                        >
                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-100">
                            {letters[optIdx]}
                          </span>
                          <span className="flex-1 pt-0.5">{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {blitzChecked && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed mb-4 ${
                      blitzIsCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}>
                      <div className="font-bold mb-1">
                        {blitzIsCorrect ? '✓ Жауап дұрыс! Ошибка успешно исправлена.' : '✕ Жауап тағы да қате. Ознакомьтесь с правилом.'}
                      </div>
                      <div>{q.explanation[language] || q.explanation.ru}</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t">
                    <button
                      onClick={() => setBlitzItems(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {language === 'kk' ? 'Аяқтау' : 'Закрыть'}
                    </button>

                    {!blitzChecked ? (
                      <button
                        disabled={blitzChoice.length === 0}
                        onClick={handleCheckBlitzAnswer}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow disabled:opacity-40"
                      >
                        {language === 'kk' ? 'Жауапты тексеру' : 'Проверить ответ'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextBlitz}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                      >
                        {blitzIndex < blitzItems.length - 1
                          ? (language === 'kk' ? 'Келесі сұрақ' : 'Следующий вопрос')
                          : (language === 'kk' ? 'Блицті аяқтау' : 'Завершить блиц')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
