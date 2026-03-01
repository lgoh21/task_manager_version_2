'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { taskRowVariants } from '@/config/animations';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { getDecayOpacity, getDecayLabel, getDecayStage } from '@/lib/utils/decay';
import { getCarriedForwardLabel } from '@/lib/utils/carriedForward';
import { formatDueDate } from '@/lib/utils/dates';
import type { Task, Project, Tag } from '@/types';

interface TaskRowProps {
  task: Task;
  project?: Project | null;
  tags?: Tag[];
  variant?: 'today' | 'plan' | 'someday' | 'waiting' | 'upcoming' | 'inbox' | 'history';
  hasSubtasks?: boolean;
  draggable?: boolean;
  onContextMenu?: (e: React.MouseEvent, task: Task) => void;
  onRevive?: (taskId: string) => void;
  onLetGo?: (taskId: string) => void;
}

export function TaskRow({
  task,
  project,
  tags,
  variant = 'today',
  hasSubtasks,
  draggable: isDraggable,
  onContextMenu,
  onRevive,
  onLetGo,
}: TaskRowProps) {
  const { selectedTaskId, selectTask } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const isSelected = selectedTaskId === task.id;
  const hasSelection = selectedTaskId !== null;
  const decayOpacity = variant === 'someday' ? getDecayOpacity(task.updated_at) : 1;
  const decayLabel = variant === 'someday' ? getDecayLabel(task.updated_at) : null;
  const isFullyDecayed = variant === 'someday' && getDecayStage(task.updated_at) === 'fully_decayed';
  const carriedLabel = variant === 'today' ? getCarriedForwardLabel(task) : null;

  const showNudge = variant === 'someday' && !hasSubtasks && !task.notes;

  const rowOpacity = hasSelection && !isSelected
    ? Math.min(decayOpacity, 0.45)
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
      layout
      onClick={() => selectTask(task.id)}
      onContextMenu={(e) => onContextMenu?.(e, task)}
      className={`flex flex-col gap-1 px-4 py-3 -mx-4 transition-colors duration-150 hover:bg-subtle ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${isSelected ? 'bg-muted' : ''}${showNudge ? ' border-l-2 border-dashed border-warning/30' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium leading-snug flex-1 min-w-0 truncate">
          {task.title}
        </span>
        {variant === 'upcoming' && task.due_date && (
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatDueDate(task.due_date)}
          </span>
        )}
        {carriedLabel && (
          <span className="text-[11px] text-warning shrink-0">
            {carriedLabel}
          </span>
        )}
        {decayLabel && (
          <span className="text-[11px] text-muted-foreground italic shrink-0">
            {decayLabel}
          </span>
        )}
        {isFullyDecayed && <DecayActions taskId={task.id} onRevive={onRevive} onLetGo={onLetGo} />}
      </div>

      {variant === 'waiting' && task.waiting_on && (
        <span className="text-xs text-muted-foreground truncate">
          Waiting on {task.waiting_on}
        </span>
      )}

      {(project || (tags && tags.length > 0)) && (
        <span className="flex items-center gap-1.5 flex-wrap">
          {project && (
            <>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.colour }}
              />
              <span className="text-xs text-muted-foreground">{project.name}</span>
            </>
          )}
          {tags && tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent"
            >
              #{tag.name}
            </span>
          ))}
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
}

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
        className="text-[11px] font-medium px-1.5 py-0.5 rounded text-accent hover:bg-accent/10"
      >
        Revive
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onLetGo?.(taskId); }}
        className="text-[11px] font-medium px-1.5 py-0.5 rounded text-muted-foreground hover:bg-muted"
      >
        Let go
      </button>
    </span>
  );
}
