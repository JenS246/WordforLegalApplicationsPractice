import React from 'react';
import { ArrowLeft, Scale, Send } from 'lucide-react';
import type { Level, Difficulty } from '../types/index';

interface HeaderProps {
  level: Level;
  onBack: () => void;
  onSubmit: () => void;
}

const difficultyColors: Record<Difficulty, string> = {
  junior: 'bg-emerald-500',
  associate: 'bg-amber-500',
  senior: 'bg-rose-500',
};

export const Header: React.FC<HeaderProps> = ({ level, onBack, onSubmit }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Exit</span>
          </button>

          <div className="w-px h-6 bg-slate-700" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-semibold">{level.title}</h1>
                <div className={`w-2 h-2 rounded-full ${difficultyColors[level.difficulty]}`} />
              </div>
              <p className="text-slate-400 text-xs">{level.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Center Section - Objective */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Objective: </span>
            <span className="text-slate-300 text-sm">{level.objective}</span>
          </div>
        </div>

        {/* Right Section */}
        <button
          onClick={onSubmit}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Send className="w-4 h-4" />
          <span>Submit to Senior Partner</span>
        </button>
      </div>
    </header>
  );
};

