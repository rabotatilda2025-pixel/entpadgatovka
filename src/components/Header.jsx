import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';

export default function Header({
  language = "ru",
  onLanguageChange,
  activeTab = "test",
  onTabChange,
  activeMistakesCount = 0
}) {
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-[#0f2444] text-white sticky top-0 z-40 shadow-lg border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-lg sm:text-xl shadow-md flex-shrink-0 text-white border border-white/20">
            ЕНТ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white leading-tight">
                {t.appTitle}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                11 класс
              </span>
            </div>
            <div className="text-[11px] text-blue-200/80 hidden sm:block">
              {t.appSubtitle}
            </div>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-blue-950/70 p-1.5 rounded-2xl border border-blue-800/60 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => onTabChange("test")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'test'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <span>🎓</span>
            <span>{t.navTestSimulator}</span>
          </button>

          <button
            onClick={() => onTabChange("mistakes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition relative ${
              activeTab === 'mistakes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <span>🛠️</span>
            <span>{t.navMistakesReview}</span>
            {activeMistakesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                {activeMistakesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <span>📚</span>
            <span>{t.navProfilePicker}</span>
          </button>
        </nav>

        {/* Right: Language Switcher (KZ / RU) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Dual Language Switcher */}
          <div className="flex items-center bg-blue-950/90 border border-blue-700/80 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => onLanguageChange("kk")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                language === 'kk'
                  ? 'bg-blue-500 text-white shadow-md transform scale-102'
                  : 'text-blue-300 hover:text-white'
              }`}
              title="Қазақ тіліне ауысу"
            >
              <span className="text-sm">🇰🇿</span>
              <span>ҚАЗ</span>
            </button>
            <button
              onClick={() => onLanguageChange("ru")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                language === 'ru'
                  ? 'bg-blue-500 text-white shadow-md transform scale-102'
                  : 'text-blue-300 hover:text-white'
              }`}
              title="Переключить на русский язык"
            >
              <span className="text-sm">🇷🇺</span>
              <span>РУС</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-blue-900/80 bg-blue-950 px-2 py-1.5 text-xs font-semibold">
        <button
          onClick={() => onTabChange("test")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition ${
            activeTab === 'test' ? 'bg-blue-600 text-white' : 'text-blue-300'
          }`}
        >
          {t.navTestSimulator}
        </button>
        <button
          onClick={() => onTabChange("mistakes")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition relative ${
            activeTab === 'mistakes' ? 'bg-blue-600 text-white' : 'text-blue-300'
          }`}
        >
          {t.navMistakesReview}
          {activeMistakesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              {activeMistakesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("profile")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition ${
            activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-blue-300'
          }`}
        >
          {t.navProfilePicker}
        </button>
      </div>
    </header>
  );
}
