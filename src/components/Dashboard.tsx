import React from 'react';
import {
  Scale,
  FileText,
  BookOpen,
  ClipboardList,
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

const difficultyConfig: Record<Difficulty, { label: string; class: string; icon: React.ReactNode }> =
  {
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
      icon: <Scale className="w-3 h-3" />,
    },
  };

const levelIcons = [
  <FileText className="w-8 h-8 text-slate-700" />,
  <BookOpen className="w-8 h-8 text-slate-700" />,
  <Scale className="w-8 h-8 text-slate-700" />,
  <ClipboardList className="w-8 h-8 text-slate-700" />,
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectLevel }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Ribbon-style Header */}
      <header className="word-ribbon shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="word-ribbon-mark">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">ParaPro Word Lab</h1>
              <p className="text-slate-200 text-xs">Realistic legal document drills</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-100 text-sm">
            <GraduationCap className="w-4 h-4" />
            <span>Training Mode</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="word-hero">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.35fr,1fr] items-center gap-10 px-6">
          <div className="flex flex-col gap-4">
            <div className="word-pill">
              <Sparkles className="w-4 h-4" />
              <span>Word-style practice</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Build real-world Word skills for legal work.
            </h2>
            <p className="text-slate-600 text-lg">
              Each mission mirrors how you would format, cite, and review in Microsoft Word. Clear
              objectives, human mentor cues, and grading that rewards correct habits.
            </p>
            <div className="word-note">
              <strong>How selection works here:</strong> click a paragraph or sentence to select it.
              In real-world use cases, when using Microsoft Word, you will first click then drag your cursor to highlight selected text.
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="word-check">
                <span className="dot" />
                Word ribbon muscle memory
              </div>
              <div className="word-check">
                <span className="dot" />
                Supervisor-style mentor chat
              </div>
              <div className="word-check">
                <span className="dot" />
                Instant grading and hints
              </div>
            </div>
          </div>
          <div className="word-hero-card">
            <div className="word-hero-title">What you will practice</div>
            <ul className="word-hero-list">
              <li>
                <span className="dot" />
                Converting sloppy formatting into firm-ready Times New Roman.
              </li>
              <li>
                <span className="dot" />
                Marking citations and inserting a Table of Authorities at the top a page.
              </li>
              <li>
                <span className="dot" />
                Reviewing redlines with a tenant-first mindset.
              </li>
              <li>
                <span className="dot" />
                Assembling a final filing that reinforces all of the above skills.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Level Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Target className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-semibold text-slate-900">Training missions</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level, index) => {
              const difficulty = difficultyConfig[level.difficulty];
              const icon = levelIcons[index] || levelIcons[levelIcons.length - 1];

              return (
                <div
                  key={level.id}
                  className="level-card group"
                  onClick={() => onSelectLevel(level.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="level-icon">{icon}</div>
                    <div className="level-id">Lv {level.id}</div>
                  </div>

                  <div className={`badge ${difficulty.class} mb-2`}>
                    {difficulty.icon}
                    <span className="ml-1">{difficulty.label}</span>
                  </div>

                  <h4 className="text-xl font-semibold text-slate-900 mb-1">{level.title}</h4>
                  <p className="text-blue-700 text-sm font-medium mb-3">{level.subtitle}</p>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{level.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {level.skills.map((skill, i) => (
                      <span key={i} className="skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                    <span>{level.tasks.length} tasks</span>
                    <span className="text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Start
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-left">
          <div className="feature-tile">
            <div className="feature-icon bg-blue-100 text-blue-700">
              <FileText className="w-6 h-6" />
            </div>
            <h4>Word-first UI</h4>
            <p>Ribbon, fonts, and placement cues match how you would operate in Word day to day.</p>
          </div>
            <div className="feature-tile">
              <div className="feature-icon bg-amber-100 text-amber-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4>Mentor guidance</h4>
              <p>Hints are written like a supervising paralegal so you learn the right habits.</p>
          </div>
          <div className="feature-tile">
            <div className="feature-icon bg-emerald-100 text-emerald-700">
              <Target className="w-6 h-6" />
            </div>
            <h4>Immediate feedback</h4>
            <p>Submit for grading anytime to see if your citations, formatting, and redlines meet the bar.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>ParaPro Word Lab · Legal document training simulator</p>
        </div>
      </footer>
    </div>
  );
};
