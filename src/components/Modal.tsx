import React from 'react';
import { X, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import type { GradingResult } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GradingResult | null;
  onReturnToDashboard: () => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  isOpen,
  onClose,
  result,
  onReturnToDashboard,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-8 text-center ${result.passed ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}>
          {result.passed ? (
            <>
              <Trophy className="w-16 h-16 text-white/90 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Mission Accomplished!</h2>
              <p className="text-white/80 mt-2">Outstanding work, paralegal!</p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-white/90 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Needs Revision</h2>
              <p className="text-white/80 mt-2">Review the feedback and try again</p>
            </>
          )}
        </div>

        {/* Score */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-slate-800">{result.score}</span>
            <span className="text-slate-400">/</span>
            <span className="text-xl text-slate-500">{result.maxScore}</span>
          </div>
          <p className="text-center text-sm text-slate-500 mt-1">Points earned</p>
        </div>

        {/* Feedback */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {result.feedback}
          </p>

          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Issues Found:</h4>
              <ul className="space-y-2">
                {result.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {result.passed ? (
              <button
                onClick={onReturnToDashboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Return to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onReturnToDashboard}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

