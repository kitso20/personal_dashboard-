import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  LayoutGrid,
  BookOpen,
  MessageSquare,
  Sparkles,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Activity,
  Sun,
  Moon,
  BarChart2,
  Newspaper,
  Calendar,
  Folder,
  Layers,
  Gamepad2,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  SlidersHorizontal,
  Flame,
  Settings,
  Download
} from 'lucide-react';
import { DashboardState } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  state: DashboardState;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onQuickAction: (type?: string) => void;
  onOpenDevices: () => void;
  onFireToast?: (title: string, message: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  state,
  activeTab,
  setActiveTab,
  collapsed,
  onToggleCollapse,
  onQuickAction,
  onOpenDevices,
  onFireToast
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [clientWorkOpen, setClientWorkOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const remainingTasks = state.tasks?.filter((t) => !t.completed).length || 0;
  const completedHabits = state.habits?.filter((h) => h.completed).length || 0;

  const handleRunRoutine = (name: string, time: string) => {
    if (name.toLowerCase().includes('habit')) {
      setActiveTab('habits');
      return;
    }
    if (onFireToast) {
      onFireToast(
        `Routine Triggered: ${name}`,
        `Executed automated pipeline scheduled for ${time}.`
      );
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home, shortcut: '⌘1' },
    { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
    { id: 'habits', label: 'Activity', icon: Activity, count: completedHabits },
    { id: 'email', label: 'Messages', icon: MessageSquare, count: state.emails?.filter((e) => !e.read).length, shortcut: '⌘E' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const workspaceItems = [
    { id: 'library', label: 'Library & PDFs', icon: BookOpen, count: (state.documents?.length || 4) },
    { id: 'news', label: 'News Hub', icon: Newspaper },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: remainingTasks },
    { id: 'notes', label: 'Notes', icon: FileText, count: state.notes?.length },
    { id: 'workspace', label: 'Python Studio', icon: BarChart2 }
  ];


  const isLightMode = state.preferences.theme === 'light' || state.preferences.activeLayout === 'personal' || activeTab === 'overview';

  const subtleText = isLightMode ? 'text-slate-500' : 'text-neutral-400';
  const bodyText = isLightMode ? 'text-slate-600' : 'text-neutral-400';
  const strongText = isLightMode ? 'text-slate-900' : 'text-white';
  const hoverRow = isLightMode
    ? 'hover:text-slate-900 hover:bg-slate-200/40'
    : 'hover:text-neutral-200 hover:bg-white/[0.04]';
  const divider = isLightMode ? 'border-slate-200/70' : 'border-white/[0.06]';
  const badge = isLightMode
    ? 'bg-slate-200/70 text-slate-600'
    : 'bg-white/[0.05] text-neutral-400';

  return (
    <aside
      className={`relative z-20 shrink-0 border-r flex flex-col h-screen select-none transition-all duration-200 ${
        isLightMode
          ? 'bg-[#edf5fb]/90 border-slate-200/80 text-slate-700'
          : 'bg-[#0c0e12] border-white/[0.07] text-neutral-300'
      } ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Top Header */}
      <div className={`h-16 border-b flex items-center justify-between px-3.5 ${
        isLightMode ? 'border-slate-200/70' : 'border-white/[0.06]'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-2xl bg-linear-to-tr from-cyan-400 via-indigo-400 to-pink-400 p-[1.5px] shrink-0 shadow-sm shadow-cyan-500/20">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
              isLightMode ? 'bg-white' : 'bg-[#0c0e12]'
            }`}>
              <div className="w-3.5 h-3.5 rounded-full bg-linear-to-tr from-cyan-400 to-indigo-500" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex flex-col">
              <span className={`text-xs font-bold tracking-tight leading-none ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>
                OmniSync
              </span>
              <span className={`text-[9px] uppercase tracking-wider font-medium mt-0.5 ${
                isLightMode ? 'text-slate-500' : 'text-neutral-400 font-mono'
              }`}>
                Personal Hub
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            className={`p-1.5 rounded-lg transition ${
              isLightMode
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'chat') {
                    onQuickAction();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all ${
                  isActive
                    ? isLightMode
                      ? 'bg-sky-100/90 text-sky-800 font-semibold shadow-xs'
                      : 'bg-white/[0.09] text-white font-medium shadow-xs'
                    : isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? isLightMode ? 'text-sky-700' : 'text-white'
                        : isLightMode ? 'text-slate-500' : 'text-neutral-400'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.shortcut && (
                      <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-400' : 'text-neutral-400'}`}>
                        {item.shortcut}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isLightMode ? 'bg-sky-200/60 text-sky-800' : 'bg-white/[0.05] text-neutral-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>


        {/* Section: APPS & HUBS */}
        <div className={`pt-3 pb-1 border-t mt-2 ${divider}`}>
          {!collapsed && (
            <div className={`px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase ${subtleText}`}>
              Apps & Hubs
            </div>
          )}
          <nav className="space-y-0.5">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? isLightMode
                        ? 'bg-sky-100/90 text-sky-800 border border-sky-200/80'
                        : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                      : `${bodyText} ${hoverRow}`
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${badge}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: ROUTINES */}
        {!collapsed && (
          <div className="pt-4 pb-2">
            <div className={`flex items-center justify-between px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase ${subtleText}`}>
              <span>Routines</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onFireToast?.("Routines View", "Showing active automated routine pipelines")}
                  className={`p-0.5 rounded transition ${isLightMode ? 'hover:text-slate-900' : 'hover:text-white'}`}
                  title="Expand routines"
                >
                  <Layers className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onQuickAction('habit')}
                  className={`p-0.5 rounded transition ${isLightMode ? 'hover:text-slate-900' : 'hover:text-white'}`}
                  title="Create new routine"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Group: Client work */}
            <div className="mt-1">
              <button
                onClick={() => setClientWorkOpen(!clientWorkOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded transition ${isLightMode ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/40' : 'text-neutral-300 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <div className="flex items-center gap-1.5">
                  {clientWorkOpen ? (
                    <ChevronDown className={`w-3 h-3 ${subtleText}`} />
                  ) : (
                    <ChevronRight className={`w-3 h-3 ${subtleText}`} />
                  )}
                  <span className="truncate">Client work</span>
                </div>
                <span className={`text-[10px] font-mono ${subtleText}`}>2</span>
              </button>

              {clientWorkOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <div
                    onClick={() => handleRunRoutine("Website Pulse", "8 AM")}
                    className={`flex items-center justify-between px-2.5 py-1 rounded text-[11px] cursor-pointer transition ${isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-rose-400">📈</span>
                      <span className="truncate">Website Pulse</span>
                    </div>
                    <span className={`text-[10px] shrink-0 font-mono ${subtleText}`}>8 AM</span>
                  </div>

                  <div
                    onClick={() => handleRunRoutine("Slack Daily Sync", "Weekdays 5 PM")}
                    className={`flex items-center justify-between px-2.5 py-1 rounded text-[11px] cursor-pointer transition ${isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-sky-400">💬</span>
                      <span className="truncate">Slack Daily ...</span>
                    </div>
                    <span className={`text-[10px] shrink-0 font-mono ${subtleText}`}>Weekdays 5 PM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Flat Routines List */}
            <div className="space-y-0.5 mt-1">
              {[
                { name: 'Weekly Reflection', time: 'Paused', icon: '📓', paused: true },
                { name: 'Morning Briefing', time: '7:30 AM', icon: '☀️' },
                { name: 'Daily Wrap...', time: 'Weekdays 5:45 PM', icon: '🌙' },
                { name: 'Website Analytics Brief', time: '9 AM', icon: '📊' },
                { name: 'AI News Radar', time: 'Custom', icon: '📰' },
                { name: 'Solar Monthly Review', time: 'Custom', icon: '🔆' },
                { name: 'Yearly Operations Re...', time: 'Custom', icon: '📁' }
              ].map((routine, idx) => (
                <div
                  key={idx}
                  onClick={() => handleRunRoutine(routine.name, routine.time)}
                  className={`flex items-center justify-between px-2.5 py-1 rounded text-[11px] cursor-pointer transition group ${isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[12px] opacity-80 group-hover:opacity-100">
                      {routine.icon}
                    </span>
                    <span className="truncate">{routine.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      routine.paused ? `${subtleText} italic` : subtleText
                    }`}
                  >
                    {routine.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className={`p-2 border-t space-y-1 ${divider}`}>
        {/* Tetris / Game shortcut */}
        <button
          onClick={() => {
            if (onFireToast) {
              onFireToast("Mindful Tetris Break", "Take a 5-minute spatial puzzle break to reset focus.");
            }
          }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
            isLightMode
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
          } ${collapsed ? 'justify-center' : ''}`}
          title="Tetris Break"
        >
          <Gamepad2 className={`w-4 h-4 ${subtleText}`} />
          {!collapsed && <span>Tetris</span>}
        </button>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center justify-between p-1.5 rounded-md transition text-left ${
              isLightMode ? 'hover:bg-slate-200/40' : 'hover:bg-white/[0.04]'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                KM
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ${isLightMode ? 'ring-white' : 'ring-[#0c0e12]'}`} />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium truncate ${strongText}`}>
                      {state.user?.name || 'Kitso Motlashuping'}
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 rounded">
                      Pro
                    </span>
                  </div>
                  <span className={`text-[10px] truncate ${subtleText}`}>
                    {state.user?.email || 'motlashupingkitso@gmail.com'}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronUp className={`w-3.5 h-3.5 shrink-0 ${subtleText}`} />
            )}
          </button>

          {/* User popup dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-12 left-0 w-60 bg-[#14171d] border border-white/[0.08] rounded-xl p-2 shadow-2xl z-50 text-xs text-neutral-300 space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase font-mono text-neutral-400 border-b border-white/[0.06] flex items-center justify-between">
                <span>Mission Control</span>
                <span className="text-emerald-400">v4.2</span>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setActiveTab('settings');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/[0.05] flex items-center gap-2 text-white"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-400" />
                <span>Settings & Preferences</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setActiveTab('habits');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/[0.05] flex items-center gap-2"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Habit Tracker Overview</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenDevices();
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/[0.05] flex items-center justify-between"
              >
                <span>Device Mesh</span>
                <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setActiveTab('email');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/[0.05]"
              >
                Email Digest Settings
              </button>

              {isInstallable && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    install();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App on Device</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </aside>
  );
};
