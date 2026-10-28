import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Video,
  Users,
  Play,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Cloud,
  Moon,
  Flame,
  X,
  Send,
  Eye,
  SlidersHorizontal,
  Pause,
  RotateCcw
} from 'lucide-react';
import { DashboardState, CalendarEvent, ToDoItem } from '../types';

interface DashboardOverviewProps {
  state: DashboardState;
  dispatchAction: (action: string, payload: any) => Promise<any>;
  onNavigateToPython: () => void;
  onNavigateToEmail: () => void;
  onNavigateToHabits: () => void;
  onOpenQuickAction?: (type?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  dispatchAction,
  onNavigateToPython,
  onNavigateToEmail,
  onNavigateToHabits,
  onOpenQuickAction
}) => {
  // Helper to determine automatic context based on real day and hour
  const getAutomaticContext = (date: Date): 'Morning' | 'Work' | 'After work' | 'Weekend' => {
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      return 'Weekend';
    }
    const hour = date.getHours();
    if (hour >= 5 && hour < 9) {
      return 'Morning';
    } else if (hour >= 9 && hour < 17) {
      return 'Work';
    } else {
      return 'After work';
    }
  };

  // Live ticking clock state and dynamic date
  const [currentTime, setCurrentTime] = useState<string>('01:10 PM');
  const [currentMonth, setCurrentMonth] = useState<string>(() => new Date().toLocaleDateString('en-US', { month: 'long' }));
  const [currentDay, setCurrentDay] = useState<number>(() => new Date().getDate());
  const [currentWeekday, setCurrentWeekday] = useState<string>(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());

  // Automatic time-of-day context state
  const [isAutoMode, setIsAutoMode] = useState<boolean>(state.preferences?.timeOfDayAutoMode ?? true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Morning' | 'Work' | 'After work' | 'Weekend'>(() => {
    return getAutomaticContext(new Date());
  });
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Focus Now Modal
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusTaskTitle, setFocusTaskTitle] = useState('Deep Architecture Sprint');
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  // Quick Note Capture Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Pulse view toggle: 'website' vs 'python_telemetry'
  const [pulseView, setPulseView] = useState<'website' | 'telemetry'>('website');

  // Secondary expansion drawer for weather, news, fun fact
  const [showExtrasDrawer, setShowExtrasDrawer] = useState(false);

  // Clock ticker and auto context updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const is24h = state.preferences?.timeFormat === '24h';

      if (is24h) {
        setCurrentTime(`${hours.toString().padStart(2, '0')}:${mins}`);
      } else {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        setCurrentTime(`${formattedHours}:${mins} ${ampm}`);
      }

      setCurrentMonth(now.toLocaleDateString('en-US', { month: 'long' }));
      setCurrentDay(now.getDate());
      setCurrentWeekday(now.toLocaleDateString('en-US', { weekday: 'long' }));
      setCurrentYear(now.getFullYear());

      // Auto update active context based on current time and date
      if (isAutoMode) {
        const autoCtx = getAutomaticContext(now);
        setActiveFilter(autoCtx);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isAutoMode, state.preferences?.timeFormat]);


  // Focus Timer interval
  useEffect(() => {
    let timer: any;
    if (isFocusRunning && focusSecondsLeft > 0) {
      timer = setInterval(() => {
        setFocusSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusSecondsLeft === 0 && isFocusRunning) {
      setIsFocusRunning(false);
    }
    return () => clearInterval(timer);
  }, [isFocusRunning, focusSecondsLeft]);

  // Handlers
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    await dispatchAction('TOGGLE_TODO', { id: taskId, completed: !currentCompleted });
  };

  const handleDeleteTask = async (taskId: string) => {
    await dispatchAction('DELETE_TODO', { id: taskId });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || isSubmittingTask) return;
    setIsSubmittingTask(true);
    try {
      await dispatchAction('ADD_TODO', {
        title: newTaskInput.trim(),
        category: 'Client work',
        priority: 'high',
        dueDate: 'Today'
      });
      setNewTaskInput('');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    await dispatchAction('ADD_NOTE', {
      title: noteTitle.trim(),
      content: noteContent.trim() || 'Quick captured note for tomorrow.',
      category: 'General'
    });
    setNoteTitle('');
    setNoteContent('');
    setIsNoteModalOpen(false);
  };

  const startTaskFocus = (taskTitle: string) => {
    setFocusTaskTitle(taskTitle);
    setFocusSecondsLeft(25 * 60);
    setIsFocusRunning(true);
    setIsFocusModalOpen(true);
  };

  // Metrics calculation
  const tasks = state.tasks || [];
  const remainingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const calendarEvents = state.calendarEvents || [];

  const breakdown = state.productivityBreakdown || {
    score: 91,
    workDoneRate: 94.0,
    habitsRate: 66.7,
    restRecoveryRate: 96.0,
    habitsCompleted: 4,
    totalHabits: 6,
    tasksCompleted: 4,
    tasksTarget: 5,
    deepWorkHours: 7.9,
    deepWorkTarget: 6.0,
    sleepHours: 7.8,
    sleepTarget: 7.5,
    relaxationMinutes: 45,
    relaxationTarget: 45
  };

  // Format focus time
  const focusMinutes = Math.floor(focusSecondsLeft / 60).toString().padStart(2, '0');
  const focusSecs = (focusSecondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* =========================================================================
          TOP HEADER BAR: Serif Date, Filter Pills, Top-Right Quick Actions
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Left: Date Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-none font-normal">
            {currentMonth} <span className="text-rose-400 font-serif">{currentDay}</span>
          </h1>
          <div className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase mt-1.5">
            {currentWeekday} · {currentYear}
          </div>
        </div>

        {/* Center: Filter Pills with Dynamic Time-of-Day Context */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12151b] border border-white/[0.06] rounded-full self-start md:self-auto">
          {(['Morning', 'Work', 'After work', 'Weekend'] as const).map((filter) => {
            const isAutoActive = getAutomaticContext(new Date()) === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setIsAutoMode(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all relative flex items-center gap-1.5 ${
                  activeFilter === filter
                    ? 'bg-white/[0.12] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
                }`}
              >
                <span>{filter}</span>
                {isAutoActive && isAutoMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Automatically determined based on current time & date" />
                )}
              </button>
            );
          })}

          {/* Auto / Manual Mode Badge */}
          <button
            onClick={() => {
              const nextAuto = !isAutoMode;
              setIsAutoMode(nextAuto);
              if (nextAuto) {
                setActiveFilter(getAutomaticContext(new Date()));
              }
            }}
            title={isAutoMode ? "Auto context based on current time/date (click to override)" : "Click to re-enable Auto context"}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition flex items-center gap-1 border ${
              isAutoMode
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoMode ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-neutral-500'}`} />
            <span>{isAutoMode ? 'Auto' : 'Manual'}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'All' ? 'Work' : 'All')}
            title="Toggle All Filter"
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>


        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Status Counter Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12151b] border border-white/[0.06] rounded-full text-xs text-neutral-300 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedTasks.length}</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1 text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{remainingTasks.length}</span>
            </span>
          </div>

          {/* Focus Now Button */}
          <button
            onClick={() => setIsFocusModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#161a22] hover:bg-[#1c222c] border border-white/[0.08] text-white transition shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Focus now</span>
          </button>

          {/* Ask Anything Button (Cmd+E) */}
          <button
            onClick={() => onOpenQuickAction?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#161a22] hover:bg-[#1c222c] border border-white/[0.08] text-white transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ask anything</span>
            <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.06] px-1 py-0.2 rounded ml-1">
              ⌘E
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 1: TODAY SCHEDULE & TASKS CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TODAY SCHEDULE CARD */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/30">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
              <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
                Today
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExtrasDrawer(true)}
                  className="px-2.5 py-1 text-xs rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 transition"
                >
                  See all
                </button>
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="px-2.5 py-1 text-xs rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Quick note</span>
                </button>
              </div>
            </div>

            {/* Timeline Events List */}
            <div className="mt-4 space-y-3">
              {calendarEvents.slice(0, 3).map((event, idx) => {
                const isHighlight = event.isNext || idx === 2;
                return (
                  <div
                    key={event.id || idx}
                    className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
                      isHighlight
                        ? 'bg-white/[0.04] border border-purple-500/20 shadow-xs'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Time Column */}
                    <div className="w-20 shrink-0 text-left font-mono text-xs text-neutral-400 leading-tight">
                      <div>{event.startTime ? (event.startTime.includes('AM') || event.startTime.includes('PM') ? event.startTime : `${event.startTime} AM`) : '09:30 AM'}</div>
                      <div className="text-[11px] text-neutral-400">
                        {event.endTime ? (event.endTime.includes('AM') || event.endTime.includes('PM') ? event.endTime : `${event.endTime} AM`) : '10:00 AM'}
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Status Dot */}
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isHighlight ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-neutral-600'
                          }`}
                        />
                        <span className="text-xs font-medium text-white truncate">
                          {event.title}
                        </span>
                        <Video className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      </div>

                      {/* Attendee / Countdown Badges */}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        {event.attendees && (
                          <span className="text-neutral-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendees}</span>
                          </span>
                        )}
                        {isHighlight && (
                          <span className="text-emerald-400 font-mono text-[11px]">
                            {event.relativeTime || 'in 2h 20m'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] mt-4 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Synced with Google Calendar</span>
            <span className="font-mono text-neutral-400">{calendarEvents.length} events today</span>
          </div>
        </div>

        {/* TASKS CARD */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/30">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
              <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
                Tasks
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">
                  {remainingTasks.length} remaining
                </span>
                <button
                  onClick={() => setShowExtrasDrawer(true)}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5 transition"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Add Inline Input */}
            <form onSubmit={handleCreateTask} className="py-2.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add a task..."
                  className="w-full bg-transparent text-xs text-neutral-200 placeholder-neutral-400 focus:outline-hidden"
                />
              </div>
            </form>

            {/* Task Items List */}
            <div className="mt-2 space-y-1">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Circular Hollow Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <span
                      className={`text-xs truncate transition-all ${
                        task.completed ? 'line-through text-neutral-400' : 'text-neutral-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Scheduled Pill & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.scheduledBadge && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-rose-300 bg-rose-950/40 border border-rose-500/20">
                        <CalendarIcon className="w-2.5 h-2.5" />
                        <span>{task.scheduledBadge}</span>
                      </span>
                    )}

                    {/* Inline Hover Action: Focus Play Button */}
                    <button
                      onClick={() => startTaskFocus(task.title)}
                      title="Start Focus Timer on this task"
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-rose-400/20" />
                    </button>

                    {/* Inline Delete Button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-300 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] mt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Auto-synced with Python habit engine</span>
            <span className="text-emerald-400 font-mono">
              {Math.round((completedTasks.length / (tasks.length || 1)) * 100)}% done today
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: COMPACT 3-COLUMN STRIP (CLOCK, THIS WEEK, CAPTURE)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLOCK CARD */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/30">
          <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
            Clock
          </span>
          <div className="py-2">
            <div className="text-3xl font-sans font-semibold text-white tracking-tight">
              {currentTime}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {currentDateFormatted}
            </div>
          </div>
          <div className="text-[10px] font-mono text-neutral-400">
            UTC+2 · Johannesburg / London Sync
          </div>
        </div>

        {/* THIS WEEK CARD */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
              This Week
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {breakdown.score}% Score
            </span>
          </div>
          <div className="py-2">
            <p className="text-xs text-neutral-300 leading-relaxed">
              This week: <span className="text-white font-medium">{completedTasks.length} to-dos</span> closed,{' '}
              <span className="text-white font-medium">{breakdown.habitsCompleted} routines</span> ran.
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-indigo-500 to-rose-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${breakdown.score}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>7.9h Deep Work</span>
            <span>7.8h Sleep</span>
          </div>
        </div>

        {/* CAPTURE CARD */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/30">
          <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
            Capture
          </span>
          <div className="py-2 flex items-center justify-center">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#161a22] hover:bg-[#1d222d] border border-white/[0.08] text-xs font-medium text-neutral-200 hover:text-white transition shadow-sm text-center"
            >
              Capture a note for tomorrow
            </button>
          </div>
          <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>Cmd+K anytime</span>
            <span>{state.notes?.length || 0} notes saved</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: WEBSITE PULSE & TELEMETRY SECTION
         ========================================================================= */}
      <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase">
              {pulseView === 'website' ? 'Website Pulse' : 'Python Telemetry & Productivity'}
            </span>
            <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setPulseView('website')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  pulseView === 'website' ? 'bg-white/[0.1] text-white' : 'text-neutral-400 hover:text-neutral-300'
                }`}
              >
                Traffic Pulse
              </button>
              <button
                onClick={() => setPulseView('telemetry')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  pulseView === 'telemetry' ? 'bg-white/[0.1] text-white' : 'text-neutral-400 hover:text-neutral-300'
                }`}
              >
                Python Telemetry
              </button>
            </div>
          </div>

          <button
            onClick={onNavigateToPython}
            className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono transition"
          >
            <span>Python 3.10 Engine</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Narrative Headline */}
        <div className="mt-5">
          <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            Summary
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-white tracking-tight mt-1 font-normal">
            {pulseView === 'website'
              ? 'Traffic is up 18% this week'
              : 'Deep Focus Momentum is rising across 7 recorded days'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            {pulseView === 'website'
              ? 'Conversions grew faster than visitors, and organic search did most of the lifting.'
              : 'Statistical linear regression indicates a +0.214 daily trend slope with 0.98 deep work correlation.'}
          </p>
        </div>

        {/* Metric Tiles 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {pulseView === 'website' ? (
            <>
              {/* Tile 1: VISITORS */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Visitors
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  142.8k
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4% this week</span>
                </div>
              </div>

              {/* Tile 2: CONVERSIONS */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Conversions
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  3,840
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+24.1% vs target</span>
                </div>
              </div>

              {/* Tile 3: TRIAL STARTS */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Trial Starts
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  1,290
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.7% velocity</span>
                </div>
              </div>

              {/* Tile 4: BOUNCE RATE */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Bounce Rate
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  28.4%
                </div>
                <div className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                  <span>-3.2% (Optimal)</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Telemetry Tile 1: DEEP WORK */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Deep Focus
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  7.9h
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">
                  Target: 6.0h (131%)
                </div>
              </div>

              {/* Telemetry Tile 2: HABITS */}
              <div
                onClick={onNavigateToHabits}
                className="bg-[#0c0e12] border border-white/[0.06] hover:border-rose-500/40 rounded-xl p-4 cursor-pointer transition group"
                title="Open Habit Tracker Layout"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                    Habit Streaks
                  </div>
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 group-hover:scale-110 transition" />
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1 flex items-center justify-between">
                  <span>{state.habits?.filter(h => h.completed).length || 4} / {state.habits?.length || 6}</span>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                  <span>Open Tracker Layout →</span>
                </div>
              </div>


              {/* Telemetry Tile 3: RECOVERY */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Rest & Sleep
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  7.8h
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">
                  Optimal recovery (92%)
                </div>
              </div>

              {/* Telemetry Tile 4: PRODUCTIVITY */}
              <div className="bg-[#0c0e12] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Index Score
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight mt-1">
                  {breakdown.score}%
                </div>
                <div className="text-[11px] text-indigo-400 font-mono mt-1">
                  Rising (+2.1 pts)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          INTEGRATED LIVE TELEMETRY TRAY (WEATHER, NEWS, EMAIL DIGESTS)
         ========================================================================= */}
      <div className="bg-[#0c0e12] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white">
              Multi-City Weather Radar & Environment
            </span>
          </div>
          <button
            onClick={() => setShowExtrasDrawer(!showExtrasDrawer)}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition"
          >
            <span>{showExtrasDrawer ? 'Collapse Station' : 'Expand All Cities & News'}</span>
          </button>
        </div>

        {/* Multi-city weather strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {(state.cities || []).slice(0, 4).map((city) => (
            <div
              key={city.id}
              className="bg-[#12151b] border border-white/[0.05] rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-white">{city.name}</div>
                <div className="text-[11px] text-neutral-400">{city.condition}</div>
              </div>
              <div className="text-lg font-semibold text-white font-mono">
                {city.temp}°C
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Section */}
        {showExtrasDrawer && (
          <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {/* Curated News */}
            <div className="bg-[#12151b] border border-white/[0.05] rounded-xl p-4">
              <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase pb-2 border-b border-white/[0.05]">
                Curated News Radar
              </div>
              <div className="mt-3 space-y-2.5">
                {(state.newsArticles || []).slice(0, 3).map((art) => (
                  <div key={art.id} className="text-xs">
                    <div className="font-medium text-neutral-200 line-clamp-1">{art.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>{art.source}</span>
                      <span>·</span>
                      <span>{art.readTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Integrations */}
            <div className="bg-[#12151b] border border-white/[0.05] rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  Automated Email Alerts
                </div>
                <button
                  onClick={onNavigateToEmail}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-mono"
                >
                  Open Hub →
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                {(state.emails || []).slice(0, 3).map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <div className="font-medium text-neutral-200 line-clamp-1">{msg.subject}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>{msg.sender}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-mono">{msg.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: FOCUS NOW TIMER
         ========================================================================= */}
      {isFocusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14171d] border border-white/[0.1] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest">
              <Zap className="w-4 h-4 fill-rose-400" />
              <span>Deep Focus Mode</span>
            </div>

            <h3 className="text-base font-semibold text-white mt-1">
              {focusTaskTitle}
            </h3>

            {/* Giant Countdown Display */}
            <div className="py-8 text-center">
              <div className="text-6xl font-mono font-bold text-white tracking-tight">
                {focusMinutes}:{focusSecs}
              </div>
              <div className="text-xs text-neutral-400 mt-2 font-mono">
                {isFocusRunning ? 'Session active · Syncing deep work telemetry' : 'Session paused'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsFocusRunning(!isFocusRunning)}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition"
              >
                {isFocusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isFocusRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button
                onClick={() => {
                  setFocusSecondsLeft(25 * 60);
                  setIsFocusRunning(false);
                }}
                className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 transition"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CAPTURE NOTE FOR TOMORROW
         ========================================================================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14171d] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsNoteModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
              Capture
            </div>
            <h3 className="text-lg font-semibold text-white mt-0.5">
              Note for Tomorrow
            </h3>

            <form onSubmit={handleSaveQuickNote} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 uppercase">
                  Subject / Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Discuss launch checklist with Jordan"
                  className="w-full mt-1 bg-[#0c0e12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-white/[0.2]"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 uppercase">
                  Details & Context
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add thoughts, metrics, or reminders..."
                  rows={4}
                  className="w-full mt-1 bg-[#0c0e12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-400 focus:outline-hidden focus:border-white/[0.2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noteTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-xs font-medium text-white transition shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
