/**
 * OmniSync Full-Stack Server
 * Combines Express API, WebSocket real-time syncing across devices,
 * Python analytics engine, habits, rest/relaxation, multi-city weather,
 * calendar, to-dos, news, and fun facts.
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'dashboard_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState: any = {
  user: {
    name: "Kitso Motlashuping",
    email: "motlashupingkitso@gmail.com",
    role: "Lead Engineer & Strategist",
    timezone: "UTC-7 (Pacific)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  preferences: {
    theme: "dark",
    tempUnit: "C",
    emailDigestSchedule: "08:00 daily",
    pushSound: true,
    realtimeSync: true,
    emailWeatherAlerts: true,
    emailCalendarReminders: true,
    emailNewsDigest: true,
    emailRestReminders: true
  },
  activeWidgets: {
    habits: true,
    rest: true,
    weather: true,
    calendar: true,
    todos: true,
    news: true,
    funfacts: true,
    analytics: true
  },
  habits: [
    {
      id: "habit-1",
      name: "Morning Deep Work Session (2h+)",
      category: "focus",
      streak: 9,
      completed: true,
      history: [true, true, true, true, true, true, true]
    },
    {
      id: "habit-2",
      name: "System Architecture & Code Review",
      category: "focus",
      streak: 6,
      completed: true,
      history: [true, false, true, true, true, true, true]
    },
    {
      id: "habit-3",
      name: "Mindful Downtime & Screen-Free Rest",
      category: "rest",
      streak: 12,
      completed: true,
      history: [true, true, true, true, true, true, true]
    },
    {
      id: "habit-4",
      name: "Hydration (2.5L Water Intake)",
      category: "health",
      streak: 15,
      completed: true,
      history: [true, true, true, true, true, true, true]
    },
    {
      id: "habit-5",
      name: "Physical Exercise / 30m Movement",
      category: "health",
      streak: 4,
      completed: false,
      history: [false, true, true, true, false, true, false]
    },
    {
      id: "habit-6",
      name: "Read Technical Research Papers",
      category: "learning",
      streak: 8,
      completed: false,
      history: [true, true, true, false, true, true, false]
    }
  ],
  rest: {
    sleepHours: 7.8,
    sleepTarget: 7.5,
    sleepQuality: 89,
    relaxationMinutes: 45,
    relaxationTarget: 45,
    lastRestActivity: "Evening unhurried walk & novel reading",
    recoveryScore: 92,
    recoveryStatus: "Optimal"
  },
  productivityBreakdown: {
    score: 91,
    workDoneRate: 94.0,
    habitsRate: 66.7,
    restRecoveryRate: 96.0,
    habitsCompleted: 4,
    totalHabits: 6,
    tasksCompleted: 4,
    tasksTarget: 5,
    deepWorkHours: 7.9,
    deepWorkTarget: 6.0,
    sleepHours: 7.8,
    sleepTarget: 7.5,
    relaxationMinutes: 45,
    relaxationTarget: 45,
    formula: "40% Work Done (4 tasks, 7.9h focus) + 35% Habits (4/6) + 25% Rest (7.8h sleep, 45m relaxation)"
  },
  cities: [
    {
      id: "city-london",
      name: "London",
      country: "UK",
      temp: 14,
      feelsLike: 12,
      condition: "Rainy",
      humidity: 82,
      windSpeed: 19,
      uvIndex: 2,
      high: 16,
      low: 9,
      forecast: [
        { day: "Thu", temp: 15, condition: "Cloudy" },
        { day: "Fri", temp: 13, condition: "Rainy" },
        { day: "Sat", temp: 17, condition: "Partly Cloudy" },
        { day: "Sun", temp: 18, condition: "Sunny" },
        { day: "Mon", temp: 15, condition: "Windy" }
      ],
      isPinned: true,
      alert: "Rain expected continuously until 16:30 BST."
    },
    {
      id: "city-nyc",
      name: "New York",
      country: "USA",
      temp: 19,
      feelsLike: 18,
      condition: "Partly Cloudy",
      humidity: 58,
      windSpeed: 14,
      uvIndex: 5,
      high: 22,
      low: 12,
      forecast: [
        { day: "Thu", temp: 20, condition: "Sunny" },
        { day: "Fri", temp: 21, condition: "Partly Cloudy" },
        { day: "Sat", temp: 18, condition: "Rainy" },
        { day: "Sun", temp: 16, condition: "Sunny" },
        { day: "Mon", temp: 19, condition: "Sunny" }
      ],
      isPinned: true,
      alert: null
    },
    {
      id: "city-tokyo",
      name: "Tokyo",
      country: "Japan",
      temp: 21,
      feelsLike: 20,
      condition: "Sunny",
      humidity: 52,
      windSpeed: 11,
      uvIndex: 6,
      high: 23,
      low: 15,
      forecast: [
        { day: "Thu", temp: 22, condition: "Sunny" },
        { day: "Fri", temp: 24, condition: "Partly Cloudy" },
        { day: "Sat", temp: 20, condition: "Rainy" },
        { day: "Sun", temp: 22, condition: "Sunny" },
        { day: "Mon", temp: 21, condition: "Partly Cloudy" }
      ],
      isPinned: false,
      alert: null
    },
    {
      id: "city-johannesburg",
      name: "Johannesburg",
      country: "South Africa",
      temp: 26,
      feelsLike: 27,
      condition: "Sunny",
      humidity: 38,
      windSpeed: 13,
      uvIndex: 8,
      high: 28,
      low: 14,
      forecast: [
        { day: "Thu", temp: 27, condition: "Sunny" },
        { day: "Fri", temp: 28, condition: "Thunderstorm" },
        { day: "Sat", temp: 25, condition: "Partly Cloudy" },
        { day: "Sun", temp: 26, condition: "Sunny" },
        { day: "Mon", temp: 27, condition: "Sunny" }
      ],
      isPinned: false,
      alert: "High UV warning (Index: 8). Sun protection recommended."
    }
  ],
  calendarEvents: [
    {
      id: "cal-1",
      title: "Product sync",
      date: "2026-10-28",
      startTime: "09:30",
      endTime: "10:00",
      category: "work",
      location: "Google Meet",
      attendees: 3,
      description: "Review sprint deliverables and architecture milestones.",
      emailNotification: true,
      completed: true
    },
    {
      id: "cal-2",
      title: "Design review",
      date: "2026-10-28",
      startTime: "11:00",
      endTime: "11:45",
      category: "work",
      location: "Google Meet",
      attendees: 1,
      description: "Evaluate high-density dark UI specifications.",
      emailNotification: true,
      completed: true
    },
    {
      id: "cal-3",
      title: "1:1 with Alex Morgan",
      date: "2026-10-28",
      startTime: "15:30",
      endTime: "16:00",
      category: "work",
      location: "Google Meet",
      attendees: 2,
      isNext: true,
      relativeTime: "in 2h 20m",
      description: "Quarterly strategy sync & roadmap alignment.",
      emailNotification: true,
      completed: false
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Send Sam the revised quote",
      category: "Client work",
      completed: false,
      priority: "high",
      dueDate: "Today",
      notes: "Follow up with finalized deliverables."
    },
    {
      id: "task-2",
      title: "Confirm the launch date with Jordan",
      category: "Client work",
      completed: false,
      priority: "high",
      dueDate: "Today",
      notes: "Confirm cloud deployment schedule."
    },
    {
      id: "task-3",
      title: "Send the weekly metrics recap",
      category: "Operations",
      completed: false,
      priority: "medium",
      dueDate: "Friday",
      scheduledBadge: "Runs Fri 9 Oct 09:00",
      notes: "Include traffic surge and conversion breakdown."
    },
    {
      id: "task-4",
      title: "Review the Q3 planning doc",
      category: "Planning",
      completed: false,
      priority: "medium",
      dueDate: "Today",
      notes: "Check milestones and dependencies."
    },
    {
      id: "task-5",
      title: "Review multi-city weather telemetry alerts",
      category: "Work",
      completed: true,
      priority: "high",
      dueDate: "Today",
      notes: "Checked precipitation radar for London and Johannesburg."
    }
  ],
  notes: [
    {
      id: "note-1",
      title: "System Architecture Insight",
      content: "WebSocket connection handles delta replication while Python executes statistical regression in <1ms.",
      category: "Engineering",
      createdAt: "Today at 08:15"
    }
  ],
  newsArticles: [
    {
      id: "news-1",
      topic: "AI & Tech",
      title: "Next-Gen Multi-Agent Architectures Outperform Monolithic LLMs in Complex Logic",
      source: "ArXiv Tech Brief",
      timeAgo: "25m ago",
      summary: "Distributed agent swarms with isolated specialized responsibilities achieve 42% higher synthesis accuracy with lower token footprint.",
      readTime: "4 min read",
      url: "https://example.com/ai-agents"
    },
    {
      id: "news-2",
      topic: "Python & Dev",
      title: "Python Subinterpreters and the Removal of the GIL: What High-Concurrency Engineers Need to Know",
      source: "Python Engineering Journal",
      timeAgo: "1h ago",
      summary: "PEP 703 and free-threaded CPython builds unlock true multi-core CPU scaling for analytical computing pipelines.",
      readTime: "6 min read",
      url: "https://example.com/python-gil"
    },
    {
      id: "news-3",
      topic: "Science & Space",
      title: "James Webb Space Telescope Identifies Atmospheric Carbon Dioxide on Distant Habitable-Zone Exoplanet",
      source: "Astrophysical Letters",
      timeAgo: "3h ago",
      summary: "Spectroscopic transmission readings confirm atmospheric stability and photochemical equilibria 120 light years away.",
      readTime: "5 min read",
      url: "https://example.com/jwst-exoplanet"
    }
  ],
  selectedNewsTopic: "All",
  customNewsKeywords: ["Quantum Computing", "Edge AI", "Rest Science"],
  funFacts: [
    {
      id: "fact-1",
      category: "Tech & Python",
      fact: "Python is named after the British comedy troupe Monty Python, not the snake genus.",
      didYouKnow: "Guido van Rossum was reading the published scripts from 'Monty Python's Flying Circus' when he began developing the language in December 1989.",
      likes: 42,
      isSaved: true
    },
    {
      id: "fact-2",
      category: "Science",
      fact: "During deep sleep, the brain's glymphatic system clears metabolic waste twice as fast as during wakefulness.",
      didYouKnow: "Resting and relaxation literally physically detoxify your brain cells and consolidate long-term memory.",
      likes: 58,
      isSaved: true
    },
    {
      id: "fact-3",
      category: "Nature & Space",
      fact: "Venus is the only planet in our solar system that spins clockwise (retrograde rotation).",
      didYouKnow: "A day on Venus (243 Earth days) is longer than its entire year around the Sun (225 Earth days).",
      likes: 67,
      isSaved: true
    }
  ],
  currentFactIndex: 0,
  timeSeries: [
    { date: "2026-10-22", productivity: 82, deepWorkHours: 5.2, energy: 72, expenses: 42.50, tasksDone: 6 },
    { date: "2026-10-23", productivity: 86, deepWorkHours: 6.0, energy: 78, expenses: 38.00, tasksDone: 7 },
    { date: "2026-10-24", productivity: 89, deepWorkHours: 6.8, energy: 84, expenses: 95.20, tasksDone: 9 },
    { date: "2026-10-25", productivity: 94, deepWorkHours: 7.5, energy: 88, expenses: 24.00, tasksDone: 10 },
    { date: "2026-10-26", productivity: 88, deepWorkHours: 5.8, energy: 80, expenses: 145.00, tasksDone: 7 },
    { date: "2026-10-27", productivity: 92, deepWorkHours: 7.2, energy: 86, expenses: 52.80, tasksDone: 8 },
    { date: "2026-10-28", productivity: 91, deepWorkHours: 7.9, energy: 90, expenses: 35.00, tasksDone: 11 }
  ],
  emails: [
    {
      id: "em-101",
      sender: "Apex Cloud Services <alerts@apexcloud.io>",
      subject: "Production cluster scale event: +4 worker pods active",
      snippet: "Autoscaler automatically expanded cluster 'eu-prod-core' following real-time traffic spike...",
      body: "Hello Kitso,\n\nYour production cluster 'eu-prod-core' automatically provisioned 4 additional worker nodes following an ingress spike. Current cluster health is 99.98% with 0 dropped frames.\n\nLatency: 14ms\nSync State: Clean\n\nNo manual intervention is required at this time.\n\nBest,\nApex Cloud Operations",
      timestamp: "10 mins ago",
      date: "2026-10-28T14:55:00Z",
      read: false,
      priority: "high",
      tags: ["Infrastructure", "Alert"],
      starred: true
    }
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Real-time sync established",
      message: "Sync node connected across registered client devices.",
      type: "sync",
      timestamp: "Just now",
      read: false
    },
    {
      id: "notif-r1",
      title: "Rest & Recovery Optimal",
      message: "7.8h sleep and 45m relaxation logged. Productivity formula updated.",
      type: "rest",
      timestamp: "8m ago",
      read: false
    }
  ],
  triggers: [
    { id: "trig-1", name: "Productivity Dip Alert", metric: "productivity", condition: "<", threshold: 75, channel: "push", enabled: true },
    { id: "trig-2", name: "Deep Work Target Milestone", metric: "deepWorkHours", condition: ">=", threshold: 7.0, channel: "push", enabled: true },
    { id: "trig-3", name: "High Expense Warning", metric: "expenses", condition: ">", threshold: 100, channel: "email", enabled: true }
  ],
  pythonAnalytics: null as any,
  documents: [
    {
      id: "doc-1",
      title: "Q3 Strategic Architecture & Python Engine Spec (v4.2)",
      category: "Architecture",
      fileSize: "1.4 MB",
      pages: 18,
      uploadedAt: "Oct 24, 2026",
      author: "Kitso Motlashuping",
      readingTime: "14 min",
      description: "Comprehensive technical blueprint covering the Python 3.10 analytics daemon, real-time WebSocket mesh synchronization, and Z-score outlier detection.",
      contentSections: [
        {
          heading: "1. Executive Summary & Topology",
          text: "OmniSync couples a local Express 4 proxy gateway with a persistent Python 3.10 analytical engine. Connected client nodes maintain full duplex bidirectional state replication via low-latency WebSockets. Local SQLite/JSON mirrors guarantee zero-latency optimistic UI renders and offline operation."
        },
        {
          heading: "2. Real-Time Mesh Synchronization Protocol",
          text: "State mutations follow a transactional Command pattern. Each action payload transmits device fingerprint, Lamport logical timestamp, and differential entity keys. Conflicts resolve via server-authoritative reconciliation, emitting immediate push notifications across all active device peers."
        },
        {
          heading: "3. Least-Squares Linear Projection Engine",
          text: "Daily time-series telemetry computes trend slopes using numpy-equivalent least squares regression: slope = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²). The R² coefficient measures predictive reliability over 7-day rolling horizons."
        },
        {
          heading: "4. Anomaly Detection & Adaptive Thresholds",
          text: "The telemetry pipeline calculates rolling standard deviation σ and dynamic Z-score Z = (x - μ) / σ. Data points exceeding |Z| ≥ 2.0 trigger prioritized alerts across push notifications and executive email digests."
        }
      ]
    },
    {
      id: "doc-2",
      title: "Mission Control Operations & Protocol Manual",
      category: "Manual",
      fileSize: "2.1 MB",
      pages: 24,
      uploadedAt: "Oct 21, 2026",
      author: "Kitso Motlashuping",
      readingTime: "18 min",
      description: "Operational standard operating procedures for zero-downtime client sync, automated failovers, and routine trigger dispatch.",
      contentSections: [
        {
          heading: "1. Operational Tenets",
          text: "Mission Control prioritizes instantaneous feedback, deterministic data persistence, and ergonomic cognitive dashboards. Every critical metric must be reachable within one keystroke or glance."
        },
        {
          heading: "2. Routine Dispatch & Pipeline Execution",
          text: "Automated routines (Morning Briefing, Website Pulse, Slack Sync, Daily Wrap-up) trigger on cron-aligned scheduler intervals. Failure fallbacks gracefully log incident traces to the internal telemetry buffer without disrupting user interactions."
        },
        {
          heading: "3. PWA Offline-First Integrity",
          text: "Service worker caches app shell assets, fonts, and core documents. Offline mutations queue into indexed client buffers and flush automatically once network mesh connectivity re-establishes."
        }
      ]
    },
    {
      id: "doc-3",
      title: "High-Performance Habit & Focus Engineering Guide",
      category: "Strategy",
      fileSize: "980 KB",
      pages: 12,
      uploadedAt: "Oct 18, 2026",
      author: "Mission Control Research",
      readingTime: "9 min",
      description: "Scientific handbook for habit stacking, circadian rhythm alignment, and 90-minute ultradian deep work blocks.",
      contentSections: [
        {
          heading: "1. Ultradian Rhythm Optimization",
          text: "Human cognitive performance operates on 90-to-120 minute ultradian cycles. Scheduling deep focus sprints in 90-minute windows separated by 15-minute screen-free rest resets dopamine baseline and prevents late-afternoon cognitive fatigue."
        },
        {
          heading: "2. Habit Momentum & Consistency Multipliers",
          text: "Micro-habits stacked onto existing biological anchors (e.g., hydration immediately upon waking, 5-minute reflection prior to evening dinner) display a 4.2x higher 30-day retention rate compared to unanchored resolutions."
        },
        {
          heading: "3. Cognitive Restoration Protocols",
          text: "Rest is an active biological prerequisite for deep work. Non-sleep deep rest (NSDR), twilight walks, and 7.5+ hours of consolidated sleep drive memory consolidation and peak neural throughput."
        }
      ]
    },
    {
      id: "doc-4",
      title: "Clean Energy Grid & Solar Infrastructure Briefing 2026",
      category: "Report",
      fileSize: "3.6 MB",
      pages: 32,
      uploadedAt: "Oct 12, 2026",
      author: "Global Infrastructure Group",
      readingTime: "22 min",
      description: "Technical feasibility analysis on solar array telemetry, battery storage degradation, and distributed microgrid orchestration.",
      contentSections: [
        {
          heading: "1. Distributed Microgrid Photovoltaic Telemetry",
          text: "Decentralized solar microgrids utilize automated irradiance sensors and MPPT charge controllers to maximize generation efficiency across variable atmospheric conditions."
        },
        {
          heading: "2. Storage Degradation & Thermal Management",
          text: "Lithium iron phosphate (LFP) energy storage cells maintain 80% capacity retention over 6,000 cycles when operational temperatures remain strictly regulated between 20°C and 25°C."
        }
      ]
    }
  ]
};

let dashboardState = { ...defaultState };

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      dashboardState = {
        ...defaultState,
        ...loaded,
        activeWidgets: { ...defaultState.activeWidgets, ...(loaded.activeWidgets || {}) },
        habits: loaded.habits || defaultState.habits,
        rest: loaded.rest || defaultState.rest,
        documents: loaded.documents || defaultState.documents,
        user: { ...defaultState.user, ...(loaded.user || {}) },
        preferences: { ...defaultState.preferences, ...(loaded.preferences || {}) }
      };
    } else {
      saveState();
    }
  } catch (err) {
    console.error('Failed to load state from disk:', err);
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(dashboardState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist state:', err);
  }
}

loadState();

// Run Python engine
function runPythonEngine(action: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(process.cwd(), 'backend', 'analytics_engine.py');
    const child = spawn('python3', [pythonScript, action, JSON.stringify(payload)]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python JSON output: ${stdout}\nStderr: ${stderr}`));
      }
    });

    child.on('error', (err) => { reject(err); });
  });
}

async function refreshPythonAnalytics() {
  try {
    const results = await runPythonEngine('analyze', {
      timeSeries: dashboardState.timeSeries,
      habits: dashboardState.habits,
      tasks: dashboardState.tasks,
      rest: dashboardState.rest
    });
    dashboardState.pythonAnalytics = results;
    if (results.productivityBreakdown) {
      dashboardState.productivityBreakdown = results.productivityBreakdown;
    }
    saveState();
  } catch (err) {
    console.warn('Python analytics run failed:', err);
  }
}

refreshPythonAnalytics();

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

interface ConnectedClient {
  id: string;
  ws: WebSocket;
  userAgent: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectedAt: string;
  lastPing: number;
}

const activeClients = new Map<WebSocket, ConnectedClient>();

function getActiveDevicesList() {
  const list: any[] = [];
  activeClients.forEach((client) => {
    list.push({
      id: client.id,
      deviceName: client.deviceName,
      deviceType: client.deviceType,
      userAgent: client.userAgent,
      connectedAt: client.connectedAt,
      online: true
    });
  });
  return list;
}

function broadcast(eventType: string, data: any, excludeWs?: WebSocket) {
  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  });

  activeClients.forEach((client, clientWs) => {
    if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

wss.on('connection', (ws: WebSocket, req) => {
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (isTablet) deviceType = 'tablet';
  else if (isMobile) deviceType = 'mobile';

  let deviceName = 'Desktop Workstation';
  if (/macintosh/i.test(userAgent)) deviceName = 'MacBook Pro';
  else if (/windows/i.test(userAgent)) deviceName = 'Windows PC';
  else if (/iphone/i.test(userAgent)) deviceName = 'iPhone 15';
  else if (/android/i.test(userAgent)) deviceName = 'Android Mobile';

  const clientId = 'dev-' + Math.random().toString(36).substring(2, 9);
  const clientInfo: ConnectedClient = {
    id: clientId,
    ws,
    userAgent,
    deviceName,
    deviceType,
    connectedAt: new Date().toISOString(),
    lastPing: Date.now()
  };

  activeClients.set(ws, clientInfo);

  ws.send(JSON.stringify({
    type: 'INIT',
    clientId,
    devices: getActiveDevicesList(),
    state: dashboardState
  }));

  broadcast('DEVICES_UPDATED', getActiveDevicesList());

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());
      if (msg.type === 'PING') {
        clientInfo.lastPing = Date.now();
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    activeClients.delete(ws);
    broadcast('DEVICES_UPDATED', getActiveDevicesList());
  });

  ws.on('error', () => {
    activeClients.delete(ws);
  });
});

app.get('/api/state', (req: Request, res: Response) => {
  res.json({
    state: dashboardState,
    devices: getActiveDevicesList()
  });
});

app.post('/api/action', async (req: Request, res: Response) => {
  try {
    const { action, payload, sourceDeviceId } = req.body;
    let notifyTitle = '';
    let notifyMessage = '';
    let notifyType = 'sync';

    switch (action) {
      // Habits Actions
      case 'TOGGLE_HABIT': {
        const habit = dashboardState.habits.find((h: any) => h.id === payload.id);
        if (habit) {
          habit.completed = !habit.completed;
          habit.streak = habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1);
          notifyTitle = habit.completed ? 'Habit Completed' : 'Habit Reopened';
          notifyMessage = `${habit.name} (Streak: ${habit.streak} days)`;
          notifyType = 'habit';
        }
        await refreshPythonAnalytics();
        break;
      }

      case 'ADD_HABIT': {
        const newHabit = {
          id: 'habit-' + Date.now(),
          name: payload.name,
          category: payload.category || 'focus',
          streak: 1,
          completed: false,
          history: [false, false, false, false, false, false, false]
        };
        dashboardState.habits.push(newHabit);
        notifyTitle = 'New Habit Tracked';
        notifyMessage = newHabit.name;
        notifyType = 'habit';
        await refreshPythonAnalytics();
        break;
      }

      case 'DELETE_HABIT': {
        dashboardState.habits = dashboardState.habits.filter((h: any) => h.id !== payload.id);
        await refreshPythonAnalytics();
        break;
      }

      // Rest & Relaxation Actions
      case 'LOG_REST_SESSION': {
        dashboardState.rest = {
          ...dashboardState.rest,
          sleepHours: payload.sleepHours ?? dashboardState.rest.sleepHours,
          sleepQuality: payload.sleepQuality ?? dashboardState.rest.sleepQuality,
          relaxationMinutes: payload.relaxationMinutes ?? dashboardState.rest.relaxationMinutes,
          lastRestActivity: payload.lastRestActivity || dashboardState.rest.lastRestActivity,
          recoveryScore: Math.min(100, Math.round(((payload.sleepHours ?? 7.5) / 7.5) * 60 + ((payload.relaxationMinutes ?? 45) / 45) * 40)),
          recoveryStatus: (payload.sleepHours ?? 7.5) >= 7.0 && (payload.relaxationMinutes ?? 45) >= 30 ? "Optimal" : "Balanced"
        };
        notifyTitle = 'Rest & Recovery Logged';
        notifyMessage = `${dashboardState.rest.sleepHours}h sleep & ${dashboardState.rest.relaxationMinutes}m downtime. Productivity updated.`;
        notifyType = 'rest';
        await refreshPythonAnalytics();
        break;
      }

      case 'SEND_REST_EMAIL_ADVISORY': {
        const emailMsg = {
          id: 'em-rest-' + Date.now(),
          sender: "OmniSync Rest & Recovery Subsystem <rest@omnisync.internal>",
          subject: `Rest & Recovery Advisory: ${dashboardState.rest.recoveryStatus} (${dashboardState.rest.recoveryScore}% Score)`,
          snippet: `Daily rest metrics: ${dashboardState.rest.sleepHours}h sleep, ${dashboardState.rest.relaxationMinutes}m relaxation...`,
          body: `OmniSync Holistic Recovery Report\n\nProductivity is balanced across Work Done, Daily Habits, and Rest.\n\nSleep Logged: ${dashboardState.rest.sleepHours} hrs (Target: ${dashboardState.rest.sleepTarget} hrs)\nSleep Quality: ${dashboardState.rest.sleepQuality}%\nRelaxation & Downtime: ${dashboardState.rest.relaxationMinutes} mins\nLast Activity: ${dashboardState.rest.lastRestActivity}\nRecovery Status: ${dashboardState.rest.recoveryStatus}\n\nTip: Consistent downtime consolidates deep focus hours and maintains neural plasticity.`,
          timestamp: "Just now",
          date: new Date().toISOString(),
          read: false,
          priority: "medium" as const,
          tags: ["Rest", "Recovery", "Health"],
          starred: false
        };
        dashboardState.emails.unshift(emailMsg);
        notifyTitle = 'Rest Advisory Dispatched';
        notifyMessage = `Sent recovery briefing to ${dashboardState.user.email}`;
        notifyType = 'email';
        break;
      }

      // To-Do Actions
      case 'TOGGLE_TODO': {
        const task = dashboardState.tasks.find((t: any) => t.id === payload.id);
        if (task) {
          task.completed = !task.completed;
          notifyTitle = task.completed ? 'Task Completed' : 'Task Reopened';
          notifyMessage = task.title;
          notifyType = 'sync';
        }
        await refreshPythonAnalytics();
        break;
      }

      case 'ADD_TODO': {
        const newTodo = {
          id: 'task-' + Date.now(),
          title: payload.title,
          category: payload.category || 'Work',
          completed: false,
          priority: payload.priority || 'medium',
          dueDate: payload.dueDate || 'Today',
          notes: payload.notes || ''
        };
        dashboardState.tasks.unshift(newTodo);
        notifyTitle = 'To-Do Added';
        notifyMessage = newTodo.title;
        await refreshPythonAnalytics();
        break;
      }

      case 'DELETE_TODO': {
        dashboardState.tasks = dashboardState.tasks.filter((t: any) => t.id !== payload.id);
        await refreshPythonAnalytics();
        break;
      }

      // Quick Notes Actions
      case 'ADD_NOTE': {
        const newNote = {
          id: 'note-' + Date.now(),
          title: payload.title || 'Quick Note',
          content: payload.content || '',
          category: payload.category || 'General',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        dashboardState.notes = dashboardState.notes || [];
        dashboardState.notes.unshift(newNote);
        notifyTitle = 'Quick Note Logged';
        notifyMessage = newNote.title;
        notifyType = 'sync';
        break;
      }

      case 'DELETE_NOTE': {
        dashboardState.notes = (dashboardState.notes || []).filter((n: any) => n.id !== payload.id);
        break;
      }

      // Weather Actions
      case 'ADD_CITY': {
        const cityId = 'city-' + payload.name.toLowerCase().replace(/\s+/g, '-');
        const conditions: any[] = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Windy'];
        const randomCond = conditions[Math.floor(Math.random() * conditions.length)];
        const baseTemp = payload.temp || Math.floor(Math.random() * 15) + 12;

        const newCity = {
          id: cityId,
          name: payload.name,
          country: payload.country || 'Global',
          temp: baseTemp,
          feelsLike: baseTemp - 1,
          condition: payload.condition || randomCond,
          humidity: Math.floor(Math.random() * 40) + 45,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          uvIndex: Math.floor(Math.random() * 7) + 2,
          high: baseTemp + 4,
          low: baseTemp - 5,
          forecast: [
            { day: "Thu", temp: baseTemp + 1, condition: "Sunny" },
            { day: "Fri", temp: baseTemp - 1, condition: "Cloudy" },
            { day: "Sat", temp: baseTemp + 2, condition: "Partly Cloudy" },
            { day: "Sun", temp: baseTemp + 3, condition: "Sunny" },
            { day: "Mon", temp: baseTemp, condition: "Windy" }
          ],
          isPinned: false,
          alert: payload.alert || (baseTemp > 30 ? "Extreme heat warning" : null)
        };

        dashboardState.cities.push(newCity);
        notifyTitle = `Weather Tracked: ${newCity.name}`;
        notifyMessage = `Added ${newCity.name} (${newCity.temp}°C, ${newCity.condition})`;
        notifyType = 'weather';
        break;
      }

      case 'REMOVE_CITY': {
        dashboardState.cities = dashboardState.cities.filter((c: any) => c.id !== payload.id);
        break;
      }

      case 'TOGGLE_PIN_CITY': {
        const city = dashboardState.cities.find((c: any) => c.id === payload.id);
        if (city) city.isPinned = !city.isPinned;
        break;
      }

      case 'SET_TEMP_UNIT': {
        dashboardState.preferences.tempUnit = payload.unit;
        break;
      }

      // Calendar Actions
      case 'ADD_CALENDAR_EVENT': {
        const newEvent = {
          id: 'cal-' + Date.now(),
          title: payload.title,
          date: payload.date || new Date().toISOString().split('T')[0],
          startTime: payload.startTime || '10:00',
          endTime: payload.endTime || '11:00',
          category: payload.category || 'work',
          location: payload.location || 'Remote',
          description: payload.description || '',
          emailNotification: !!payload.emailNotification,
          completed: false
        };
        dashboardState.calendarEvents.push(newEvent);
        dashboardState.calendarEvents.sort((a: any, b: any) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

        notifyTitle = 'Calendar Event Scheduled';
        notifyMessage = `"${newEvent.title}" on ${newEvent.date} at ${newEvent.startTime}`;
        notifyType = 'calendar';

        if (newEvent.emailNotification) {
          const emailReminder = {
            id: 'em-remind-' + Date.now(),
            sender: "OmniSync Calendar Subsystem <calendar@omnisync.internal>",
            subject: `Calendar Reminder: ${newEvent.title} (${newEvent.date} at ${newEvent.startTime})`,
            snippet: `Reminder for upcoming event: ${newEvent.title} at ${newEvent.location}...`,
            body: `Hello Kitso,\n\nCalendar reminder for:\nTitle: ${newEvent.title}\nDate: ${newEvent.date}\nTime: ${newEvent.startTime} - ${newEvent.endTime}\nLocation: ${newEvent.location}`,
            timestamp: "Just now",
            date: new Date().toISOString(),
            read: false,
            priority: "high" as const,
            tags: ["Calendar", "Reminder"],
            starred: true
          };
          dashboardState.emails.unshift(emailReminder);
        }
        break;
      }

      case 'DELETE_CALENDAR_EVENT': {
        dashboardState.calendarEvents = dashboardState.calendarEvents.filter((e: any) => e.id !== payload.id);
        break;
      }

      case 'TOGGLE_CALENDAR_EVENT': {
        const ev = dashboardState.calendarEvents.find((e: any) => e.id === payload.id);
        if (ev) ev.completed = !ev.completed;
        break;
      }

      // News & Topics
      case 'SET_NEWS_TOPIC': {
        dashboardState.selectedNewsTopic = payload.topic;
        break;
      }

      case 'ADD_NEWS_KEYWORD': {
        if (!dashboardState.customNewsKeywords.includes(payload.keyword)) {
          dashboardState.customNewsKeywords.push(payload.keyword);
          const newArticle = {
            id: 'news-' + Date.now(),
            topic: payload.keyword,
            title: `Latest Developments & Breakthroughs in ${payload.keyword}`,
            source: 'Curated Intelligence Feed',
            timeAgo: 'Just now',
            summary: `Automated topic stream synthesized for '${payload.keyword}': Key researchers and developers release milestone frameworks.`,
            readTime: '3 min read',
            url: `https://example.com/topic/${encodeURIComponent(payload.keyword)}`
          };
          dashboardState.newsArticles.unshift(newArticle);
          notifyTitle = `News Topic Added: ${payload.keyword}`;
          notifyMessage = `Generated new topic feed for ${payload.keyword}`;
        }
        break;
      }

      // Fun Facts
      case 'NEXT_FUN_FACT': {
        dashboardState.currentFactIndex = (dashboardState.currentFactIndex + 1) % dashboardState.funFacts.length;
        break;
      }

      case 'LIKE_FUN_FACT': {
        const fact = dashboardState.funFacts[payload.index ?? dashboardState.currentFactIndex];
        if (fact) {
          fact.likes += 1;
          fact.isSaved = true;
          notifyTitle = 'Fun Fact Saved';
          notifyMessage = `Saved fact: "${fact.fact.substring(0, 45)}..."`;
        }
        break;
      }

      // Widgets Layout
      case 'TOGGLE_WIDGET': {
        const widgetKey = payload.widget as keyof typeof dashboardState.activeWidgets;
        if (widgetKey in dashboardState.activeWidgets) {
          dashboardState.activeWidgets[widgetKey] = !dashboardState.activeWidgets[widgetKey];
        }
        break;
      }

      // Email Actions
      case 'SEND_WEATHER_EMAIL_ALERT': {
        const city = dashboardState.cities.find((c: any) => c.id === payload.cityId) || dashboardState.cities[0];
        const emailMsg = {
          id: 'em-weather-' + Date.now(),
          sender: "OmniSync Weather Bot <weather@omnisync.internal>",
          subject: `Weather Advisory: ${city.name} (${city.temp}°C, ${city.condition})`,
          snippet: `Current conditions and forecast for ${city.name}...`,
          body: `Weather Report for ${city.name}, ${city.country}\n\nTemp: ${city.temp}°C\nCondition: ${city.condition}\nHumidity: ${city.humidity}%\nWind: ${city.windSpeed} km/h`,
          timestamp: "Just now",
          date: new Date().toISOString(),
          read: false,
          priority: "medium" as const,
          tags: ["Weather", "Alert"],
          starred: false
        };
        dashboardState.emails.unshift(emailMsg);
        notifyTitle = 'Weather Alert Sent';
        notifyMessage = `Sent weather advisory for ${city.name} to ${dashboardState.user.email}`;
        notifyType = 'weather';
        break;
      }

      case 'SEND_CALENDAR_EMAIL_DIGEST': {
        const emailMsg = {
          id: 'em-cal-' + Date.now(),
          sender: "OmniSync Agenda <agenda@omnisync.internal>",
          subject: "Your Daily Agenda & Milestones",
          snippet: `Today's scheduled events and meetings for ${dashboardState.user.name}...`,
          body: `Daily Schedule for ${dashboardState.user.name}\n\n${dashboardState.calendarEvents.map((e: any) => `• ${e.startTime} - ${e.endTime}: ${e.title} (${e.location || 'Remote'})`).join('\n')}`,
          timestamp: "Just now",
          date: new Date().toISOString(),
          read: false,
          priority: "medium" as const,
          tags: ["Calendar", "Agenda"],
          starred: false
        };
        dashboardState.emails.unshift(emailMsg);
        notifyTitle = 'Agenda Dispatched';
        notifyMessage = `Sent today's schedule to ${dashboardState.user.email}`;
        notifyType = 'email';
        break;
      }

      case 'SEND_NEWS_EMAIL_DIGEST': {
        const topic = payload.topic || 'Curated';
        const articles = dashboardState.newsArticles.slice(0, 4);
        const emailMsg = {
          id: 'em-news-' + Date.now(),
          sender: "OmniSync Newsfeed <news@omnisync.internal>",
          subject: `Daily Briefing: Top News in ${topic}`,
          snippet: `Curated headlines for ${dashboardState.user.name}...`,
          body: `OmniSync News Digest (${topic})\n\n${articles.map((a: any, i: number) => `${i + 1}. ${a.title}\nSource: ${a.source} (${a.timeAgo})\n${a.summary}\n`).join('\n---\n\n')}`,
          timestamp: "Just now",
          date: new Date().toISOString(),
          read: false,
          priority: "medium" as const,
          tags: ["News", "Digest"],
          starred: false
        };
        dashboardState.emails.unshift(emailMsg);
        notifyTitle = 'News Digest Sent';
        notifyMessage = `Sent ${topic} news digest to ${dashboardState.user.email}`;
        notifyType = 'email';
        break;
      }

      case 'ADD_METRIC_ENTRY': {
        dashboardState.timeSeries.push(payload);
        if (dashboardState.timeSeries.length > 30) dashboardState.timeSeries.shift();
        await refreshPythonAnalytics();
        notifyTitle = 'Metrics Re-analyzed';
        notifyMessage = `Logged entry for ${payload.date}`;
        break;
      }

      case 'TRIGGER_NOTIFICATION': {
        const newNotif = {
          id: 'notif-' + Date.now(),
          title: payload.title || 'System Notification',
          message: payload.message || 'Action executed successfully.',
          type: payload.type || 'info',
          timestamp: 'Just now',
          read: false
        };
        dashboardState.notifications.unshift(newNotif);
        if (dashboardState.notifications.length > 25) dashboardState.notifications.pop();
        notifyTitle = newNotif.title;
        notifyMessage = newNotif.message;
        notifyType = newNotif.type;
        break;
      }

      case 'MARK_NOTIFICATIONS_READ': {
        dashboardState.notifications.forEach((n: any) => { n.read = true; });
        break;
      }

      case 'SEND_EMAIL': {
        const newEmail = {
          id: 'em-' + Date.now(),
          sender: `Kitso Motlashuping <${dashboardState.user.email}>`,
          subject: payload.subject,
          snippet: payload.body.substring(0, 100) + '...',
          body: payload.body,
          timestamp: 'Just now',
          date: new Date().toISOString(),
          read: true,
          priority: payload.priority || 'medium',
          tags: payload.tags || ['Sent'],
          starred: false
        };
        dashboardState.emails.unshift(newEmail);
        notifyTitle = 'Email Dispatched';
        notifyMessage = `Sent to ${payload.to}: ${payload.subject}`;
        notifyType = 'email';
        break;
      }

      case 'MARK_EMAIL_READ': {
        const em = dashboardState.emails.find((e: any) => e.id === payload.id);
        if (em) em.read = true;
        break;
      }

      case 'TOGGLE_STAR_EMAIL': {
        const em = dashboardState.emails.find((e: any) => e.id === payload.id);
        if (em) em.starred = !em.starred;
        break;
      }

      case 'UPDATE_TRIGGER': {
        const trigIndex = dashboardState.triggers.findIndex((t: any) => t.id === payload.id);
        if (trigIndex >= 0) {
          dashboardState.triggers[trigIndex] = { ...dashboardState.triggers[trigIndex], ...payload };
        } else {
          dashboardState.triggers.push({ ...payload, id: 'trig-' + Date.now() });
        }
        break;
      }

      case 'DELETE_TRIGGER': {
        dashboardState.triggers = dashboardState.triggers.filter((t: any) => t.id !== payload.id);
        break;
      }

      // Settings & Profile Actions
      case 'UPDATE_USER': {
        dashboardState.user = {
          ...dashboardState.user,
          ...payload
        };
        notifyTitle = 'Profile Updated';
        notifyMessage = `Updated profile for ${dashboardState.user.name} (${dashboardState.user.email})`;
        notifyType = 'system';
        break;
      }

      case 'UPDATE_PREFERENCES': {
        dashboardState.preferences = {
          ...dashboardState.preferences,
          ...payload
        };
        notifyTitle = 'Preferences Saved';
        notifyMessage = `Updated app settings and automation preferences.`;
        notifyType = 'system';
        break;
      }

      // Document Hub & PDF Actions
      case 'ADD_DOCUMENT': {
        const newDoc = {
          id: 'doc-' + Date.now(),
          title: payload.title || 'Untitled Document.pdf',
          category: payload.category || 'Personal',
          fileSize: payload.fileSize || '1.2 MB',
          pages: payload.pages || 1,
          uploadedAt: 'Today',
          author: payload.author || dashboardState.user.name,
          readingTime: payload.readingTime || '5 min',
          description: payload.description || 'Uploaded executive PDF document.',
          isCustom: true,
          fileData: payload.fileData || '',
          contentSections: payload.contentSections || [
            {
              heading: '1. Document Overview',
              text: payload.description || 'Custom document content imported into OmniSync.'
            }
          ]
        };
        dashboardState.documents = dashboardState.documents || [];
        dashboardState.documents.unshift(newDoc);
        notifyTitle = 'Document Added';
        notifyMessage = `Saved "${newDoc.title}" to PDF Library.`;
        notifyType = 'system';
        break;
      }

      case 'DELETE_DOCUMENT': {
        dashboardState.documents = (dashboardState.documents || []).filter((d: any) => d.id !== payload.id);
        notifyTitle = 'Document Removed';
        notifyMessage = `Removed document from Library.`;
        notifyType = 'system';
        break;
      }

      // Habit Tracker Extended Actions
      case 'UPDATE_HABIT_STREAK': {
        const h = dashboardState.habits.find((item: any) => item.id === payload.id);
        if (h) {
          if (payload.streak !== undefined) h.streak = payload.streak;
          if (payload.completed !== undefined) h.completed = payload.completed;
          if (payload.history) h.history = payload.history;
        }
        await refreshPythonAnalytics();
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });

    }

    saveState();

    broadcast('STATE_UPDATED', {
      state: dashboardState,
      action,
      sourceDeviceId
    });

    if (notifyTitle) {
      broadcast('NOTIFICATION_PUSH', {
        title: notifyTitle,
        message: notifyMessage,
        type: notifyType
      });
    }

    res.json({ success: true, state: dashboardState });
  } catch (err: any) {
    console.error('Action error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Python execution endpoints
app.post('/api/python/run', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const result = await runPythonEngine('script', {
      code,
      data: dashboardState
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/python/digest', async (req: Request, res: Response) => {
  try {
    const { customNote, recipient } = req.body;
    const latest = dashboardState.timeSeries[dashboardState.timeSeries.length - 1] || {};
    const digestResult = await runPythonEngine('digest', {
      userName: dashboardState.user.name,
      userEmail: recipient || dashboardState.user.email,
      customNote: customNote || "All synchronized personal widgets (Habits, Rest, Weather, Calendar, To-Dos, and News) are operating smoothly.",
      metricsSummary: {
        productivity: dashboardState.productivityBreakdown?.score || latest.productivity || 91,
        deepWorkHours: latest.deepWorkHours || 6.5,
        tasksDone: dashboardState.tasks.filter((t: any) => t.completed).length,
        activeDevices: Math.max(1, activeClients.size)
      },
      habits: dashboardState.habits,
      rest: dashboardState.rest,
      recentTasks: dashboardState.tasks,
      anomalies: dashboardState.pythonAnalytics?.anomalies || []
    });

    const newEmail = {
      id: 'em-digest-' + Date.now(),
      sender: "OmniSync Python Subsystem <briefing@omnisync.internal>",
      subject: digestResult.subject,
      snippet: `Daily executive briefing generated for ${recipient || dashboardState.user.email}...`,
      body: digestResult.plainText,
      html: digestResult.html,
      timestamp: "Just now",
      date: new Date().toISOString(),
      read: false,
      priority: "high" as const,
      tags: ["Briefing", "Python", "Executive"],
      starred: true
    };

    dashboardState.emails.unshift(newEmail);
    saveState();

    broadcast('STATE_UPDATED', { state: dashboardState, action: 'EMAIL_DIGEST_GENERATED' });
    broadcast('NOTIFICATION_PUSH', {
      title: "Executive Email Briefing Generated",
      message: `Briefing prepared and dispatched to ${recipient || dashboardState.user.email}`,
      type: "email"
    });

    res.json(digestResult);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/devices', (req: Request, res: Response) => {
  res.json({ devices: getActiveDevicesList() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniSync] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[OmniSync] Real-time WebSocket syncing active at ws://0.0.0.0:${PORT}/ws`);
    console.log(`[OmniSync] Python Analytics Engine connected.`);
  });
}

startServer();
