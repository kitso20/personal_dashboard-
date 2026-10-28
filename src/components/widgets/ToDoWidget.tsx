import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Check, Filter, FileText, StickyNote } from 'lucide-react';
import { ToDoItem, QuickNote } from '../../types';

interface ToDoWidgetProps {
  tasks: ToDoItem[];
  notes?: QuickNote[];
  onAddTodo: (task: { title: string; category: string; priority: 'low' | 'medium' | 'high'; dueDate: string }) => Promise<void>;
  onToggleTodo: (id: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onDeleteNote?: (id: string) => Promise<void>;
}

export const ToDoWidget: React.FC<ToDoWidgetProps> = ({
  tasks,
  notes = [],
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const categories = ['All', 'Work', 'Personal', 'Urgent', 'Learning'];

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddTodo({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: 'Today'
    });
    setNewTitle('');
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return 'text-rose-400 font-semibold';
    if (priority === 'medium') return 'text-amber-400 font-medium';
    return 'text-slate-500';
  };

  return (
    <div className="h-full bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-700/80 transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              {activeTab === 'tasks' ? <CheckCircle2 className="w-4 h-4" /> : <StickyNote className="w-4 h-4 text-teal-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                    activeTab === 'tasks'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tasks ({completedCount}/{tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Notes ({notes.length})
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {activeTab === 'tasks' ? (
              <span><span className="text-emerald-400 font-bold">{completedCount}</span>/{tasks.length} Done</span>
            ) : (
              <span className="text-teal-400 font-bold">{notes.length} Active</span>
            )}
          </div>
        </div>

        {activeTab === 'tasks' ? (
          <>
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 py-2.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAdd} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="Add task to list..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Urgent">Urgent</option>
                <option value="Learning">Learning</option>
              </select>

              <select
                value={newPriority}
                onChange={(e: any) => setNewPriority(e.target.value)}
                className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>

              <button
                type="submit"
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
                title="Add task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
                  No tasks in this category.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      task.completed
                        ? 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleTodo(task.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span className={`truncate font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {task.category}
                      </span>

                      <span className={`text-[10px] uppercase font-mono ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>

                      <button
                        onClick={() => onDeleteTodo(task.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Notes List */
          <div className="py-2 space-y-2 max-h-[340px] overflow-y-auto">
            {notes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
                No notes logged yet. Use the Quick Action button (⌘K) to capture one instantly!
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-2.5 rounded-lg border bg-slate-950 border-slate-800 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {note.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-teal-400/90 bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-800/40">
                        {note.category}
                      </span>
                      {onDeleteNote && (
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono">
                    {note.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Instant WebSocket state replication</span>
        <span>{activeTab === 'tasks' ? `${filteredTasks.length} listed` : `${notes.length} notes`}</span>
      </div>
    </div>
  );
};
