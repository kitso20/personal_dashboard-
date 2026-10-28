import React from 'react';
import { Laptop, Smartphone, Tablet, Radio, CheckCircle2, ArrowRight, X, ExternalLink, Zap } from 'lucide-react';
import { DeviceInfo } from '../types';
import { SyncLogEvent } from '../hooks/useRealtimeSync';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceInfo[];
  myClientId: string;
  syncLogs: SyncLogEvent[];
  dispatchAction: (action: string, payload: any) => Promise<any>;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  devices,
  myClientId,
  syncLogs,
  dispatchAction
}) => {
  if (!isOpen) return null;

  const handleSimulateRemoteAction = async () => {
    // Simulates an action originating from a simulated secondary device (e.g. mobile node)
    await dispatchAction('ADD_TASK', {
      title: `Synchronized from Mobile Node (${new Date().toLocaleTimeString()})`,
      priority: 'high',
      category: 'Mobile Sync',
      dueDate: 'Today'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Connected Device Mesh & Sync Nodes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative WebSocket connections synchronized in real-time across all platforms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Connected Nodes */}
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300">
            Active Connected Devices ({devices.length})
          </div>

          <div className="space-y-2">
            {devices.map((device) => {
              const isThisDevice = device.id === myClientId;
              return (
                <div
                  key={device.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    isThisDevice
                      ? 'bg-slate-950 border-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-300 border border-slate-800">
                      {device.deviceType === 'mobile' ? (
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      ) : device.deviceType === 'tablet' ? (
                        <Tablet className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Laptop className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{device.deviceName}</span>
                        {isThisDevice && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            Current Node
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">
                        {device.userAgent}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Connected
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Since {new Date(device.connectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-Time Sync Testing Tools */}
        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-xs font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Cross-Device Live Test Simulator
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Want to see real-time syncing in action? You can open this URL in a second browser window/tab, or click below to simulate an instantaneous mutation from a remote peer:
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleSimulateRemoteAction}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
            >
              Simulate Remote Peer Mutation
            </button>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Open in New Tab
            </button>
          </div>
        </div>

        {/* Live Protocol Logs */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Real-Time WebSocket Protocol Events
          </div>
          <div className="bg-black/60 border border-slate-800 rounded-lg p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5">
            {syncLogs.length === 0 ? (
              <div className="text-slate-600 italic">Listening for WebSocket events...</div>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500">{log.time}</span>
                  <span
                    className={
                      log.direction === 'inbound'
                        ? 'text-cyan-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {log.direction === 'inbound' ? '↓' : '↑'} [{log.type}]
                  </span>
                  <span className="text-slate-300 truncate">{log.detail}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
