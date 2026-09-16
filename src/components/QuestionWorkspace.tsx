import React from 'react';
import { Question } from '../types/ent';

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestionsInSubject: number;
  subjectName: string;
  selectedIndexes: number[]; // array of chosen option indexes
  isBookmarked: boolean;
  language: 'ru' | 'kk';
  onSelectOption: (optionIndex: number, isMultiple: boolean) => void;
  onClearAnswer: () => void;
  onToggleBookmark: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFinishExam: () => void;
  isFirst: boolean;
  isLastInExam: boolean;
}

export default function QuestionWorkspace({
  question,
  questionNumber,
  totalQuestionsInSubject,
  subjectName,
  selectedIndexes = [],
  isBookmarked,
  language,
  onSelectOption,
  onClearAnswer,
  onToggleBookmark,
  onPrev,
  onNext,
  onFinishExam,
  isFirst,
  isLastInExam
}: Props) {
  const isMultiple = question.type === 'multiple';
  const isContext = question.type === 'context' && question.contextText;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const options = question.options[language] || question.options.ru;
  const questionPrompt = question.question[language] || question.question.ru;
  const contextArticle = question.contextText ? (question.contextText[language] || question.contextText.ru) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* Top Question Status Bar */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-blue-600 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-sm">
            {language === 'kk' ? 'Сұрақ' : 'Вопрос'} {questionNumber} / {totalQuestionsInSubject}
          </span>

          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
            {subjectName}
          </span>

          {isMultiple ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
              {language === 'kk' ? 'Бірнеше жауап (2 балл)' : 'Множественный выбор (2 балла)'}
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              • 1 {language === 'kk' ? 'балл' : 'балл'}
            </span>
          )}
        </div>

        {/* Flag Bookmark Action */}
        <button
          onClick={onToggleBookmark}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
            isBookmarked
              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
          title={language === 'kk' ? 'Сұрақты белгілеу' : 'Пометить вопрос флажком'}
        >
          <svg
            className={`w-4 h-4 ${isBookmarked ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`}
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>
            {isBookmarked
              ? (language === 'kk' ? 'Белгіленген' : 'В закладках')
              : (language === 'kk' ? 'Белгілеу' : 'Пометить флажком')}
          </span>
        </button>
      </div>

      {/* Main Question Body */}
      <div className="p-6 sm:p-8 flex-1">
        
        {/* SPLIT-SCREEN FOR READING LITERACY (Context Reading) */}
        {isContext ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Context Article */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 max-h-[480px] overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <span>📄</span> {language === 'kk' ? 'Оқуға арналған мәтін' : 'Контекстный текст для чтения'}
              </div>
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-serif whitespace-pre-line select-text">
                {contextArticle}
              </div>
            </div>

            {/* Right Box: Question Prompt & Options */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed select-text">
                {questionPrompt}
              </h3>

              <div className="space-y-3 pt-2">
                {options.map((optText, optIdx) => {
                  const isChecked = selectedIndexes.includes(optIdx);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => onSelectOption(optIdx, isMultiple)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/90 text-blue-950 font-semibold shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}>
                          {letters[optIdx]}
                        </div>
                      </div>
                      <div className="flex-1 pt-0.5 text-sm leading-relaxed">
                        {optText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD FULL-WIDTH QUESTION VIEW */
          <div className="max-w-3xl">
            <h3 className="text-slate-900 font-semibold text-base sm:text-lg mb-6 leading-relaxed select-text">
              {questionPrompt}
            </h3>

            {isMultiple && (
              <div className="mb-4 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl flex items-center gap-2">
                <span>ℹ️</span>
                <span>
                  {language === 'kk'
                    ? 'Бір немесе бірнеше дұрыс жауапты таңдаңыз (құсбелгі арқылы)'
                    : 'Выберите один или несколько правильных ответов (чекбоксы)'}
                </span>
              </div>
            )}

            {/* Option Cards */}
            <div className="space-y-3">
              {options.map((optText, optIdx) => {
                const isChecked = selectedIndexes.includes(optIdx);

                return (
                  <div
                    key={optIdx}
                    onClick={() => onSelectOption(optIdx, isMultiple)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50/90 text-blue-950 font-semibold shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Badge: Radio circle or Checkbox square */}
                    <div className="pt-0.5 flex-shrink-0">
                      {isMultiple ? (
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}>
                          {isChecked ? '✓' : letters[optIdx]}
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}>
                          {letters[optIdx]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pt-0.5 text-sm sm:text-base leading-relaxed">
                      {optText}
                    </div>

                    {isChecked && (
                      <div className="text-blue-600 pt-0.5 flex-shrink-0 font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
              isFirst
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm active:scale-95'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{language === 'kk' ? 'Артқа' : 'Назад'}</span>
          </button>

          {selectedIndexes.length > 0 && (
            <button
              onClick={onClearAnswer}
              className="text-xs text-slate-500 hover:text-rose-600 underline font-medium px-2 py-1"
            >
              {language === 'kk' ? 'Жауапты тазарту' : 'Сбросить выбор'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <span>{language === 'kk' ? 'Алға' : 'Вперед'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={onFinishExam}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <span>{language === 'kk' ? 'Емтиханды аяқтау' : 'Завершить экзамен'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
