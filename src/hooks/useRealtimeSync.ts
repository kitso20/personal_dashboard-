import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardState, DeviceInfo, NotificationItem } from '../types';
import { playNotificationSound } from '../utils/audio';

export interface SyncLogEvent {
  id: string;
  time: string;
  type: string;
  detail: string;
  direction: 'inbound' | 'outbound';
}

export function useRealtimeSync() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [myClientId, setMyClientId] = useState<string>('');
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'offline'>('reconnecting');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [syncLogs, setSyncLogs] = useState<SyncLogEvent[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const addLog = useCallback((type: string, detail: string, direction: 'inbound' | 'outbound' = 'inbound') => {
    const newLog: SyncLogEvent = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      type,
      detail,
      direction
    };
    setSyncLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      return perm;
    } catch (e) {
      return 'denied';
    }
  }, []);

  // Trigger local push notification
  const firePushNotification = useCallback((title: string, message: string, type: string = 'info') => {
    // 1. Play gentle audio chime
    playNotificationSound();

    // 2. Set active in-app toast
    setActiveToast({ title, message, type });
    setTimeout(() => {
      setActiveToast((current) => (current?.title === title ? null : current));
    }, 4500);

    // 3. Native browser notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        // Fallback inside sandboxed iframes
      }
    }
  }, []);

  // Initialize and connect WebSocket
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Initial HTTP fetch as fallback while WS connects
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (data.state) {
          setState(data.state);
        }
        if (data.devices) {
          setDevices(data.devices);
        }
      })
      .catch((err) => {
        console.warn('Initial state fetch error:', err);
      });

    let isSubscribed = true;

    function connectWs() {
      if (!isSubscribed) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          setStatus('connected');
          addLog('SOCKET_OPEN', `Connected to real-time sync node at ${wsUrl}`);
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case 'INIT':
                setState(msg.state);
                setDevices(msg.devices || []);
                setMyClientId(msg.clientId || '');
                addLog('INIT_SYNC', `Received initial state snapshot (${msg.devices?.length || 0} nodes active)`);
                break;

              case 'STATE_UPDATED':
                setState(msg.data.state);
                addLog('STATE_DELTA', `Action: ${msg.data.action || 'SYNC'} from ${msg.data.sourceDeviceId || 'server'}`);
                break;

              case 'DEVICES_UPDATED':
                setDevices(msg.data || []);
                addLog('DEVICE_MESH', `Active peer nodes updated: ${msg.data?.length || 0} connected`);
                break;

              case 'NOTIFICATION_PUSH':
                firePushNotification(msg.data.title, msg.data.message, msg.data.type);
                addLog('PUSH_DISPATCH', `Pushed notification: "${msg.data.title}"`);
                break;

              case 'PONG':
                break;
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        };

        ws.onclose = () => {
          if (!isSubscribed) return;
          setStatus('reconnecting');
          addLog('DISCONNECTED', 'Connection dropped. Re-establishing link in 2.5s...');
          reconnectTimeoutRef.current = window.setTimeout(connectWs, 2500);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        setStatus('offline');
        reconnectTimeoutRef.current = window.setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    // Heartbeat ping every 25 seconds
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);

    return () => {
      isSubscribed = false;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [addLog, firePushNotification]);

  // Dispatch actions to server (with optimistic update)
  const dispatchAction = useCallback(async (action: string, payload: any) => {
    addLog(action, JSON.stringify(payload).substring(0, 80), 'outbound');

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          payload,
          sourceDeviceId: myClientId
        })
      });

      const data = await res.json();
      if (data.state) {
        setState(data.state);
      }
      return data;
    } catch (err: any) {
      addLog('ACTION_ERROR', `Failed to execute ${action}: ${err.message}`, 'outbound');
      throw err;
    }
  }, [addLog, myClientId]);

  return {
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
    closeToast: () => setActiveToast(null)
  };
}
