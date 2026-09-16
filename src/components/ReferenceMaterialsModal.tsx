import React, { useState } from 'react';

interface Props {
  language: 'ru' | 'kk';
  onClose: () => void;
}

export default function ReferenceMaterialsModal({ language, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'mendeleev' | 'solubility' | 'formulas'>('mendeleev');

  // Sample Mendeleev elements grid
  const elements = [
    { num: 1, sym: 'H', nameRu: 'Водород', nameKk: 'Сутек', mass: '1.008', group: 1, period: 1 },
    { num: 2, sym: 'He', nameRu: 'Гелий', nameKk: 'Гелий', mass: '4.002', group: 18, period: 1 },
    { num: 3, sym: 'Li', nameRu: 'Литий', nameKk: 'Литий', mass: '6.94', group: 1, period: 2 },
    { num: 4, sym: 'Be', nameRu: 'Бериллий', nameKk: 'Бериллий', mass: '9.012', group: 2, period: 2 },
    { num: 5, sym: 'B', nameRu: 'Бор', nameKk: 'Бор', mass: '10.81', group: 13, period: 2 },
    { num: 6, sym: 'C', nameRu: 'Углерод', nameKk: 'Көміртек', mass: '12.011', group: 14, period: 2 },
    { num: 7, sym: 'N', nameRu: 'Азот', nameKk: 'Азот', mass: '14.007', group: 15, period: 2 },
    { num: 8, sym: 'O', nameRu: 'Кислород', nameKk: 'Оттек', mass: '15.999', group: 16, period: 2 },
    { num: 9, sym: 'F', nameRu: 'Фтор', nameKk: 'Фтор', mass: '18.998', group: 17, period: 2 },
    { num: 10, sym: 'Ne', nameRu: 'Неон', nameKk: 'Неон', mass: '20.180', group: 18, period: 2 },
    { num: 11, sym: 'Na', nameRu: 'Натрий', nameKk: 'Натрий', mass: '22.990', group: 1, period: 3 },
    { num: 12, sym: 'Mg', nameRu: 'Магний', nameKk: 'Магний', mass: '24.305', group: 2, period: 3 },
    { num: 13, sym: 'Al', nameRu: 'Алюминий', nameKk: 'Алюминий', mass: '26.982', group: 13, period: 3 },
    { num: 14, sym: 'Si', nameRu: 'Кремний', nameKk: 'Кремний', mass: '28.085', group: 14, period: 3 },
    { num: 15, sym: 'P', nameRu: 'Фосфор', nameKk: 'Фосфор', mass: '30.974', group: 15, period: 3 },
    { num: 16, sym: 'S', nameRu: 'Сера', nameKk: 'Күкірт', mass: '32.06', group: 16, period: 3 },
    { num: 17, sym: 'Cl', nameRu: 'Хлор', nameKk: 'Хлор', mass: '35.45', group: 17, period: 3 },
    { num: 18, sym: 'Ar', nameRu: 'Аргон', nameKk: 'Аргон', mass: '39.948', group: 18, period: 3 },
    { num: 19, sym: 'K', nameRu: 'Калий', nameKk: 'Калий', mass: '39.098', group: 1, period: 4 },
    { num: 20, sym: 'Ca', nameRu: 'Кальций', nameKk: 'Кальций', mass: '40.078', group: 2, period: 4 },
    { num: 26, sym: 'Fe', nameRu: 'Железо', nameKk: 'Темір', mass: '55.845', group: 8, period: 4 },
    { num: 29, sym: 'Cu', nameRu: 'Медь', nameKk: 'Мыс', mass: '63.546', group: 11, period: 4 },
    { num: 30, sym: 'Zn', nameRu: 'Цинк', nameKk: 'Мырыш', mass: '65.38', group: 12, period: 4 },
    { num: 47, sym: 'Ag', nameRu: 'Серебро', nameKk: 'Күміс', mass: '107.87', group: 11, period: 5 },
    { num: 80, sym: 'Hg', nameRu: 'Ртуть', nameKk: 'Сынап', mass: '200.59', group: 12, period: 6 }
  ];

  // Solubility matrix data
  const cations = ['H⁺', 'Na⁺', 'K⁺', 'NH₄⁺', 'Ba²⁺', 'Ca²⁺', 'Mg²⁺', 'Zn²⁺', 'Fe²⁺', 'Cu²⁺', 'Ag⁺'];
  const anions = ['OH⁻', 'NO₃⁻', 'Cl⁻', 'SO₄²⁻', 'CO₃²⁻', 'PO₄³⁻', 'S²⁻'];
  
  // R = растворимо, M = мало, N = нерастворимо, - = разлагается
  const solubilityTable: Record<string, string[]> = {
    'OH⁻': ['Р', 'Р', 'Р', 'Р', 'Р', 'М', 'Н', 'Н', 'Н', 'Н', '-'],
    'NO₃⁻': ['Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р'],
    'Cl⁻': ['Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'Н'],
    'SO₄²⁻': ['Р', 'Р', 'Р', 'Р', 'Н', 'М', 'Р', 'Р', 'Р', 'Р', 'М'],
    'CO₃²⁻': ['Р', 'Р', 'Р', 'Р', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н'],
    'PO₄³⁻': ['Р', 'Р', 'Р', 'Р', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н', 'Н'],
    'S²⁻': ['Р', 'Р', 'Р', 'Р', 'Р', '-', 'Н', 'Н', 'Н', 'Н', 'Н']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[88vh] flex flex-col border border-slate-200 overflow-hidden font-sans">
        
        {/* Modal Top Bar */}
        <div className="bg-[#0f2444] text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 flex-shrink-0 border-b border-blue-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                📖
              </div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">
                {language === 'kk' ? 'Анықтамалық материалдар (ҰБТ)' : 'Справочные материалы (ЕНТ)'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Responsive Tabs Strip */}
          <div className="flex bg-blue-950/80 p-1 rounded-xl border border-blue-800 text-xs font-semibold overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setActiveTab('mendeleev')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex-1 sm:flex-initial text-center ${activeTab === 'mendeleev' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
            >
              {language === 'kk' ? 'Менделеев' : 'Таблица Менделеева'}
            </button>
            <button
              onClick={() => setActiveTab('solubility')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex-1 sm:flex-initial text-center ${activeTab === 'solubility' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
            >
              {language === 'kk' ? 'Ерігіштік' : 'Растворимость'}
            </button>
            <button
              onClick={() => setActiveTab('formulas')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex-1 sm:flex-initial text-center ${activeTab === 'formulas' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
            >
              {language === 'kk' ? 'Формулалар (Физ / Мат)' : 'Формулы (Физ / Мат)'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: MENDELEEV PERIODIC TABLE */}
          {activeTab === 'mendeleev' && (
            <div>
              <div className="mb-4 text-xs text-slate-500 font-semibold flex justify-between items-center">
                <span>{language === 'kk' ? 'Химиялық элементтердің периодтық жүйесі' : 'Периодическая система химических элементов Д. И. Менделеева'}</span>
                <span>{language === 'kk' ? 'Негізгі топтар (I–VIII)' : 'Основные группы элементов'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {elements.map((el) => (
                  <div
                    key={el.num}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition text-center"
                  >
                    <div className="text-[10px] font-bold text-slate-400 flex justify-between">
                      <span>{el.num}</span>
                      <span>Гр.{el.group}</span>
                    </div>
                    <div className="text-xl font-black text-blue-900 my-0.5">{el.sym}</div>
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {language === 'kk' ? el.nameKk : el.nameRu}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{el.mass}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SOLUBILITY TABLE */}
          {activeTab === 'solubility' && (
            <div className="overflow-x-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-3">
                {language === 'kk' ? 'Қышқылдар, негіздер және тұздардың судағы ерігіштік кестесі' : 'Таблица растворимости кислот, солей и оснований в воде'}
              </h4>

              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 p-2 font-bold">Анион / Катион</th>
                    {cations.map(c => (
                      <th key={c} className="border border-slate-200 p-2 font-bold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anions.map(an => (
                    <tr key={an} className="hover:bg-slate-50">
                      <td className="border border-slate-200 p-2 font-bold bg-slate-100 text-slate-800">{an}</td>
                      {solubilityTable[an]?.map((val, idx) => {
                        let color = "text-slate-700 font-medium";
                        if (val === 'Р') color = "text-emerald-700 font-bold bg-emerald-50";
                        if (val === 'Н') color = "text-rose-700 font-bold bg-rose-50";
                        if (val === 'М') color = "text-amber-700 font-bold bg-amber-50";

                        return (
                          <td key={idx} className={`border border-slate-200 p-2 ${color}`}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><b className="text-emerald-700">Р</b> — растворимо / ериді</span>
                <span className="flex items-center gap-1.5"><b className="text-amber-700">М</b> — малорастворимо / аз ериді</span>
                <span className="flex items-center gap-1.5"><b className="text-rose-700">Н</b> — нерастворимо / ерімейді</span>
                <span className="flex items-center gap-1.5"><b className="text-slate-400">—</b> — разлагается водой / суда ыдырайды</span>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS SHEET */}
          {activeTab === 'formulas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Physics */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="font-bold text-blue-900 text-sm border-b pb-2 flex items-center gap-2">
                  <span>⚡</span>
                  <span>{language === 'kk' ? 'Физика формулалары' : 'Формулы по Физике'}</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-800">Кинематика:</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      v = v₀ + at &nbsp;|&nbsp; S = v₀t + (at²)/2 &nbsp;|&nbsp; v² - v₀² = 2aS
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800">Динамика & Энергия:</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      F = ma &nbsp;|&nbsp; Eк = (mv²)/2 &nbsp;|&nbsp; Ep = mgh &nbsp;|&nbsp; p = mv
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800">Электродинамика & Ток:</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      I = U / R &nbsp;|&nbsp; P = UI = I²R &nbsp;|&nbsp; A = IUt &nbsp;|&nbsp; Fкул = k·(|q₁q₂|)/r²
                    </div>
                  </div>
                </div>
              </div>

              {/* Mathematics */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="font-bold text-indigo-900 text-sm border-b pb-2 flex items-center gap-2">
                  <span>📐</span>
                  <span>{language === 'kk' ? 'Математика формулалары' : 'Формулы по Математике'}</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-800">Тригонометрия:</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      sin²α + cos²α = 1 &nbsp;|&nbsp; tg α = sin α / cos α &nbsp;|&nbsp; sin 2α = 2 sin α cos α
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800">Производные (Туынды):</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      (xⁿ)' = n·xⁿ⁻¹ &nbsp;|&nbsp; (sin x)' = cos x &nbsp;|&nbsp; (cos x)' = -sin x &nbsp;|&nbsp; (eˣ)' = eˣ
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800">Геометрия (Аудандар):</span>
                    <div className="font-mono bg-slate-50 p-2 rounded-lg mt-1 border text-slate-900">
                      Sкруг = πR² &nbsp;|&nbsp; Sтреуг = (a·h)/2 &nbsp;|&nbsp; Sтрапеции = ((a+b)/2)·h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
