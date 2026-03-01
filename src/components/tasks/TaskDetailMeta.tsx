'use client';

import { Badge } from '@/components/ui/Badge';
import { IconCalendar } from '@/components/ui/Icons';
import { TASK_SIZES } from '@/config/constants';
import { formatDueDate } from '@/lib/utils/dates';
import { getCarriedForwardLabel } from '@/lib/utils/carriedForward';
import type { Task, TaskSize } from '@/types';

interface TaskDetailMetaProps {
  task: Task;
  onUpdateSize: (size: TaskSize) => void;
}

function getDueDateUrgency(dateStr: string): 'default' | 'warning' | 'accent' {
  const now = new Date();
  const due = new Date(dateStr);
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'warning';
  if (diffDays <= 2) return 'warning';
  return 'default';
}

export function TaskDetailMeta({ task, onUpdateSize }: TaskDetailMetaProps) {
  const carriedLabel = getCarriedForwardLabel(task);

  return (
    <div className="flex items-center gap-2.5 px-6 pb-2 mb-4 flex-wrap">
      {/* Size pills */}
      <div className="flex items-center rounded-full bg-muted p-0.5 border border-border">
        {TASK_SIZES.map((s) => (
          <button
            key={s}
            onClick={() => onUpdateSize(s)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              task.size === s
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Due date */}
      {task.due_date && (
        <Badge variant={getDueDateUrgency(task.due_date)} size="md">
          <IconCalendar size={12} className="mr-1" />
          {formatDueDate(task.due_date)}
        </Badge>
      )}

      {/* Carried forward */}
      {carriedLabel && (
        <Badge variant="warning" size="md">{carriedLabel}</Badge>
      )}
    </div>
  );
}
