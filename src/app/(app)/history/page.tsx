'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { useToast } from '@/components/ui/Toast';
import { isThisWeek } from '@/lib/utils/dates';
import { IconSearch } from '@/components/ui/Icons';
import { HistoryEntry } from '@/components/tasks/HistoryEntry';

type HistoryTab = 'completed' | 'let_go';

export default function HistoryPage() {
  const { tasks, getProject, getSubtasks, restoreTask, deleteTask } = useTaskStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<HistoryTab>('completed');
  const [search, setSearch] = useState('');

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()),
    [tasks]
  );

  const letGoTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'let_go')
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()),
    [tasks]
  );

  const doneThisWeek = useMemo(
    () => completedTasks.filter((t) => t.completed_at && isThisWeek(t.completed_at)).length,
    [completedTasks]
  );

  const activeTasks = activeTab === 'completed' ? completedTasks : letGoTasks;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeTasks;
    const q = search.toLowerCase();
    return activeTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        getProject(t.project_id)?.name.toLowerCase().includes(q)
    );
  }, [activeTasks, search, getProject]);

  const handleRestore = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    restoreTask(id);
    showToast(`"${task?.title}" restored to Inbox`);
  };

  const handleDelete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    deleteTask(id);
    showToast(`"${task?.title}" deleted permanently`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Completed and let-go tasks
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-1 border-b border-border">
        <TabButton
          active={activeTab === 'completed'}
          onClick={() => setActiveTab('completed')}
          label="Completed"
          count={completedTasks.length}
        />
        <TabButton
          active={activeTab === 'let_go'}
          onClick={() => setActiveTab('let_go')}
          label="Let Go"
          count={letGoTasks.length}
        />
      </div>

      {/* Done this week summary */}
      {activeTab === 'completed' && doneThisWeek > 0 && (
        <div className="mt-3 text-sm text-success font-medium">
          {doneThisWeek} done this week
        </div>
      )}

      {/* Search */}
      <div className="mt-3 relative">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:border-accent/40 transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* Task list */}
      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {search.trim()
              ? 'No matching tasks found.'
              : activeTab === 'completed'
                ? 'No completed tasks yet.'
                : 'No let-go tasks yet.'}
          </p>
        ) : (
          <AnimatePresence>
            {filtered.map((task) => (
              <HistoryEntry
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                subtasks={getSubtasks(task.id)}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-accent text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
