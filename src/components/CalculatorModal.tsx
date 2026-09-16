import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function CalculatorModal({ onClose }: Props) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleDigit = (d: string) => {
    if (resetNext || display === '0') {
      setDisplay(d);
      setResetNext(false);
    } else if (display.length < 12) {
      setDisplay(display + d);
    }
  };

  const executeOp = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleOp = (newOp: string) => {
    const cur = parseFloat(display);
    if (prev === null) {
      setPrev(cur);
    } else if (op) {
      const res = executeOp(prev, cur, op);
      setDisplay(String(res));
      setPrev(res);
    }
    setOp(newOp);
    setResetNext(true);
  };

  const handleEqual = () => {
    if (op && prev !== null) {
      const res = executeOp(prev, parseFloat(display), op);
      setDisplay(String(res));
      setPrev(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setResetNext(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 p-4 font-sans animate-in fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>🧮</span> Калькулятор ЕНТ
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-xs">
          ✕
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl p-3 text-right font-mono text-2xl tracking-wider text-emerald-400 mb-3 overflow-x-auto border border-slate-800">
        {display}
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
        <button onClick={handleClear} className="col-span-2 p-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl">C</button>
        <button onClick={() => handleOp('/')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">÷</button>
        <button onClick={() => handleOp('*')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">×</button>

        <button onClick={() => handleDigit('7')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">7</button>
        <button onClick={() => handleDigit('8')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">8</button>
        <button onClick={() => handleDigit('9')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">9</button>
        <button onClick={() => handleOp('-')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">−</button>

        <button onClick={() => handleDigit('4')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">4</button>
        <button onClick={() => handleDigit('5')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">5</button>
        <button onClick={() => handleDigit('6')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">6</button>
        <button onClick={() => handleOp('+')} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl">+</button>

        <button onClick={() => handleDigit('1')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">1</button>
        <button onClick={() => handleDigit('2')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">2</button>
        <button onClick={() => handleDigit('3')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">3</button>
        <button onClick={handleEqual} className="row-span-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold">=</button>

        <button onClick={() => handleDigit('0')} className="col-span-2 p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">0</button>
        <button onClick={() => handleDigit('.')} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl">.</button>
      </div>
    </div>
  );
}
