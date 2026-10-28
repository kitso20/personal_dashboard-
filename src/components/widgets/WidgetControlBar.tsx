import React from 'react';
import { LayoutGrid, Cloud, Calendar, CheckSquare, Newspaper, Lightbulb, BarChart2, Flame, Moon } from 'lucide-react';

interface WidgetControlBarProps {
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
  onToggleWidget: (widget: string) => Promise<void>;
}

export const WidgetControlBar: React.FC<WidgetControlBarProps> = ({
  activeWidgets,
  onToggleWidget
}) => {
  const widgets = [
    { key: 'habits', label: 'Habits', icon: Flame },
    { key: 'rest', label: 'Relax & Rest', icon: Moon },
    { key: 'todos', label: 'Work Done', icon: CheckSquare },
    { key: 'weather', label: 'Weather', icon: Cloud },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'news', label: 'News Topics', icon: Newspaper },
    { key: 'funfacts', label: 'Fun Facts', icon: Lightbulb },
    { key: 'analytics', label: 'Telemetry & Forecast', icon: BarChart2 }
  ];

  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-x-auto no-scrollbar gap-3">
      <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 font-medium pl-1">
        <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
        <span>Active Widgets:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {widgets.map(({ key, label, icon: Icon }) => {
          const isActive = activeWidgets[key as keyof typeof activeWidgets];
          return (
            <button
              key={key}
              onClick={() => onToggleWidget(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-slate-800 border-indigo-500/50 text-white shadow-xs'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
