import React from 'react';
import { Question } from '../types/ent';

interface Props {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number[]>;
  bookmarked: Record<string, boolean>;
  onSelectIndex: (idx: number) => void;
  language: 'ru' | 'kk';
  onClose?: () => void;
}

export default function QuestionGrid({
  questions,
  currentIndex,
  answers,
  bookmarked,
  onSelectIndex,
  language,
  onClose
}: Props) {
  const answeredCount = questions.filter(
    q => answers[q.id] && answers[q.id].length > 0
  ).length;

  const flaggedCount = questions.filter(q => bookmarked[q.id]).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 font-sans">
      
      {/* Title & Progress badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h4 className="font-bold text-slate-800 text-sm">
            {language === 'kk' ? 'Сұрақтар кестесі' : 'Сетка вопросов'} ({questions.length})
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {answeredCount}/{questions.length}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Закрыть сетку"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* FULL MATRIX OF BUTTONS (1–20 or 1–40) */}
      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-[360px] sm:max-h-[380px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] && answers[q.id].length > 0;
          const isCurrent = currentIndex === idx;
          const isFlagged = !!bookmarked[q.id];

          // Color classes
          let cellStyle = "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200";

          if (isAnswered) {
            cellStyle = "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm";
          }

          if (isCurrent) {
            cellStyle += " ring-2 ring-blue-600 ring-offset-1 border-blue-600 font-black scale-105 z-10";
          }

          return (
            <button
              key={q.id}
              onClick={() => {
                onSelectIndex(idx);
                if (onClose) onClose();
              }}
              className={`relative h-11 sm:h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center active:scale-95 ${cellStyle}`}
              title={`№${idx + 1} (${isAnswered ? 'Отвечен' : 'Не отвечен'})`}
            >
              <span>{idx + 1}</span>

              {/* Yellow bookmark flag badge */}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block"></span>
            {language === 'kk' ? 'Жауап берілді:' : 'Отвечено:'}
          </span>
          <span className="font-bold text-emerald-700">{answeredCount}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300 inline-block"></span>
            {language === 'kk' ? 'Жауап жоқ:' : 'Не отвечено:'}
          </span>
          <span className="font-bold text-slate-700">{unansweredCount}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500 inline-block"></span>
            {language === 'kk' ? 'Белгіленген (жалауша):' : 'В закладках (флажок):'}
          </span>
          <span className="font-bold text-amber-600">{flaggedCount}</span>
        </div>
      </div>
    </div>
  );
}
