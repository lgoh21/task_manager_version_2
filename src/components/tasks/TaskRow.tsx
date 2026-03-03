'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { taskRowVariants } from '@/config/animations';
import { getDecayOpacity, getDecayLabel, getDecayStage } from '@/lib/utils/decay';
import { getCarriedForwardLabel } from '@/lib/utils/carriedForward';
import { formatDueDate } from '@/lib/utils/dates';
import type { Task, Project, Tag } from '@/types';

interface TaskRowProps {
  task: Task;
  project?: Project | null;
  tags?: Tag[];
  variant?: 'today' | 'plan' | 'someday' | 'waiting' | 'upcoming' | 'inbox' | 'history';
  isSelected?: boolean;
  hasSelection?: boolean;
  onSelect?: (taskId: string) => void;
  hasSubtasks?: boolean;
  draggable?: boolean;
  onContextMenu?: (e: React.MouseEvent, task: Task) => void;
  onRevive?: (taskId: string) => void;
  onLetGo?: (taskId: string) => void;
}

export const TaskRow = memo(function TaskRow({
  task, project, variant = 'today', isSelected, hasSelection,
  onSelect, hasSubtasks, draggable: isDraggable, onContextMenu, onRevive, onLetGo,
}: TaskRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const decayOpacity = variant === 'someday' ? getDecayOpacity(task.updated_at) : 1;
  const decayLabel = variant === 'someday' ? getDecayLabel(task.updated_at) : null;
  const isFullyDecayed = variant === 'someday' && getDecayStage(task.updated_at) === 'fully_decayed';
  const carriedLabel = variant === 'today' ? getCarriedForwardLabel(task) : null;

  const showNudge = variant === 'someday' && !hasSubtasks && !task.notes;

  const rowOpacity = hasSelection && !isSelected
    ? Math.min(decayOpacity, 0.75)
    : decayOpacity;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const inner = (
    <motion.div
      variants={taskRowVariants}
      initial="initial"
      animate={{ opacity: isDragging ? 0.5 : rowOpacity, y: 0 }}
      exit="exit"
      onClick={() => onSelect?.(task.id)}
      onContextMenu={(e) => onContextMenu?.(e, task)}
      className={`task-row flex-col !items-stretch gap-1 ${
        isDraggable ? '!cursor-grab active:!cursor-grabbing' : ''
      } ${isSelected ? 'task-row-selected' : ''}${showNudge ? ' border-l-2 border-dashed border-warning/30' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-ui text-sm leading-snug flex-1 min-w-0 truncate">
          {task.title}
        </span>
        {task.due_date && (
          <span className="font-mono text-[11.5px] text-muted-foreground shrink-0">
            {formatDueDate(task.due_date)}
          </span>
        )}
        {carriedLabel && (
          <span className="font-mono text-[11.5px] text-warning shrink-0">
            {carriedLabel}
          </span>
        )}
        {decayLabel && (
          <span className="font-mono text-[11.5px] text-muted-foreground italic shrink-0">
            {decayLabel}
          </span>
        )}
        {isFullyDecayed && <DecayActions taskId={task.id} onRevive={onRevive} onLetGo={onLetGo} />}
      </div>

      {variant === 'waiting' && task.waiting_on && (
        <span className="font-ui text-xs text-muted-foreground truncate">
          Waiting on {task.waiting_on}
        </span>
      )}

      {project && (
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full opacity-70 shrink-0"
            style={{ backgroundColor: project.colour }}
          />
          <span className="font-mono text-[11.5px] text-muted-foreground">{project.name}</span>
        </span>
      )}
    </motion.div>
  );

  if (isDraggable) {
    return (
      <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {inner}
      </div>
    );
  }

  return inner;
});

/** Inline Revive / Let Go buttons for fully-decayed someday tasks */
function DecayActions({
  taskId,
  onRevive,
  onLetGo,
}: {
  taskId: string;
  onRevive?: (taskId: string) => void;
  onLetGo?: (taskId: string) => void;
}) {
  return (
    <span className="flex items-center gap-1 shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); onRevive?.(taskId); }}
        className="font-mono text-[11.5px] font-medium px-1.5 py-0.5 rounded text-accent hover:bg-accent/10"
      >
        Revive
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onLetGo?.(taskId); }}
        className="font-mono text-[11.5px] font-medium px-1.5 py-0.5 rounded text-muted-foreground hover:bg-muted"
      >
        Let go
      </button>
    </span>
  );
}
