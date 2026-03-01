'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { IconCalendar, IconPlus } from '@/components/ui/Icons';
import { DatePicker } from '@/components/tasks/DatePicker';
import { TASK_SIZES } from '@/config/constants';
import { formatDueDate } from '@/lib/utils/dates';
import { getCarriedForwardLabel } from '@/lib/utils/carriedForward';
import type { Task, TaskSize } from '@/types';

interface TaskDetailMetaProps {
  task: Task;
  onUpdateSize: (size: TaskSize) => void;
  onUpdateDueDate: (dueDate: string | null) => void;
}

function getDueDateUrgency(dateStr: string): 'default' | 'warning' | 'accent' {
  const now = new Date();
  const due = new Date(dateStr);
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'warning';
  if (diffDays <= 2) return 'warning';
  return 'default';
}

export function TaskDetailMeta({ task, onUpdateSize, onUpdateDueDate }: TaskDetailMetaProps) {
  const carriedLabel = getCarriedForwardLabel(task);
  const [pickerOpen, setPickerOpen] = useState(false);

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
      <div className="relative">
        {task.due_date ? (
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="cursor-pointer"
          >
            <Badge variant={getDueDateUrgency(task.due_date)} size="md" className="hover:opacity-80 transition-opacity">
              <IconCalendar size={12} className="mr-1" />
              {formatDueDate(task.due_date)}
            </Badge>
          </button>
        ) : (
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <IconPlus size={12} />
            Add due date
          </button>
        )}
        <AnimatePresence>
          {pickerOpen && (
            <DatePicker
              currentDate={task.due_date}
              onSelect={onUpdateDueDate}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Carried forward */}
      {carriedLabel && (
        <Badge variant="warning" size="md">{carriedLabel}</Badge>
      )}
    </div>
  );
}
