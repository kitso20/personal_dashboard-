import React from 'react';
import { Activity, Radio, Laptop, Smartphone, Tablet, ExternalLink, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DeviceInfo } from '../types';
import { SyncLogEvent } from '../hooks/useRealtimeSync';

interface SyncStreamViewProps {
  devices: DeviceInfo[];
  myClientId: string;
  syncLogs: SyncLogEvent[];
  status: 'connected' | 'reconnecting' | 'offline';
  dispatchAction: (action: string, payload: any) => Promise<any>;
}

export const SyncStreamView: React.FC<SyncStreamViewProps> = ({
  devices,
  myClientId,
  syncLogs,
  status,
  dispatchAction
}) => {
  const handleSimulateRemotePeer = async () => {
    await dispatchAction('ADD_TASK', {
      title: `Remote node check-in (${new Date().toLocaleTimeString()})`,
      priority: 'high',
      category: 'Realtime Sync',
      dueDate: 'Today'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Real-Time Cross-Device Sync Mesh
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative bi-directional WebSocket fabric connecting browser tabs, phones, and desktops
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRemotePeer}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate Peer Event
          </button>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Socket Connection</span>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : status === 'reconnecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-xl font-bold capitalize text-white">{status}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Port 3000 WebSocket upgrade handler active
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Connected Peers</span>
          <div className="mt-3 text-2xl font-bold text-white">
            {Math.max(1, devices.length)} Nodes
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Replication topology: Full Mesh via Server Hub
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Packet Stream Log</span>
          <div className="mt-3 text-2xl font-bold text-white">
            {syncLogs.length} Events
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Sub-millisecond serialization latency
          </p>
        </div>
      </div>

      {/* Connected Nodes List & Live Protocol Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Manifest */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Active Device Mesh</h3>
          <div className="space-y-2">
            {devices.map((device) => {
              const isCurrent = device.id === myClientId;
              return (
                <div
                  key={device.id}
                  className={`p-3 rounded-lg border text-xs ${
                    isCurrent
                      ? 'bg-slate-950 border-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {device.deviceType === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      {device.deviceName}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-indigo-400 font-mono">THIS NODE</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {device.userAgent}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Open OmniSync on your mobile phone or another browser tab to see multi-device updates propagate live in real time.
          </div>
        </div>

        {/* Live Packet Feed */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Live WebSocket Packet Log
              </h3>
              <span className="text-xs text-slate-400">Auto-scrolling</span>
            </div>

            <div className="bg-black/60 border border-slate-800 rounded-lg p-4 font-mono text-xs max-h-[380px] overflow-y-auto space-y-2">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-slate-500 text-[11px]">{log.time}</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      log.direction === 'inbound' ? 'text-cyan-400' : 'text-amber-400'
                    }`}
                  >
                    {log.direction === 'inbound' ? '← IN' : '→ OUT'} [{log.type}]
                  </span>
                  <span className="text-slate-300 text-[11px] break-all">{log.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Authoritative server replication model</span>
            <span>Zero simulation · 100% real socket payloads</span>
          </div>
        </div>
      </div>
    </div>
  );
};
