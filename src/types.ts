export interface UserProfile {
  name: string;
  email: string;
  role: string;
  timezone: string;
  avatar: string;
}

export interface Preferences {
  theme: string;
  tempUnit: 'C' | 'F';
  emailDigestSchedule: string;
  pushSound: boolean;
  realtimeSync: boolean;
  emailWeatherAlerts: boolean;
  emailCalendarReminders: boolean;
  emailNewsDigest: boolean;
  emailRestReminders: boolean;
  timeOfDayAutoMode?: boolean;
  timeFormat?: '12h' | '24h';
  routineTimes?: {
    morningBriefing?: string;
    slackDailySync?: string;
    dailyWrapUp?: string;
    websitePulse?: string;
    weeklyReflection?: string;
  };
}

export interface PdfDocument {
  id: string;
  title: string;
  category: 'Architecture' | 'Manual' | 'Strategy' | 'Report' | 'Personal';
  fileSize: string;
  pages: number;
  uploadedAt: string;
  description: string;
  isCustom?: boolean;
  fileData?: string;
  author: string;
  readingTime: string;
  contentSections: {
    heading: string;
    text: string;
  }[];
}


export interface TimeSeriesEntry {
  date: string;
  productivity: number;
  deepWorkHours: number;
  energy: number;
  expenses: number;
  tasksDone: number;
}

export interface Habit {
  id: string;
  name: string;
  category: 'focus' | 'health' | 'learning' | 'routine' | 'rest';
  streak: number;
  completed: boolean;
  history: boolean[]; // last 7 days
}

export interface RestAndRelaxation {
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: number; // 0 - 100
  relaxationMinutes: number;
  relaxationTarget: number; // e.g. 45 mins
  lastRestActivity: string;
  recoveryScore: number; // 0 - 100
  recoveryStatus: 'Optimal' | 'Balanced' | 'Recharge Needed';
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface ToDoItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  notes?: string;
  scheduledBadge?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'deadline' | 'rest';
  location?: string;
  description?: string;
  emailNotification: boolean;
  completed?: boolean;
  attendees?: number;
  isNext?: boolean;
  relativeTime?: string;
}

export interface WeatherCity {
  id: string;
  name: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Thunderstorm' | 'Snow' | 'Windy';
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  high: number;
  low: number;
  forecast: { day: string; temp: number; condition: string }[];
  isPinned: boolean;
  alert?: string | null;
}

export interface NewsArticle {
  id: string;
  topic: string;
  title: string;
  source: string;
  timeAgo: string;
  summary: string;
  readTime: string;
  url: string;
}

export interface FunFact {
  id: string;
  category: string;
  fact: string;
  didYouKnow: string;
  likes: number;
  isSaved?: boolean;
}

export interface EmailMessage {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  html?: string;
  timestamp: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  starred: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'sync' | 'analytics' | 'email' | 'system' | 'alert' | 'weather' | 'calendar' | 'habit' | 'rest';
  timestamp: string;
  read: boolean;
}

export interface TriggerRule {
  id: string;
  name: string;
  metric: string;
  condition: '<' | '<=' | '>' | '>=' | '==';
  threshold: number;
  channel: 'push' | 'email' | 'both';
  enabled: boolean;
}

export interface ForecastPoint {
  date: string;
  projected: number;
  upperBound: number;
  lowerBound: number;
}

export interface MetricAnalysis {
  current: number;
  average: number;
  stdDev: number;
  movingAverage3d: number;
  trendSlope: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  confidenceR2: number;
  forecast7d: ForecastPoint[];
}

export interface AnomalyItem {
  id: string;
  date: string;
  metric: string;
  value: number;
  expected: number;
  zScore: number;
  type: 'surge' | 'drop';
  severity: 'high' | 'medium';
  description: string;
}

export interface ProductivityBreakdown {
  score: number;
  workDoneRate: number;
  habitsRate: number;
  restRecoveryRate: number;
  habitsCompleted: number;
  totalHabits: number;
  tasksCompleted: number;
  tasksTarget: number;
  deepWorkHours: number;
  deepWorkTarget: number;
  sleepHours: number;
  sleepTarget: number;
  relaxationMinutes: number;
  relaxationTarget: number;
  formula: string;
}

export interface PythonAnalytics {
  calculatedAt: string;
  sampleSize: number;
  productivityBreakdown: ProductivityBreakdown;
  metrics: {
    productivity?: MetricAnalysis;
    deepWorkHours?: MetricAnalysis;
    energy?: MetricAnalysis;
    expenses?: MetricAnalysis;
    tasksDone?: MetricAnalysis;
  };
  anomalies: AnomalyItem[];
  correlations: Record<string, number>;
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
  connectedAt: string;
  online: boolean;
}

export interface DashboardState {
  user: UserProfile;
  preferences: Preferences;
  timeSeries: TimeSeriesEntry[];
  habits: Habit[];
  rest: RestAndRelaxation;
  productivityBreakdown: ProductivityBreakdown;
  tasks: ToDoItem[];
  notes: QuickNote[];
  calendarEvents: CalendarEvent[];
  cities: WeatherCity[];
  newsArticles: NewsArticle[];
  selectedNewsTopic: string;
  customNewsKeywords: string[];
  funFacts: FunFact[];
  currentFactIndex: number;
  activeWidgets: {
    habits: boolean;
    rest: boolean;
    weather: boolean;
    calendar: boolean;
    todos: boolean;
    news: boolean;
    funfacts: boolean;
    analytics: boolean;
  };
  emails: EmailMessage[];
  notifications: NotificationItem[];
  triggers: TriggerRule[];
  pythonAnalytics: PythonAnalytics | null;
  documents?: PdfDocument[];
}
