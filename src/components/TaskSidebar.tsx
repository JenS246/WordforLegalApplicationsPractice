import React from 'react';
import { CheckCircle, Circle, Target, Lightbulb, HelpCircle } from 'lucide-react';
import type { Task } from '../types';

interface TaskSidebarProps {
  objective: string;
  tasks: Task[];
  completedTasks: Set<string>;
  onShowHint: (hint: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  objective,
  tasks,
  completedTasks,
  onShowHint,
}) => {
  const completedCount = completedTasks.size;
  const totalTasks = tasks.length;
  const progress = (completedCount / totalTasks) * 100;

  return (
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col h-full">
      {/* Objective Section */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Target className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Objective</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{objective}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-300 font-medium">{completedCount}/{totalTasks}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Tasks</span>
        </div>
        
        <div className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            
            return (
              <div
                key={task.id}
                className={`task-item ${isCompleted ? 'completed' : ''}`}
              >
                <div className={`task-checkbox ${isCompleted ? 'completed' : ''}`}>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {task.description}
                  </p>
                </div>
                {task.hint && !isCompleted && (
                  <button
                    onClick={() => onShowHint(task.hint!)}
                    className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                    title="Get a hint"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Tip</span>
            <p className="text-slate-400 text-xs mt-1">
              Use Ctrl+Click to select multiple paragraphs at once. Press Ctrl+Z to undo changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

