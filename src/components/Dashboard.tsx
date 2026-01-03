import React from 'react';
import { 
  Scale, 
  FileText, 
  BookOpen, 
  Trophy, 
  Star, 
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  Zap,
} from 'lucide-react';
import { levels } from '../constants/levels';
import type { Difficulty } from '../types';

interface DashboardProps {
  onSelectLevel: (levelId: number) => void;
}

const difficultyConfig: Record<Difficulty, { label: string; class: string; icon: React.ReactNode }> = {
  junior: { 
    label: 'Junior', 
    class: 'badge-junior',
    icon: <Star className="w-3 h-3" />,
  },
  associate: { 
    label: 'Associate', 
    class: 'badge-associate',
    icon: <Zap className="w-3 h-3" />,
  },
  senior: { 
    label: 'Senior', 
    class: 'badge-senior',
    icon: <Trophy className="w-3 h-3" />,
  },
};

const levelIcons = [
  <FileText className="w-8 h-8" />,
  <BookOpen className="w-8 h-8" />,
  <Scale className="w-8 h-8" />,
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectLevel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ParaPro Word Challenge</h1>
                <p className="text-slate-400 text-xs">Legal Document Training Simulator</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <GraduationCap className="w-4 h-4" />
              <span>Training Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Master Legal Document Formatting</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become a Document
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Pro</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Practice essential paralegal skills in a simulated Microsoft Word environment. 
            From basic formatting to complex document review—level up your expertise.
          </p>
        </div>
      </section>

      {/* Level Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Training Missions</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, index) => {
              const difficulty = difficultyConfig[level.difficulty];
              
              return (
                <div
                  key={level.id}
                  className="level-card group"
                  onClick={() => onSelectLevel(level.id)}
                >
                  {/* Level Number Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 text-sm font-bold">
                    {level.id}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    {levelIcons[index]}
                  </div>

                  {/* Difficulty Badge */}
                  <div className={`badge ${difficulty.class} mb-3`}>
                    {difficulty.icon}
                    <span className="ml-1">{difficulty.label}</span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-xl font-bold text-white mb-1">{level.title}</h4>
                  <p className="text-indigo-400 text-sm font-medium mb-3">{level.subtitle}</p>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {level.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {level.skills.map((skill, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-slate-700/50 rounded text-slate-300 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Tasks Preview */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {level.tasks.length} Tasks
                      </span>
                      <span className="text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Start Mission
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-slate-800/30 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold mb-2">Realistic Simulation</h4>
              <p className="text-slate-400 text-sm">
                Practice with a Word-like interface—no software installation required.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold mb-2">AI Mentor Support</h4>
              <p className="text-slate-400 text-sm">
                Get real-time hints and guidance from your virtual senior paralegal.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold mb-2">Instant Feedback</h4>
              <p className="text-slate-400 text-sm">
                Submit your work and receive detailed grading with specific improvement tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>ParaPro Word Challenge • Educational Training Simulator</p>
        </div>
      </footer>
    </div>
  );
};

