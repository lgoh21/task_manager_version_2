'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAllTasks, useRestoreTask, useDeleteTask } from '@/lib/hooks/queries/useTasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useAllSubtasks } from '@/lib/hooks/queries/useSubtasks';
import { useToast } from '@/components/ui/Toast';
import { isThisWeek } from '@/lib/utils/dates';
import { IconSearch } from '@/components/ui/Icons';
import { HistoryEntry } from '@/components/tasks/HistoryEntry';

type HistoryTab = 'completed' | 'let_go';

export default function HistoryPage() {
  const { data: allTasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: allSubtasks = [] } = useAllSubtasks();
  const restoreTaskMutation = useRestoreTask();
  const deleteTaskMutation = useDeleteTask();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<HistoryTab>('completed');
  const [search, setSearch] = useState('');

  const completedTasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()),
    [allTasks]
  );

  const letGoTasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.status === 'let_go')
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()),
    [allTasks]
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
        projects.find((p) => p.id === t.project_id)?.name.toLowerCase().includes(q)
    );
  }, [activeTasks, search, projects]);

  const handleRestore = (id: string) => {
    const task = allTasks.find((t) => t.id === id);
    restoreTaskMutation.mutate(id);
    showToast(`"${task?.title}" restored to Inbox`);
  };

  const handleDelete = (id: string) => {
    const task = allTasks.find((t) => t.id === id);
    deleteTaskMutation.mutate(id);
    showToast(`"${task?.title}" deleted permanently`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-[30px] font-bold tracking-tight">History</h1>
        <p className="font-ui text-muted-foreground mt-0.5 text-sm">
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
        <div className="mt-3 text-sm font-ui text-success font-medium">
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
          className="w-full pl-9 pr-3 py-2 text-sm font-ui bg-muted/50 border border-border rounded-lg outline-none focus:border-accent/40 transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* Task list */}
      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm font-ui text-muted-foreground py-8 text-center">
            {search.trim()
              ? 'No matching tasks found.'
              : activeTab === 'completed'
                ? 'No completed tasks yet.'
                : 'No let-go tasks yet.'}
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((task) => (
              <HistoryEntry
                key={task.id}
                task={task}
                project={projects.find((p) => p.id === task.project_id) ?? null}
                subtasks={allSubtasks.filter((s) => s.task_id === task.id)}
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
      className={`px-3 py-2 text-sm font-ui font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-accent text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      <span className="ml-1.5 text-xs font-mono text-muted-foreground">{count}</span>
    </button>
  );
}
