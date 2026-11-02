import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  MoreHorizontal,
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Clock
} from 'lucide-react';
import { DashboardState, CuratedSourceItem, WeatherCity } from '../types';
import { PublicTransitWidget } from './widgets/PublicTransitWidget';

interface PersonalDashboardViewProps {
  state: DashboardState;
  dispatchAction: (action: string, payload?: any) => Promise<any>;
  onOpenNotifications: () => void;
  onOpenQuickAction: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const PersonalDashboardView: React.FC<PersonalDashboardViewProps> = ({
  state,
  dispatchAction,
  onOpenNotifications,
  onOpenQuickAction,
  onNavigateTab
}) => {
  // Live formatted date and time matching the image: "Tuesday, Oct 26, 10:15 AM"
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [weatherMenuOpen, setWeatherMenuOpen] = useState(false);
  const [sourcesMenuOpen, setSourcesMenuOpen] = useState(false);
  const [headlinesMenuOpen, setHeadlinesMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(state.user.name || 'Sarah Jenkins');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      // E.g. "Tuesday, Oct 26, 10:15 AM"
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Weather city data (matching New York in the screenshot: 21°C, Partly Cloudy, 5-day forecast)
  const activeCity: WeatherCity = state.cities.find((c) => c.name.toLowerCase().includes('new york')) || state.cities[0] || {
    id: 'city-nyc',
    name: 'New York',
    country: 'USA',
    temp: 21,
    feelsLike: 22,
    condition: 'Partly Cloudy',
    humidity: 68,
    windSpeed: 8,
    uvIndex: 5,
    high: 22,
    low: 12,
    forecast: [
      { day: 'Wed', temp: 20, condition: 'Cloudy' },
      { day: 'Thu', temp: 19, condition: 'Rain' },
      { day: 'Fri', temp: 22, condition: 'Sunny' },
      { day: 'Sat', temp: 23, condition: 'Sunny' },
      { day: 'Sun', temp: 21, condition: 'Partly Cloudy' }
    ],
    isPinned: true
  };

  // Curated news items from the screenshot
  const curatedSources: CuratedSourceItem[] = state.curatedSources && state.curatedSources.length > 0 ? state.curatedSources : [
    {
      id: 'source-1',
      source: 'BBC News',
      sourceIcon: 'bbc',
      title: 'BBC News: COP28 Summit: Global Leaders Commit to Climate Goals',
      timeAgo: '15m ago',
      category: 'World News'
    },
    {
      id: 'source-2',
      source: 'Ny York Times',
      sourceIcon: 'nytimes',
      title: 'NYC Times: NYC Mayor Announces Major Pellets Announces Major Infrastructure Initiative',
      timeAgo: '42m ago',
      category: 'Metro'
    },
    {
      id: 'source-3',
      source: 'TechCrunch',
      sourceIcon: 'techcrunch',
      title: 'TechCrunch: Google Unveils New AI Models for Healthcare',
      timeAgo: '1h ago',
      category: 'Technology'
    },
    {
      id: 'source-4',
      source: 'Reuters',
      sourceIcon: 'reuters',
      title: 'Reuters: Stock Markets Rally Amid Positive Economic Data',
      timeAgo: '2h ago',
      category: 'Economy'
    }
  ];

  // Daily News Headlines list (numbered 1 to 4)
  const dailyHeadlines = [
    {
      id: 'hl-1',
      num: 1,
      source: 'BBC News',
      sourceType: 'bbc',
      title: 'BBC News: COP28 Summit: Global Leaders Commit to Climate Goals',
      timeAgo: '15m ago'
    },
    {
      id: 'hl-2',
      num: 2,
      source: 'NY Times',
      sourceType: 'nytimes',
      title: 'NY Times: NYC Mayor Announces Major Infrastructure Initiative',
      timeAgo: '42m ago'
    },
    {
      id: 'hl-3',
      num: 3,
      source: 'TechCrunch',
      sourceType: 'techcrunch',
      title: 'TechCrunch: Google Unveils New AI Models for Healthcare',
      timeAgo: '1h ago'
    },
    {
      id: 'hl-4',
      num: 4,
      source: 'Reuters',
      sourceType: 'reuters',
      title: 'Reuters: Stock Markets Rally Amid Positive Economic Data',
      timeAgo: '2h ago'
    }
  ];

  const unreadAlerts = state.notifications?.filter((n) => !n.read).length || 0;

  const handleSaveProfileName = async () => {
    if (profileNameInput.trim()) {
      await dispatchAction('UPDATE_USER', { name: profileNameInput.trim() });
    }
    setEditingProfile(false);
    setUserDropdownOpen(false);
  };

  const handleSwitchUser = async (name: string, role: string, avatar: string) => {
    await dispatchAction('UPDATE_USER', { name, role, avatar });
    setProfileNameInput(name);
    setUserDropdownOpen(false);
  };

  // Helper for source brand logos
  const renderSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bbc':
      case 'bbc news':
        return (
          <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-[9px] font-black tracking-tighter text-white shrink-0 shadow-xs">
            BBC
          </div>
        );
      case 'nytimes':
      case 'ny york times':
      case 'ny times':
        return (
          <div className="w-5 h-5 rounded bg-black flex items-center justify-center font-serif text-xs font-bold text-white shrink-0 shadow-xs">
            T
          </div>
        );
      case 'techcrunch':
        return (
          <div className="w-5 h-5 rounded bg-[#00a562] flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-xs">
            TC
          </div>
        );
      case 'reuters':
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
            ☼
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded bg-slate-200 dark:bg-white/[0.1] flex items-center justify-center text-[10px] text-slate-600 dark:text-neutral-300 shrink-0">
            ●
          </div>
        );
    }
  };

  // Weather mini icon helper
  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-4 h-4 text-sky-400" />;
    if (c.includes('cloud')) return <Cloud className="w-4 h-4 text-slate-400" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-4 h-4 text-amber-400" />;
    return <CloudSun className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebf5fb] via-[#f0f8ff] to-[#f4f7fb] dark:from-[#0b0e14] dark:via-[#0e1219] dark:to-[#121622] text-slate-800 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-[#0c0e12]/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Pastel Glowing Rounded App Logo */}
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-cyan-400 via-indigo-400 to-pink-400 p-[2px] shadow-sm shadow-cyan-500/20">
            <div className="w-full h-full bg-white dark:bg-[#0f131a] rounded-[14px] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-linear-to-tr from-cyan-400 to-indigo-500" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Dashboard
          </h1>
        </div>

        {/* Right Section: Profile, Alerts, Search, Live Date */}
        <div className="flex items-center gap-4 text-sm">
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 py-1 px-2 rounded-full hover:bg-white/80 dark:hover:bg-white/[0.06] transition"
            >
              <img
                src={state.user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'}
                alt={state.user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-white/20"
              />
              <span className="font-medium text-slate-700 dark:text-neutral-200 hidden sm:inline">
                {state.user.name || 'Sarah Jenkins'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-11 z-40 w-64 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-3 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white px-2 py-1">
                  Active User Profile
                </div>
                {editingProfile ? (
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder="Display Name"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-2 py-1 rounded text-slate-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfileName}
                        className="px-3 py-1 rounded bg-sky-500 text-white font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-2 py-1.5 text-slate-600 dark:text-neutral-300 flex items-center justify-between">
                    <div>
                      <div className="font-bold">{state.user.name || 'Sarah Jenkins'}</div>
                      <div className="text-[11px] text-slate-400">{state.user.email}</div>
                    </div>
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
                    >
                      Edit
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-white/[0.06] my-1 pt-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Preset Personas
                  </div>
                  <button
                    onClick={() =>
                      handleSwitchUser(
                        'Sarah Jenkins',
                        'Strategy & Operations',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
                      )
                    }
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-between"
                  >
                    <span>Sarah Jenkins (Personal Demo)</span>
                    {state.user.name === 'Sarah Jenkins' && <Check className="w-3.5 h-3.5 text-sky-500" />}
                  </button>
                  <button
                    onClick={() =>
                      handleSwitchUser(
                        'Kitso Motlashuping',
                        'Lead Engineer',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                      )
                    }
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-between"
                  >
                    <span>Kitso Motlashuping (Account)</span>
                    {state.user.name.includes('Kitso') && <Check className="w-3.5 h-3.5 text-sky-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-white/80 dark:hover:bg-white/[0.06] text-slate-600 dark:text-neutral-300 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0c0e12]" />
            )}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full hover:bg-white/80 dark:hover:bg-white/[0.06] text-slate-600 dark:text-neutral-300 transition"
            title="Search Dashboard"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Formatted Date & Time */}
          <div className="text-slate-600 dark:text-neutral-300 font-medium text-xs sm:text-sm pl-2 border-l border-slate-300/60 dark:border-white/[0.1] hidden md:block">
            {currentDateTime || 'Tuesday, Oct 26, 10:15 AM'}
          </div>
        </div>
      </header>

      {/* Main Grid View matching the exact layout of the screenshot */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Cards Row: Local Weather | Public Transit (glance) | Curated Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Local Weather (approx 5 cols) */}
          <div className="lg:col-span-5 bg-white/85 dark:bg-[#12151b] backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between relative">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  Local Weather
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setWeatherMenuOpen(!weatherMenuOpen)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {weatherMenuOpen && (
                    <div className="absolute right-0 top-7 z-30 w-48 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl py-1 text-xs">
                      <button
                        onClick={() => {
                          dispatchAction('SEND_WEATHER_EMAIL_ALERT', { cityId: activeCity.id });
                          setWeatherMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      >
                        Send Weather Alert Email
                      </button>
                      <button
                        onClick={() => {
                          dispatchAction('UPDATE_PREFERENCES', {
                            tempUnit: state.preferences.tempUnit === 'C' ? 'F' : 'C'
                          });
                          setWeatherMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      >
                        Toggle Temp Unit (°C / °F)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle: NEW YORK | TUESDAY, OCT 26 */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mt-1">
                {activeCity.name.toUpperCase()} | {currentDateTime.toUpperCase().split(',').slice(0, 2).join(',') || 'TUESDAY, OCT 26'}
              </div>

              {/* Large Temperature & Graphic Layout */}
              <div className="flex items-center justify-between my-3">
                <div>
                  <div className="text-5xl font-light tracking-tight text-slate-900 dark:text-white">
                    {state.preferences.tempUnit === 'F' ? Math.round((activeCity.temp * 9) / 5 + 32) : activeCity.temp}
                    °{state.preferences.tempUnit || 'C'}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-neutral-300 mt-1">
                    {activeCity.condition}
                  </div>
                </div>

                {/* Sun and Puffy Cloud illustration */}
                <div className="relative w-24 h-20 flex items-center justify-center shrink-0">
                  {/* Glowing sun */}
                  <div className="absolute top-1 right-3 w-12 h-12 rounded-full bg-linear-to-tr from-amber-400 to-yellow-300 shadow-md shadow-amber-400/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-400/30 animate-pulse" />
                  </div>
                  {/* Puffy Soft White Cloud */}
                  <div className="absolute bottom-1 left-2 w-16 h-10 bg-white/95 dark:bg-slate-200 rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
                    <div className="absolute -top-3 left-3 w-7 h-7 bg-white/95 dark:bg-slate-200 rounded-full" />
                    <div className="absolute -top-1 left-7 w-6 h-6 bg-white/95 dark:bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Details strip */}
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 pt-1 pb-3">
                FEELS LIKE {activeCity.feelsLike}°{state.preferences.tempUnit || 'C'} | WIND {activeCity.windSpeed}km/h | HUMIDITY {activeCity.humidity}%
              </div>
            </div>

            {/* 5-Day Mini Forecast Row */}
            <div className="border-t border-slate-100 dark:border-white/[0.06] pt-3 grid grid-cols-5 gap-2 text-center">
              {(activeCity.forecast || []).slice(0, 5).map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                    {f.day} {f.temp}°C
                  </span>
                  <div className="my-1.5">{getWeatherIcon(f.condition)}</div>
                  <span className="text-[10px] text-slate-600 dark:text-neutral-300 truncate w-full">
                    {f.condition.replace('Partly Cloudy', 'P. Cloudy')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Public Transit (Glance) (approx 3 cols) */}
          <div className="lg:col-span-3">
            <PublicTransitWidget state={state} dispatchAction={dispatchAction} variant="quick-glance" />
          </div>

          {/* Card 3: Curated Sources (approx 4 cols) */}
          <div className="lg:col-span-4 bg-white/85 dark:bg-[#12151b] backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-white">
                  CURATED SOURCES
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setSourcesMenuOpen(!sourcesMenuOpen)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {sourcesMenuOpen && (
                    <div className="absolute right-0 top-7 z-30 w-44 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl py-1 text-xs">
                      <button
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('news');
                          setSourcesMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      >
                        Open News Hub
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Items List */}
              <div className="space-y-3.5 mt-3">
                {curatedSources.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="flex items-start gap-2.5 cursor-pointer group hover:opacity-90 transition"
                  >
                    {renderSourceBadge(item.sourceIcon || item.source)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">
                          {item.source}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-neutral-400 shrink-0 ml-1">
                          {item.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-300 line-clamp-2 mt-0.5 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
              <span>Automated multi-wire feed</span>
              <span className="text-sky-600 dark:text-sky-400 font-medium">4 sources active</span>
            </div>
          </div>
        </div>

        {/* Bottom Cards Row: Public Transit Schedules (Times Square) | Daily News Headlines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 4: PUBLIC TRANSIT SCHEDULES (TIMES SQUARE) (approx 6 cols) */}
          <div className="lg:col-span-6">
            <PublicTransitWidget state={state} dispatchAction={dispatchAction} variant="full-schedule" />
          </div>

          {/* Card 5: DAILY NEWS HEADLINES (approx 6 cols) */}
          <div className="lg:col-span-6 bg-white/85 dark:bg-[#12151b] backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-white">
                    DAILY NEWS HEADLINES
                  </h3>
                  <div className="text-[11px] text-slate-400 dark:text-neutral-400 mt-0.5">
                    Curated sources:
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setHeadlinesMenuOpen(!headlinesMenuOpen)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {headlinesMenuOpen && (
                    <div className="absolute right-0 top-7 z-30 w-44 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl py-1 text-xs">
                      <button
                        onClick={() => {
                          dispatchAction('SEND_NEWS_EMAIL_DIGEST');
                          setHeadlinesMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                      >
                        Email Daily Briefing
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Numbered List: 1 to 4 */}
              <div className="space-y-3.5 mt-3">
                {dailyHeadlines.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="flex items-start gap-3 cursor-pointer group hover:opacity-90 transition"
                  >
                    {/* Number index */}
                    <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500 w-4 pt-0.5">
                      {item.num}.
                    </span>

                    {/* Source logo badge */}
                    {renderSourceBadge(item.sourceType)}

                    {/* Headline Title & Time */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-neutral-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-neutral-400 shrink-0 pt-0.5">
                        {item.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Updated in real time
              </span>
              <button
                onClick={() => dispatchAction('SEND_NEWS_EMAIL_DIGEST')}
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
              >
                Send Digest Email
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Strip: Habits & Rest telemetry link */}
        <div className="bg-white/60 dark:bg-[#12151b]/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/70 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Daily Habits & Rest Telemetry Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/40">
                  {state.productivityBreakdown?.score || 91}% Productivity
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                {state.habits?.filter((h) => h.completed).length || 4} of {state.habits?.length || 6} habits done today • {state.rest?.sleepHours || 7.8}h sleep • {state.rest?.recoveryStatus || 'Optimal'} recovery
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('habits')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              Open Habit Tracker
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('library')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-neutral-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.08] transition"
            >
              PDF Library ({state.documents?.length || 4})
            </button>
          </div>
        </div>
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              {renderSourceBadge(selectedArticle.sourceType || selectedArticle.source)}
              <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                {selectedArticle.source}
              </span>
              <span className="text-slate-300 dark:text-neutral-600">•</span>
              <span className="text-xs text-slate-400">{selectedArticle.timeAgo}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
              {selectedArticle.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-5">
              Comprehensive report synthesized directly from global news wire networks. This live dispatch is tracked within your personal intelligence digest with instant synchronization across client nodes.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <span className="text-[11px] text-slate-400">Verified syndicated source</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.08] pb-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transit lines, weather, habits, tasks, or documents..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Quick Links</div>
              <button
                onClick={() => {
                  onNavigateTab && onNavigateTab('habits');
                  setSearchOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Habit Tracker (4/6 done)</span>
                <span className="text-slate-400">Activity</span>
              </button>
              <button
                onClick={() => {
                  onNavigateTab && onNavigateTab('library');
                  setSearchOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>PDF Document Hub</span>
                <span className="text-slate-400">Library</span>
              </button>
              <button
                onClick={() => {
                  onNavigateTab && onNavigateTab('settings');
                  setSearchOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-between"
              >
                <span>Settings & Preferences</span>
                <span className="text-slate-400">Config</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
