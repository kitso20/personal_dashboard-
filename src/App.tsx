/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { HabitTrackerView } from './components/HabitTrackerView';
import { PdfLibraryView } from './components/PdfLibraryView';
import { SettingsView } from './components/SettingsView';
import { PythonStudio } from './components/PythonStudio';
import { EmailHub } from './components/EmailHub';
import { NotificationsCenter } from './components/NotificationsCenter';
import { SyncStreamView } from './components/SyncStreamView';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { GlobalQuickAction } from './components/GlobalQuickAction';
import { ToDoWidget } from './components/widgets/ToDoWidget';
import { HabitsWidget } from './components/widgets/HabitsWidget';
import { NewsWidget } from './components/widgets/NewsWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { RelaxationWidget } from './components/widgets/RelaxationWidget';
import {
  Bell,
  X,
  Activity,
  RefreshCw,
  Laptop,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  Download,
  Flame,
  Settings as SettingsIcon,
  BookOpen,
  Newspaper
} from 'lucide-react';


export default function App() {
  const {
    state,
    devices,
    myClientId,
    status,
    syncLogs,
    activeToast,
    notificationPermission,
    requestNotificationPermission,
    firePushNotification,
    dispatchAction,
    closeToast
  } = useRealtimeSync();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Keyboard shortcut: Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center p-4 select-none">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-pulse">
          <Activity className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
          <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
          <span>Synchronizing Mission Control Dashboard...</span>
        </div>
        <p className="text-xs text-neutral-400 mt-2 font-mono">
          Connecting WebSocket mesh to Python 3.10 engine
        </p>
      </div>
    );
  }

  const unreadAlerts = state.notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-[#090b0e] text-neutral-200 flex overflow-hidden font-sans selection:bg-rose-500/30 selection:text-white">
      {/* Fixed Ambient Light Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[160px]" />
      </div>

      {/* Left Sidebar Navigation */}
      <Sidebar
        state={state}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onQuickAction={(type) => setQuickActionOpen(true)}
        onOpenDevices={() => setIsDeviceModalOpen(true)}
        onFireToast={(title, msg) => firePushNotification(title, msg, 'system')}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 min-w-0">
        {/* Subtle Top Utility Strip */}
        <header className="h-14 border-b border-white/[0.06] bg-[#0c0e12]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                {status === 'connected' ? 'Mesh Synced' : status}
              </span>
            </div>
            <span className="text-neutral-700">·</span>
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
              Python 3.10 Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Mesh Indicator Button */}
            <button
              onClick={() => setIsDeviceModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition"
              title="View connected sync devices"
            >
              <Laptop className="w-3.5 h-3.5 text-neutral-400" />
              <span>{devices.length} {devices.length === 1 ? 'device' : 'devices'}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
              title="Notification alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0c0e12]" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {/* HOME / DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <DashboardOverview
              state={state}
              dispatchAction={dispatchAction}
              onNavigateToPython={() => setActiveTab('workspace')}
              onNavigateToEmail={() => setActiveTab('email')}
              onOpenQuickAction={() => setQuickActionOpen(true)}
            />
          )}

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <h1 className="text-3xl font-serif text-white font-normal">
                    Tasks & Routine Habits
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Real-time synchronized across all client sessions
                  </p>
                </div>
                <button
                  onClick={() => setQuickActionOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-sm transition"
                >
                  + New Task
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ToDoWidget
                  tasks={state.tasks || []}
                  notes={state.notes || []}
                  onAddTodo={(task) => dispatchAction('ADD_TODO', task)}
                  onToggleTodo={(id) => dispatchAction('TOGGLE_TODO', { id })}
                  onDeleteTodo={(id) => dispatchAction('DELETE_TODO', { id })}
                  onDeleteNote={(id) => dispatchAction('DELETE_NOTE', { id })}
                />
                <HabitsWidget
                  habits={state.habits || []}
                  onToggleHabit={(id) => dispatchAction('TOGGLE_HABIT', { id })}
                  onAddHabit={(habit) => dispatchAction('ADD_HABIT', habit)}
                  onDeleteHabit={(id) => dispatchAction('DELETE_HABIT', { id })}
                />
              </div>
            </div>
          )}

          {/* WORKSPACE & PYTHON STUDIO */}
          {activeTab === 'workspace' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <PythonStudio state={state} dispatchAction={dispatchAction} />
              <div className="pt-6">
                <WeatherWidget
                  cities={state.cities || []}
                  tempUnit={state.preferences?.tempUnit || 'C'}
                  onAddCity={(city) => dispatchAction('ADD_CITY', city)}
                  onRemoveCity={(id) => dispatchAction('REMOVE_CITY', { id })}
                  onTogglePin={(id) => dispatchAction('TOGGLE_PIN_CITY', { id })}
                  onToggleUnit={(unit) => dispatchAction('UPDATE_PREFERENCES', { tempUnit: unit })}
                  onSendEmailAlert={(cityId) => dispatchAction('SEND_WEATHER_ALERT_EMAIL', { cityId })}
                />
              </div>
            </div>
          )}

          {/* LIBRARY (NEWS, FACTS, DIGESTS) */}
          {activeTab === 'library' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h1 className="text-3xl font-serif text-white font-normal">
                  Knowledge Library & Briefs
                </h1>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Curated topic feeds, research telemetry, and digests
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewsWidget
                  articles={state.newsArticles || []}
                  selectedTopic={state.selectedNewsTopic || 'All'}
                  customKeywords={state.customNewsKeywords || []}
                  userEmail={state.user?.email || 'motlashupingkitso@gmail.com'}
                  onSelectTopic={(topic) => dispatchAction('SELECT_NEWS_TOPIC', { topic })}
                  onAddKeyword={(keyword) => dispatchAction('ADD_NEWS_KEYWORD', { keyword })}
                  onSendNewsDigest={(topic) => dispatchAction('SEND_NEWS_DIGEST_EMAIL', { topic })}
                />
                <div className="space-y-6">
                  <RelaxationWidget
                    rest={state.rest}
                    onLogRest={(data) => dispatchAction('UPDATE_REST_METRICS', data)}
                    onSendRestEmail={() => dispatchAction('SEND_REST_REMINDER_EMAIL', {})}
                  />
                  <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      Quick Notes Archive
                    </span>
                    <div className="mt-3 space-y-2">
                      {(state.notes || []).map((n) => (
                        <div key={n.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-xs font-medium text-white">{n.title}</div>
                          <p className="text-xs text-neutral-400 mt-1">{n.content}</p>
                          <div className="text-[10px] text-neutral-400 mt-1 font-mono">{n.createdAt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SKILLS & AUTOMATED TRIGGERS */}
          {activeTab === 'skills' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h1 className="text-3xl font-serif text-white font-normal">
                  Skills & Automated Pipelines
                </h1>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Python 3.10 triggers, Z-score thresholds, and push notifications
                </p>
              </div>

              <div className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-white">Active Trigger Rules</span>
                  <span className="text-xs font-mono text-emerald-400">
                    {state.triggers?.filter((t) => t.enabled).length} Enabled
                  </span>
                </div>
                <div className="space-y-2">
                  {(state.triggers || []).map((trig) => (
                    <div
                      key={trig.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div>
                        <div className="text-xs font-medium text-white">{trig.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          If {trig.metric} {trig.condition} {trig.threshold} → notify via {trig.channel}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTES VIEW */}
          {activeTab === 'notes' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <h1 className="text-3xl font-serif text-white font-normal">
                    Executive Notes
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Instant capture synced across connected devices
                  </p>
                </div>
                <button
                  onClick={() => setQuickActionOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-sm transition"
                >
                  + Add Note
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(state.notes || []).map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#101318] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{note.title}</span>
                        <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/[0.04]">
                          {note.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/[0.04] mt-4 text-[10px] text-neutral-400 font-mono flex items-center justify-between">
                      <span>{note.createdAt}</span>
                      <button
                        onClick={() => dispatchAction('DELETE_NOTE', { id: note.id })}
                        className="text-neutral-400 hover:text-rose-400 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL VIEW */}
          {activeTab === 'email' && (
            <EmailHub state={state} dispatchAction={dispatchAction} />
          )}

          {/* NOTIFICATIONS VIEW */}
          {activeTab === 'notifications' && (
            <NotificationsCenter
              state={state}
              dispatchAction={dispatchAction}
              notificationPermission={notificationPermission}
              onRequestPermission={requestNotificationPermission}
              onFireTestPush={firePushNotification}
            />
          )}

          {/* SYNC VIEW */}
          {activeTab === 'sync' && (
            <SyncStreamView
              devices={devices}
              myClientId={myClientId}
              syncLogs={syncLogs}
              status={status}
              dispatchAction={dispatchAction}
            />
          )}
        </main>
      </div>

      {/* Device Mesh Modal */}
      <DeviceSyncModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        devices={devices}
        myClientId={myClientId}
        syncLogs={syncLogs}
        dispatchAction={dispatchAction}
      />

      {/* Global Quick Action Floating Action Button & Modal (Cmd+K / Cmd+E) */}
      <GlobalQuickAction
        dispatchAction={dispatchAction}
        onSuccessToast={(title, msg) => firePushNotification(title, msg, 'system')}
        externalOpen={quickActionOpen}
        onCloseExternal={() => setQuickActionOpen(false)}
      />

      {/* In-App Toast for Push Notifications */}
      {activeToast && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm w-full bg-[#14171d] border border-rose-500/40 rounded-xl p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{activeToast.title}</div>
                <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  {activeToast.message}
                </p>
                <div className="mt-1 text-[10px] text-rose-400 uppercase tracking-wider font-mono">
                  Mission Control Alert · Synced
                </div>
              </div>
            </div>
            <button
              onClick={closeToast}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
