import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Mail,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { CalendarEvent } from '../../types';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  userEmail: string;
  onAddEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onToggleEvent: (id: string) => Promise<void>;
  onDispatchEmailDigest: () => Promise<void>;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  userEmail,
  onAddEvent,
  onDeleteEvent,
  onToggleEvent,
  onDispatchEmailDigest
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-28');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: selectedDate,
    startTime: '11:00',
    endTime: '12:00',
    category: 'work' as 'work' | 'personal' | 'health' | 'deadline',
    location: 'Google Meet',
    description: '',
    emailNotification: true
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'work': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'personal': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'health': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'deadline': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    await onAddEvent(newEvent);
    setNewEvent({
      title: '',
      date: selectedDate,
      startTime: '11:00',
      endTime: '12:00',
      category: 'work',
      location: 'Google Meet',
      description: '',
      emailNotification: true
    });
    setIsAddingEvent(false);
  };

  const handleSendAgenda = async () => {
    setIsSendingDigest(true);
    try {
      await onDispatchEmailDigest();
    } finally {
      setIsSendingDigest(false);
    }
  };

  // Filter events for selected day or upcoming
  const dayEvents = events.filter((e) => e.date === selectedDate);
  const upcomingEvents = events.filter((e) => e.date !== selectedDate);

  // Generate mini calendar days for October 2026 (starts on Thursday, 31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Calendar & Schedule</h3>
              <p className="text-[11px] text-slate-400">Synced meetings, deadlines & email reminders</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Schedule new event"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Event Form */}
        {isAddingEvent && (
          <form onSubmit={handleCreateEvent} className="mt-3 p-3 bg-slate-950 border border-indigo-500/40 rounded-lg space-y-2.5">
            <div className="text-xs font-semibold text-white">Schedule New Event</div>
            <input
              type="text"
              placeholder="Event title..."
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Start</label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">End</label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newEvent.category}
                onChange={(e: any) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
              >
                <option value="work">Work & Sprints</option>
                <option value="personal">Personal</option>
                <option value="health">Health & Fitness</option>
                <option value="deadline">Critical Deadline</option>
              </select>

              <input
                type="text"
                placeholder="Location / Link"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
              <input
                type="checkbox"
                id="emailNotif"
                checked={newEvent.emailNotification}
                onChange={(e) => setNewEvent({ ...newEvent, emailNotification: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <label htmlFor="emailNotif" className="text-[11px] cursor-pointer">
                Dispatch automated email reminder to {userEmail}
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
              >
                Save Event
              </button>
            </div>
          </form>
        )}

        {/* Date Selector Row */}
        <div className="flex items-center justify-between py-2 text-xs">
          <span className="font-semibold text-white">October 2026</span>
          <div className="flex items-center gap-1">
            {['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  selectedDate === d
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.slice(8)}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-2 mt-2 max-h-[280px] overflow-y-auto">
          {dayEvents.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
              No meetings scheduled for this date.
            </div>
          )}

          {dayEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3 rounded-lg border transition-all ${
                ev.completed
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onToggleEvent(ev.id)}
                    className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                      ev.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {ev.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>

                  <div>
                    <div className={`text-xs font-semibold ${ev.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {ev.title}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {ev.startTime} - {ev.endTime}
                      </span>
                      {ev.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {ev.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize font-medium ${getCategoryColor(ev.category)}`}>
                    {ev.category}
                  </span>
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {ev.emailNotification && (
                <div className="mt-2 text-[10px] text-indigo-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email reminder queued for {userEmail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={handleSendAgenda}
          disabled={isSendingDigest}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {isSendingDigest ? 'Sending...' : "Email Today's Agenda"}
        </button>

        <span className="text-[11px] text-slate-500">
          {events.filter((e) => e.date === selectedDate).length} events today
        </span>
      </div>
    </div>
  );
};
