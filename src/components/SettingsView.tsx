import React, { useState } from 'react';
import {
  Settings,
  User,
  Clock,
  Bell,
  Sliders,
  Smartphone,
  Laptop,
  Check,
  Save,
  Shield,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardState } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  state: DashboardState;
  dispatchAction: (action: string, payload: any) => Promise<any>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  dispatchAction
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  // User profile state
  const [name, setName] = useState(state.user?.name || 'Kitso Motlashuping');
  const [email, setEmail] = useState(state.user?.email || 'motlashupingkitso@gmail.com');
  const [role, setRole] = useState(state.user?.role || 'Lead Engineer & Strategist');
  const [timezone, setTimezone] = useState(state.user?.timezone || 'UTC-7 (Pacific)');

  // Preferences state
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(state.preferences?.tempUnit || 'C');
  const [timeOfDayAutoMode, setTimeOfDayAutoMode] = useState<boolean>(
    state.preferences?.timeOfDayAutoMode ?? true
  );
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    state.preferences?.timeFormat || '12h'
  );
  const [pushSound, setPushSound] = useState<boolean>(state.preferences?.pushSound ?? true);
  const [emailWeatherAlerts, setEmailWeatherAlerts] = useState<boolean>(
    state.preferences?.emailWeatherAlerts ?? true
  );
  const [emailCalendarReminders, setEmailCalendarReminders] = useState<boolean>(
    state.preferences?.emailCalendarReminders ?? true
  );
  const [emailNewsDigest, setEmailNewsDigest] = useState<boolean>(
    state.preferences?.emailNewsDigest ?? true
  );

  // Routine times state
  const [morningBriefingTime, setMorningBriefingTime] = useState(
    state.preferences?.routineTimes?.morningBriefing || '07:30'
  );
  const [websitePulseTime, setWebsitePulseTime] = useState(
    state.preferences?.routineTimes?.websitePulse || '08:00'
  );
  const [slackDailySyncTime, setSlackDailySyncTime] = useState(
    state.preferences?.routineTimes?.slackDailySync || '17:00'
  );
  const [dailyWrapUpTime, setDailyWrapUpTime] = useState(
    state.preferences?.routineTimes?.dailyWrapUp || '17:45'
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update user profile
      await dispatchAction('UPDATE_USER', {
        name,
        email,
        role,
        timezone
      });

      // 2. Update preferences
      await dispatchAction('UPDATE_PREFERENCES', {
        tempUnit,
        timeOfDayAutoMode,
        timeFormat,
        pushSound,
        emailWeatherAlerts,
        emailCalendarReminders,
        emailNewsDigest,
        routineTimes: {
          morningBriefing: morningBriefingTime,
          websitePulse: websitePulseTime,
          slackDailySync: slackDailySyncTime,
          dailyWrapUp: dailyWrapUpTime
        }
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
            <span>Control Panel</span>
            <span>·</span>
            <span className="text-rose-400">Settings</span>
            <span>·</span>
            <span>Mesh Synced</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Settings & System Preferences
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Configure profile credentials, automated time-of-day context, routine execution schedules, and device installation.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <span>Saving...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECTION 1: Personal Profile */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <User className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
              Profile & Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Primary Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Role & Designation
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Operating Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60"
              >
                <option value="UTC-7 (Pacific)">UTC-7 (Pacific Daylight / Standard)</option>
                <option value="Africa/Gaborone (UTC+2)">Africa/Gaborone (UTC+2 Central Africa)</option>
                <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York (UTC-5)">America/New_York (UTC-5 Eastern)</option>
                <option value="Europe/London (UTC+0)">Europe/London (UTC+0 GMT/BST)</option>
                <option value="Asia/Tokyo (UTC+9)">Asia/Tokyo (UTC+9 JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Automated Time-of-Day Context */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
                Dynamic Time-of-Day Context Automation
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              Active Scheduler
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <div className="text-xs font-semibold text-white">
                Auto-Switch Context Based on Real Time & Date
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
                When enabled, the header automatically changes between <strong>Morning</strong> (5 AM–9 AM), <strong>Work</strong> (9 AM–5 PM), <strong>After work</strong> (5 PM–5 AM), and <strong>Weekend</strong> (Saturdays & Sundays).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={timeOfDayAutoMode}
                onChange={(e) => setTimeOfDayAutoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Clock Display Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeFormat('12h')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition ${
                    timeFormat === '12h'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-white/[0.02] border-white/[0.05] text-neutral-400'
                  }`}
                >
                  12-Hour (01:10 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFormat('24h')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition ${
                    timeFormat === '24h'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-white/[0.02] border-white/[0.05] text-neutral-400'
                  }`}
                >
                  24-Hour (13:10)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempUnit('C')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition ${
                    tempUnit === 'C'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-white/[0.02] border-white/[0.05] text-neutral-400'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('F')}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition ${
                    tempUnit === 'F'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-white/[0.02] border-white/[0.05] text-neutral-400'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Routine Execution Schedules */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
              Automated Routine Schedules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Morning Briefing Schedule
              </label>
              <input
                type="time"
                value={morningBriefingTime}
                onChange={(e) => setMorningBriefingTime(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">Default: 07:30 AM</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Website Pulse Routine
              </label>
              <input
                type="time"
                value={websitePulseTime}
                onChange={(e) => setWebsitePulseTime(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">Default: 08:00 AM</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Slack Daily Sync Routine
              </label>
              <input
                type="time"
                value={slackDailySyncTime}
                onChange={(e) => setSlackDailySyncTime(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">Default: 17:00 (5:00 PM)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Daily Wrap-up Routine
              </label>
              <input
                type="time"
                value={dailyWrapUpTime}
                onChange={(e) => setDailyWrapUpTime(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-rose-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">Default: 17:45 (5:45 PM)</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Application & PWA Installation */}
        <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
                App Installation & Offline Support
              </h2>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isInstalled
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/[0.05] text-neutral-400'
            }`}>
              {isInstalled ? 'Installed Application' : 'Browser Web App'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <div className="text-xs font-semibold text-white">
                Install OmniSync on Desktop / Mobile
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
                Run OmniSync as a native standalone window with offline precaching, hardware acceleration, and zero browser navigation chrome.
              </p>
            </div>

            {isInstalled ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white shadow-sm transition active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            ) : isIOS ? (
              <div className="text-xs text-neutral-400 font-mono">
                Tap Safari Share <span className="text-white">⎋</span> → "Add to Home Screen"
              </div>
            ) : (
              <div className="text-xs text-neutral-400 font-mono">
                Available in Chrome/Edge/Safari menus
              </div>
            )}
          </div>
        </div>

        {/* Bottom Save Trigger */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>All changes persisted to disk and broadcasted to mesh</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
