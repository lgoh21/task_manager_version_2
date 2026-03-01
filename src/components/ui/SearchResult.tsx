'use client';

import type { Task, Note, Project } from '@/types';
import { IconToday, IconPlan, IconNotes, IconHistory, IconInbox, IconMoon, IconPause, IconCalendar } from '@/components/ui/Icons';

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  today: { label: 'Today', icon: <IconToday size={12} /> },
  inbox: { label: 'Inbox', icon: <IconInbox size={12} /> },
  someday: { label: 'Someday', icon: <IconMoon size={12} /> },
  upcoming: { label: 'Upcoming', icon: <IconCalendar size={12} /> },
  waiting: { label: 'Waiting', icon: <IconPause size={12} /> },
  done: { label: 'Completed', icon: <IconHistory size={12} /> },
  let_go: { label: 'Let Go', icon: <IconHistory size={12} /> },
};

export type SearchResultItem =
  | { type: 'task'; task: Task; project: Project | null; snippet: string | null }
  | { type: 'note'; note: Note; snippet: string };

interface SearchResultProps {
  item: SearchResultItem;
  active: boolean;
  onSelect: () => void;
}

export function SearchResult({ item, active, onSelect }: SearchResultProps) {
  if (item.type === 'task') {
    const { task, project, snippet } = item;
    const statusInfo = STATUS_LABELS[task.status];
    return (
      <button
        onClick={onSelect}
        data-active={active || undefined}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-md transition-colors hover:bg-muted data-[active]:bg-muted"
      >
        <span className="mt-0.5 text-muted-foreground shrink-0">{statusInfo?.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block truncate">{task.title}</span>
          {snippet && (
            <span className="text-xs text-muted-foreground block truncate mt-0.5">{snippet}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {project && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.colour }} />
              <span className="text-[10px] text-muted-foreground">{project.name}</span>
            </span>
          )}
          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            {statusInfo?.label}
          </span>
        </div>
      </button>
    );
  }

  const { note, snippet } = item;
  return (
    <button
      onClick={onSelect}
      data-active={active || undefined}
      className="w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-md transition-colors hover:bg-muted data-[active]:bg-muted"
    >
      <span className="mt-0.5 text-muted-foreground shrink-0"><IconNotes size={12} /></span>
      <div className="flex-1 min-w-0">
        <span className="text-sm block truncate">{snippet}</span>
      </div>
      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted shrink-0">
        Note
      </span>
    </button>
  );
}
