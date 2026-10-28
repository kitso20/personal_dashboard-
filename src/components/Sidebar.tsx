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
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: remainingTasks },
    { id: 'habits', label: 'Habit Tracker', icon: Flame, count: completedHabits },
    { id: 'workspace', label: 'Workspace', icon: LayoutGrid },
    { id: 'library', label: 'Library & PDFs', icon: BookOpen, count: (state.documents?.length || 4) },
    { id: 'chat', label: 'Chat', icon: MessageSquare, shortcut: '⌘E' },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'notes', label: 'Notes', icon: FileText, count: state.notes?.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];


  return (
    <aside
      className={`relative z-20 shrink-0 bg-[#0c0e12] border-r border-white/[0.07] flex flex-col h-screen select-none transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-indigo-500 via-rose-500 to-amber-400 p-[1.5px] shrink-0 shadow-sm shadow-rose-950/40">
            <div className="w-full h-full bg-[#0c0e12] rounded-[6.5px] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-linear-to-tr from-rose-500 to-amber-300" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-semibold text-white tracking-tight leading-none">
                Routines
              </span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono mt-0.5">
                Mission Control
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!collapsed && (
            <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded">
              ⌘B
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <nav className="space-y-0.5">
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-white/[0.09] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-300">
                        {item.shortcut}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-1.5 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Section: ROUTINES */}
        {!collapsed && (
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              <span>Routines</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onFireToast?.("Routines View", "Showing active automated routine pipelines")}
                  className="hover:text-white p-0.5 rounded transition"
                  title="Expand routines"
                >
                  <Layers className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onQuickAction('habit')}
                  className="hover:text-white p-0.5 rounded transition"
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
                className="w-full flex items-center justify-between px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.03] rounded transition"
              >
                <div className="flex items-center gap-1.5">
                  {clientWorkOpen ? (
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-neutral-400" />
                  )}
                  <span className="truncate">Client work</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">2</span>
              </button>

              {clientWorkOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  <div
                    onClick={() => handleRunRoutine("Website Pulse", "8 AM")}
                    className="flex items-center justify-between px-2.5 py-1 rounded text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-rose-400">📈</span>
                      <span className="truncate">Website Pulse</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">8 AM</span>
                  </div>

                  <div
                    onClick={() => handleRunRoutine("Slack Daily Sync", "Weekdays 5 PM")}
                    className="flex items-center justify-between px-2.5 py-1 rounded text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-sky-400">💬</span>
                      <span className="truncate">Slack Daily ...</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">Weekdays 5 PM</span>
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
                  className="flex items-center justify-between px-2.5 py-1 rounded text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[12px] opacity-80 group-hover:opacity-100">
                      {routine.icon}
                    </span>
                    <span className="truncate">{routine.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      routine.paused ? 'text-neutral-400 italic' : 'text-neutral-400'
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
      <div className="p-2 border-t border-white/[0.06] space-y-1">
        {/* Tetris / Game shortcut */}
        <button
          onClick={() => {
            if (onFireToast) {
              onFireToast("Mindful Tetris Break", "Take a 5-minute spatial puzzle break to reset focus.");
            }
          }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Tetris Break"
        >
          <Gamepad2 className="w-4 h-4 text-neutral-400" />
          {!collapsed && <span>Tetris</span>}
        </button>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center justify-between p-1.5 rounded-md hover:bg-white/[0.04] transition text-left ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                KM
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c0e12]" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate">
                      {state.user?.name || 'Kitso Motlashuping'}
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 rounded">
                      Pro
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {state.user?.email || 'motlashupingkitso@gmail.com'}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
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
