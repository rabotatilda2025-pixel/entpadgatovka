import React, { useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

export default function RetestModal({
  language = "ru",
  mistakeItems = [],
  onClose,
  onResolveMistake
}) {
  const t = TRANSLATIONS[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentItem = mistakeItems[currentIndex];
  const q = currentItem?.questionData;

  if (!currentItem || !q) return null;

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    const correct = selectedOptionIndex === q.correctIndex;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      onResolveMistake(currentItem.mistakeId);
    }
  };

  const handleNext = () => {
    setIsAnswerChecked(false);
    setSelectedOptionIndex(null);
    if (currentIndex < mistakeItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentIndex + 1}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.retestModalTitle}
              </h3>
              <div className="text-xs text-slate-500">
                {t.question} {currentIndex + 1} {t.of} {mistakeItems.length}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Question Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-slate-900 font-medium text-base sm:text-lg mb-6 leading-relaxed">
            {q.question}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((optText, optIdx) => {
              const isSelected = selectedOptionIndex === optIdx;
              const isTargetCorrect = q.correctIndex === optIdx;

              let cardStyles = "border-slate-200 hover:border-blue-400 bg-white text-slate-700";
              let badgeStyles = "border-slate-300 bg-slate-50 text-slate-600";

              if (isAnswerChecked) {
                if (isTargetCorrect) {
                  cardStyles = "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 font-semibold";
                  badgeStyles = "bg-emerald-600 text-white border-emerald-600";
                } else if (isSelected && !isCorrect) {
                  cardStyles = "border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400";
                  badgeStyles = "bg-rose-600 text-white border-rose-600";
                }
              } else if (isSelected) {
                cardStyles = "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600 font-semibold";
                badgeStyles = "bg-blue-600 text-white border-blue-600";
              }

              const letters = ["A", "B", "C", "D"];

              return (
                <div
                  key={optIdx}
                  onClick={() => !isAnswerChecked && setSelectedOptionIndex(optIdx)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition cursor-pointer ${cardStyles}`}
                >
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeStyles}`}>
                    {letters[optIdx]}
                  </span>
                  <span className="flex-1 pt-0.5 text-sm sm:text-base">
                    {optText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feedback Message */}
          {isAnswerChecked && (
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm mb-4 leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {isCorrect ? '✓ ' + t.retestSuccessNotice : '✕ ' + t.retestFailNotice}
              </div>
              <div className="text-slate-700 mt-1">
                {q.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition"
          >
            {t.finishRetestBtn}
          </button>

          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOptionIndex === null}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow transition ${
                selectedOptionIndex === null
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              Проверить ответ
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition active:scale-95 flex items-center gap-1.5"
            >
              <span>{currentIndex < mistakeItems.length - 1 ? t.nextQuestion : t.finishRetestBtn}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
