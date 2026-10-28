import React, { useState, useEffect } from 'react';
import { Moon, Heart, Coffee, Send, Play, Pause, RotateCcw, Sparkles, CheckCircle2, Bed, Activity } from 'lucide-react';
import { RestAndRelaxation } from '../../types';

interface RelaxationWidgetProps {
  rest: RestAndRelaxation;
  onLogRest: (data: Partial<RestAndRelaxation>) => Promise<void>;
  onSendRestEmail: () => Promise<void>;
}

export const RelaxationWidget: React.FC<RelaxationWidgetProps> = ({
  rest,
  onLogRest,
  onSendRestEmail
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [form, setForm] = useState({
    sleepHours: rest.sleepHours,
    sleepQuality: rest.sleepQuality,
    relaxationMinutes: rest.relaxationMinutes,
    lastRestActivity: rest.lastRestActivity
  });

  // Guided Breathing Session State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [sessionSeconds, setSessionSeconds] = useState(60);

  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          if (prev <= 1) {
            setIsBreathingActive(false);
            // Auto log +2 mins of relaxation
            onLogRest({
              relaxationMinutes: rest.relaxationMinutes + 2,
              lastRestActivity: "Guided 2-minute mindful breathing session"
            });
            return 60;
          }
          return prev - 1;
        });

        setBreathTimer((t) => {
          if (t <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 4;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 6;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase, onLogRest, rest.relaxationMinutes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogRest({
      sleepHours: Number(form.sleepHours),
      sleepQuality: Number(form.sleepQuality),
      relaxationMinutes: Number(form.relaxationMinutes),
      lastRestActivity: form.lastRestActivity
    });
    setIsEditing(false);
  };

  const handleEmailReport = async () => {
    setIsSendingEmail(true);
    try {
      await onSendRestEmail();
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Relaxing, Rest & Recovery</h3>
              <p className="text-[11px] text-slate-400">Pillar 2 of 3: Essential downtime to balance work & prevent burnout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60 font-semibold font-mono">
              {rest.recoveryStatus} ({rest.recoveryScore}%)
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {isEditing ? 'Cancel' : 'Log Rest'}
            </button>
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-3 p-3 bg-slate-950 border border-teal-500/40 rounded-lg space-y-2.5">
            <div className="text-xs font-semibold text-white">Record Rest & Relaxation Telemetry</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Sleep (hrs)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={form.sleepHours}
                  onChange={(e) => setForm({ ...form, sleepHours: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Quality (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.sleepQuality}
                  onChange={(e) => setForm({ ...form, sleepQuality: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Downtime (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={form.relaxationMinutes}
                  onChange={(e) => setForm({ ...form, relaxationMinutes: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Relaxation Activity</label>
              <input
                type="text"
                placeholder="e.g. Park walk, reading fiction, meditation, sauna"
                value={form.lastRestActivity}
                onChange={(e) => setForm({ ...form, lastRestActivity: e.target.value })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium"
              >
                Update Recovery
              </button>
            </div>
          </form>
        )}

        {/* Rest Telemetry Cards */}
        <div className="grid grid-cols-2 gap-3 my-3">
          {/* Sleep Stats */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Bed className="w-3.5 h-3.5 text-indigo-400" /> Sleep Duration
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{rest.sleepQuality}% quality</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{rest.sleepHours}</span>
              <span className="text-xs text-slate-400">/ {rest.sleepTarget}h target</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {rest.sleepHours >= rest.sleepTarget ? "Optimal restorative sleep" : "Rest deficit recorded"}
            </div>
          </div>

          {/* Relaxation Downtime */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Coffee className="w-3.5 h-3.5 text-teal-400" /> Relaxation Downtime
              </span>
              <span className="font-mono text-teal-300 text-[11px]">Today</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{rest.relaxationMinutes}</span>
              <span className="text-xs text-slate-400">/ {rest.relaxationTarget}m target</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 truncate">
              {rest.lastRestActivity}
            </div>
          </div>
        </div>

        {/* Guided Breathing & Relaxation Interactive Session */}
        <div className="p-3 bg-teal-950/20 border border-teal-800/30 rounded-xl flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-1000 ${
              isBreathingActive
                ? breathPhase === 'Inhale'
                  ? 'bg-teal-500/25 text-teal-200 scale-110 shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40'
                  : breathPhase === 'Hold'
                  ? 'bg-indigo-500/25 text-indigo-200 scale-105 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/40'
                  : 'bg-emerald-500/20 text-emerald-200 scale-95 ring-1 ring-emerald-400/30'
                : 'bg-slate-900/80 text-teal-400/70 border border-white/[0.06]'
            }`}>
              {isBreathingActive ? (
                <span className="text-xs font-mono font-bold">{breathTimer}s</span>
              ) : (
                <Moon className="w-4 h-4 text-teal-400" />
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Guided Breathing Pause</span>
                {isBreathingActive && (
                  <span className="text-[10px] font-mono tracking-wider text-teal-300 font-bold">
                    {breathPhase === 'Inhale' ? 'Breathe In...' : breathPhase === 'Hold' ? 'Hold Gently...' : 'Release Slowly...'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBreathingActive
                  ? `${sessionSeconds}s remaining · Calming vagus nerve regulation`
                  : "60-second breathing pause to reset focus and recovery."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-98 flex items-center gap-1.5 ${
              isBreathingActive
                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60'
                : 'bg-teal-600/90 hover:bg-teal-500 text-white shadow-xs hover:shadow-teal-500/20'
            }`}
          >
            {isBreathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isBreathingActive ? 'Stop' : 'Start Pause'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={handleEmailReport}
          disabled={isSendingEmail}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {isSendingEmail ? 'Sending...' : 'Email Rest & Recovery Report'}
        </button>

        <span className="text-[11px] text-slate-500">
          Rest contributes 25% to overall Productivity
        </span>
      </div>
    </div>
  );
};
