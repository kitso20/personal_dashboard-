import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  CheckCircle2,
  Flame,
  FileText,
  Clock,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Habit, ToDoItem, QuickNote } from '../types';

interface GlobalQuickActionProps {
  dispatchAction: (action: string, payload: any) => Promise<any>;
  onSuccessToast?: (title: string, message: string) => void;
  externalOpen?: boolean;
  onCloseExternal?: () => void;
}

export const GlobalQuickAction: React.FC<GlobalQuickActionProps> = ({
  dispatchAction,
  onSuccessToast,
  externalOpen,
  onCloseExternal
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen || internalOpen : internalOpen;

  const handleClose = () => {
    setInternalOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const [activeType, setActiveType] = useState<'task' | 'habit' | 'note'>('task');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('Today');

  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<'focus' | 'health' | 'learning' | 'routine' | 'rest'>('focus');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');

  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for global shortcut (Cmd+K / Cmd+E / Ctrl+K / Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        setInternalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeType === 'task') {
        if (!taskTitle.trim()) return;
        await dispatchAction('ADD_TODO', {
          title: taskTitle.trim(),
          category: taskCategory,
          priority: taskPriority,
          dueDate: taskDueDate
        });
        setTaskTitle('');
        if (onSuccessToast) onSuccessToast('Task Created', `Added: "${taskTitle}"`);
      } else if (activeType === 'habit') {
        if (!habitName.trim()) return;
        await dispatchAction('ADD_HABIT', {
          name: habitName.trim(),
          category: habitCategory
        });
        setHabitName('');
        if (onSuccessToast) onSuccessToast('Habit Tracked', `New habit: "${habitName}"`);
      } else if (activeType === 'note') {
        if (!noteTitle.trim() && !noteContent.trim()) return;
        await dispatchAction('ADD_NOTE', {
          title: noteTitle.trim() || 'Quick Note',
          content: noteContent.trim(),
          category: noteCategory
        });
        setNoteTitle('');
        setNoteContent('');
        if (onSuccessToast) onSuccessToast('Note Logged', `Saved note: "${noteTitle || 'Quick Note'}"`);
      }

      handleClose();
    } catch (err: any) {
      console.error('Failed to dispatch quick action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setInternalOpen(true)}
          className="group flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-[#14171d]/90 hover:bg-[#1a1e27] text-white border border-white/[0.12] hover:border-rose-400/40 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-200 active:scale-95"
          aria-label="Open Global Quick Action"
          title="Quick capture task, habit, or note (⌘K or ⌘E)"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold tracking-tight">Quick Action</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Quick Action Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md bg-[#12151b] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Type Switcher */}
            <div className="p-4 pb-0 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.06] rounded-xl text-xs mb-3">
                <button
                  type="button"
                  onClick={() => setActiveType('task')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeType === 'task'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Task
                </button>

                <button
                  type="button"
                  onClick={() => setActiveType('habit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeType === 'habit'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Habit
                </button>

                <button
                  type="button"
                  onClick={() => setActiveType('note')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeType === 'note'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Note
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors mb-3"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Capture Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {/* TASK FORM */}
              {activeType === 'task' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Task Description
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="e.g. Complete architecture doc, fix auth token..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Category</label>
                      <select
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Learning">Learning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e: any) => setTaskPriority(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Due Date</label>
                      <select
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="Today">Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="This Week">This Week</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* HABIT FORM */}
              {activeType === 'habit' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Habit Name & Daily Intention
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="e.g. Read 20 pages, 30m HIIT, 2.5L Water..."
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Pillar / Category</label>
                    <select
                      value={habitCategory}
                      onChange={(e: any) => setHabitCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="focus">Focus (Deep Work & Code)</option>
                      <option value="health">Health (Movement & Nutrition)</option>
                      <option value="rest">Rest (Downtime & Sleep)</option>
                      <option value="learning">Learning (Reading & Growth)</option>
                      <option value="routine">Routine (Daily Discipline)</option>
                    </select>
                  </div>
                </>
              )}

              {/* NOTE FORM */}
              {activeType === 'note' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Note Title
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="e.g. Architecture thought, meeting takeaway..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/[0.08] focus:border-teal-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Content / Reflection
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type your quick note or thought..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] focus:border-teal-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Tag</label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Rest & Wellness">Rest & Wellness</option>
                    </select>
                  </div>
                </>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  Real-time sync to all devices
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 active:scale-98 transition-all"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Sync'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
