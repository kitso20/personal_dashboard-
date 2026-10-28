import React from 'react';
import { Activity, Bell, Laptop, RefreshCw, Cpu, Layers } from 'lucide-react';
import { DeviceInfo, NotificationItem } from '../types';

interface HeaderProps {
  status: 'connected' | 'reconnecting' | 'offline';
  devices: DeviceInfo[];
  notifications: NotificationItem[];
  onOpenDevices: () => void;
  onOpenNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pythonCalculatedAt?: string;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  devices,
  notifications,
  onOpenDevices,
  onOpenNotifications,
  activeTab,
  setActiveTab
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-white/[0.08] bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500/20 to-teal-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-950">
                <Activity className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white">OmniSync</span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-400 font-normal">
                  Personal Sanctuary
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/60 border border-white/[0.06] rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  activeTab === 'overview'
                    ? 'bg-white/[0.08] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  activeTab === 'python'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Python Studio
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  activeTab === 'email'
                    ? 'bg-white/[0.08] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                Email Hub
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  activeTab === 'notifications'
                    ? 'bg-white/[0.08] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                Push Alerts
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  activeTab === 'sync'
                    ? 'bg-white/[0.08] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                Sync Stream
              </button>
            </nav>
          </div>

          {/* Right Status Badges & Quick Triggers */}
          <div className="flex items-center gap-2.5">
            {/* Live Sync Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/60 border border-white/[0.06] text-xs">
              {status === 'connected' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 text-[11px] font-medium">Live Synced</span>
                </>
              ) : status === 'reconnecting' ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300 text-[11px]">Reconnecting</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-rose-300 text-[11px]">Offline</span>
                </>
              )}
            </div>

            {/* Connected Devices Button */}
            <button
              onClick={onOpenDevices}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-white/[0.05] border border-white/[0.06] rounded-md transition-colors"
              title="Connected devices"
            >
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px]">{Math.max(1, devices.length)} Nodes</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-white/[0.05] border border-white/[0.06] rounded-md transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden items-center gap-1 pb-2.5 overflow-x-auto no-scrollbar text-xs">
          {['overview', 'python', 'email', 'notifications', 'sync'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded text-[11px] capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-900/80 text-slate-400'
              }`}
            >
              {tab === 'overview' ? 'Dashboard' : tab === 'python' ? 'Python' : tab === 'email' ? 'Email' : tab === 'notifications' ? 'Push' : 'Sync'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
