import React, { useState } from 'react';
import { Flame, Check, Plus, Trash2, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { Habit } from '../../types';

interface HabitsWidgetProps {
  habits: Habit[];
  onToggleHabit: (id: string) => Promise<void>;
  onAddHabit: (habit: { name: string; category: any }) => Promise<void>;
  onDeleteHabit: (id: string) => Promise<void>;
}

export const HabitsWidget: React.FC<HabitsWidgetProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit
}) => {
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'focus' | 'health' | 'learning' | 'routine' | 'rest'>('focus');

  const completedCount = habits.filter((h) => h.completed).length;
  const completionRate = Math.round((completedCount / Math.max(1, habits.length)) * 100);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await onAddHabit({
      name: newHabitName.trim(),
      category: newHabitCategory
    });
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'focus': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'health': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rest': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'learning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Habits & Discipline</h3>
              <p className="text-[11px] text-slate-400">Pillar 1 of 3 in your authoritative Productivity Index</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {completedCount}/{habits.length} ({completionRate}%)
            </span>
            <button
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors"
              title="Add habit"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add Habit Drawer */}
        {isAddingHabit && (
          <form onSubmit={handleAddSubmit} className="mt-3 p-3 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-white">Track New Daily Habit</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Read 20 pages, Stretch 15m..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <select
                value={newHabitCategory}
                onChange={(e: any) => setNewHabitCategory(e.target.value)}
                className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300"
              >
                <option value="focus">Focus</option>
                <option value="health">Health</option>
                <option value="rest">Rest</option>
                <option value="learning">Learning</option>
                <option value="routine">Routine</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Progress bar */}
        <div className="my-3">
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                habit.completed
                  ? 'bg-slate-950/40 border-slate-800/40 text-slate-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    habit.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600 hover:border-amber-400'
                  }`}
                >
                  {habit.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div className="truncate">
                  <div className={`truncate font-medium ${habit.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {habit.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span className={`px-1 py-0.2 rounded border capitalize ${getCategoryColor(habit.category)}`}>
                      {habit.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400 font-mono font-medium">
                      <Flame className="w-2.5 h-2.5 fill-current" /> {habit.streak}d streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* 7-Day History dots */}
                <div className="hidden sm:flex items-center gap-1">
                  {habit.history.slice(-5).map((done, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        done ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                      title={done ? 'Completed' : 'Missed'}
                    />
                  ))}
                </div>

                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Habits contribute 35% to overall Productivity Index</span>
        <span>Synced across all nodes</span>
      </div>
    </div>
  );
};
