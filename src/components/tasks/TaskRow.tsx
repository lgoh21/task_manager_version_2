'use client';

import { motion } from 'framer-motion';
import { taskRowVariants } from '@/config/animations';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { getDecayOpacity, getDecayLabel } from '@/lib/utils/decay';
import { formatDueDate } from '@/lib/utils/dates';
import type { Task, Project } from '@/types';

interface TaskRowProps {
  task: Task;
  project?: Project | null;
  variant?: 'today' | 'plan' | 'someday' | 'waiting' | 'upcoming' | 'inbox' | 'history';
  onContextMenu?: (e: React.MouseEvent, task: Task) => void;
}

export function TaskRow({ task, project, variant = 'today', onContextMenu }: TaskRowProps) {
  const { selectedTaskId, selectTask } = useAppStore();
  const isSelected = selectedTaskId === task.id;
  const hasSelection = selectedTaskId !== null;
  const decayOpacity = variant === 'someday' ? getDecayOpacity(task.updated_at) : 1;
  const decayLabel = variant === 'someday' ? getDecayLabel(task.updated_at) : null;

  // Fade unselected tasks when a task is selected
  const rowOpacity = hasSelection && !isSelected
    ? Math.min(decayOpacity, 0.45)
    : decayOpacity;

  return (
    <motion.div
      variants={taskRowVariants}
      initial="initial"
      animate={{ opacity: rowOpacity, y: 0 }}
      exit="exit"
      layout
      onClick={() => selectTask(task.id)}
      onContextMenu={(e) => onContextMenu?.(e, task)}
      className={`flex flex-col gap-1 px-4 py-3 -mx-4 cursor-pointer transition-colors duration-150 hover:bg-subtle ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      {/* Title row with optional due date */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium leading-snug flex-1 min-w-0 truncate">
          {task.title}
        </span>
        {variant === 'upcoming' && task.due_date && (
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatDueDate(task.due_date)}
          </span>
        )}
        {decayLabel && (
          <span className="text-[11px] text-muted-foreground italic shrink-0">
            {decayLabel}
          </span>
        )}
      </div>

      {/* Waiting-on subtitle */}
      {variant === 'waiting' && task.waiting_on && (
        <span className="text-xs text-muted-foreground truncate">
          Waiting on {task.waiting_on}
        </span>
      )}

      {/* Project pill */}
      {project && (
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: project.colour }}
          />
          <span className="text-xs text-muted-foreground">{project.name}</span>
        </span>
      )}
    </motion.div>
  );
}
