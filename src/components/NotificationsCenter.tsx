import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Check
} from 'lucide-react';
import { DashboardState, TriggerRule } from '../types';

interface NotificationsCenterProps {
  state: DashboardState;
  dispatchAction: (action: string, payload: any) => Promise<any>;
  notificationPermission: NotificationPermission;
  onRequestPermission: () => Promise<string>;
  onFireTestPush: (title: string, message: string, type?: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  state,
  dispatchAction,
  notificationPermission,
  onRequestPermission,
  onFireTestPush
}) => {
  const [testTitle, setTestTitle] = useState('Deep Work Milestone Achieved');
  const [testMessage, setTestMessage] = useState('You completed 7.2 focus hours today! Real-time sync updated.');
  const [testType, setTestType] = useState<'sync' | 'analytics' | 'email' | 'alert'>('analytics');
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<TriggerRule>>({
    name: '',
    metric: 'productivity',
    condition: '<',
    threshold: 80,
    channel: 'push',
    enabled: true
  });

  const triggers = state.triggers || [];
  const notifications = state.notifications || [];

  const handleToggleTrigger = async (trigger: TriggerRule) => {
    await dispatchAction('UPDATE_TRIGGER', {
      ...trigger,
      enabled: !trigger.enabled
    });
  };

  const handleDeleteTrigger = async (id: string) => {
    await dispatchAction('DELETE_TRIGGER', { id });
  };

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.name) return;
    await dispatchAction('UPDATE_TRIGGER', newTrigger);
    setIsAddingTrigger(false);
    setNewTrigger({
      name: '',
      metric: 'productivity',
      condition: '<',
      threshold: 80,
      channel: 'push',
      enabled: true
    });
  };

  const handleFirePush = async () => {
    // Fire locally
    onFireTestPush(testTitle, testMessage, testType);

    // Also broadcast to all connected devices and log on server
    await dispatchAction('TRIGGER_NOTIFICATION', {
      title: testTitle,
      message: testMessage,
      type: testType
    });
  };

  const handleMarkAllRead = async () => {
    await dispatchAction('MARK_NOTIFICATIONS_READ', {});
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Push Notifications & Trigger Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browser native notifications, threshold trigger automation, and cross-device dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' && (
            <button
              onClick={onRequestPermission}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Enable Native Push
            </button>
          )}
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-md text-xs font-medium transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Permission Status Banner */}
      <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              notificationPermission === 'granted'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : notificationPermission === 'denied'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              Browser Web Push Status:
              <span
                className={`uppercase tracking-wide font-mono text-[11px] ${
                  notificationPermission === 'granted'
                    ? 'text-emerald-400'
                    : notificationPermission === 'denied'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {notificationPermission}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {notificationPermission === 'granted'
                ? 'OmniSync is authorized to push native desktop and mobile OS notifications.'
                : notificationPermission === 'denied'
                ? 'Notifications are blocked in your browser settings. In-app audio toasts are active as fallback.'
                : 'Click "Enable Native Push" to receive push notifications even when working in another tab.'}
            </p>
          </div>
        </div>

        {notificationPermission !== 'granted' && (
          <button
            onClick={onRequestPermission}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors whitespace-nowrap"
          >
            Request Permission
          </button>
        )}
      </div>

      {/* Two Column Layout: Push Dispatcher & Automation Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Push Dispatcher */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                Push Notification Tester
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test immediate audio chime, native notification, and multi-device sync
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notification Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alert Category</label>
                <select
                  value={testType}
                  onChange={(e: any) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="analytics">Analytics & Model</option>
                  <option value="sync">Sync & Peer Node</option>
                  <option value="email">Email Briefing</option>
                  <option value="alert">System Threshold</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFirePush}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Push Alert
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Synthesizes Web Audio chime + Native OS toast</span>
            <span>Zero lag</span>
          </div>
        </div>

        {/* Automated Metric Trigger Rules */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Active Automation Triggers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically fire push alerts or email dispatches when metrics breach thresholds
              </p>
            </div>
            <button
              onClick={() => setIsAddingTrigger(true)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
              title="Add trigger"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {triggers.map((trig) => (
              <div
                key={trig.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{trig.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                    <span>{trig.metric}</span>
                    <span>{trig.condition}</span>
                    <span>{trig.threshold}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-400 uppercase">{trig.channel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleTrigger(trig)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      trig.enabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {trig.enabled ? 'Enabled' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDeleteTrigger(trig.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isAddingTrigger && (
            <form onSubmit={handleCreateTrigger} className="mt-3 p-3 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Rule name (e.g., Focus Streak Drop)"
                value={newTrigger.name}
                onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newTrigger.metric}
                  onChange={(e) => setNewTrigger({ ...newTrigger, metric: e.target.value })}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="productivity">productivity</option>
                  <option value="deepWorkHours">deepWorkHours</option>
                  <option value="expenses">expenses</option>
                  <option value="energy">energy</option>
                </select>

                <select
                  value={newTrigger.condition}
                  onChange={(e: any) => setNewTrigger({ ...newTrigger, condition: e.target.value })}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="<">&lt; Less than</option>
                  <option value="<=">&le; Less/equal</option>
                  <option value=">">&gt; Greater than</option>
                  <option value=">=">&ge; Greater/equal</option>
                </select>

                <input
                  type="number"
                  placeholder="Threshold"
                  value={newTrigger.threshold}
                  onChange={(e) => setNewTrigger({ ...newTrigger, threshold: Number(e.target.value) })}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTrigger(false)}
                  className="px-2 py-1 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium"
                >
                  Save Rule
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Notifications History Log */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Notification History</h3>
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-4 transition-colors ${
                notif.read
                  ? 'bg-slate-950/40 border-slate-800/40 text-slate-400'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{notif.title}</span>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </div>
                <p className="mt-0.5 text-slate-400 leading-relaxed">{notif.message}</p>
              </div>

              <span className="text-[11px] text-slate-500 whitespace-nowrap font-mono">
                {notif.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
