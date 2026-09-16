import React from 'react';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { TRANSLATIONS } from '../i18n/translations';

export default function ProfilePicker({
  language = "ru",
  selectedProfileId = "math_physics",
  onSelectProfile,
  onStartTesting
}) {
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.profileTitle}
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          {t.profileDesc}
        </p>
      </div>

      {/* 1. Mandatory Subjects Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-lg font-bold text-slate-900">
            {t.mandatoryTitle}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            (3 предмета / 40 вопросов)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUBJECTS_CONFIG.mandatory.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                  {subject.code}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {subject.name[language]}
                </h4>
                <div className="text-xs text-slate-500 mb-3">
                  Темы: {subject.topics.length} разделов кодификатора
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 font-semibold text-slate-600">
                <span>{subject.questionCount} {t.question.toLowerCase()}</span>
                <span className="text-emerald-600">Обязательный</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Profile Combinations Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          <h3 className="text-lg font-bold text-slate-900">
            {t.profileTitle}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            (Выберите 1 направление)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS_CONFIG.profileCombinations.map((combo) => {
            const isSelected = selectedProfileId === combo.id;

            return (
              <div
                key={combo.id}
                onClick={() => onSelectProfile(combo.id)}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/30'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Профиль ЕНТ
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        Выбрано
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {combo.name[language]}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {combo.description[language]}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="space-y-0.5">
                    {combo.subjects.map(s => (
                      <div key={s.id} className="text-slate-700 font-semibold">
                        • {s.name[language]} (35 вопр.)
                      </div>
                    ))}
                  </div>
                  <div className="text-right font-bold text-indigo-700">
                    70 вопр.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStartTesting}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-base shadow-xl shadow-blue-500/20 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.startTestBtn}
        </button>
      </div>
    </div>
  );
}
