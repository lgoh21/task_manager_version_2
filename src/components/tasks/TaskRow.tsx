'use client';

import { motion } from 'framer-motion';
import { taskRowVariants } from '@/config/animations';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { getDecayOpacity } from '@/lib/utils/decay';
import type { Task, Project } from '@/types';

interface TaskRowProps {
  task: Task;
  project?: Project | null;
  variant?: 'today' | 'plan' | 'someday' | 'waiting' | 'upcoming' | 'history';
  onContextMenu?: (e: React.MouseEvent, task: Task) => void;
}

export function TaskRow({ task, project, variant = 'today', onContextMenu }: TaskRowProps) {
  const { selectedTaskId, selectTask } = useAppStore();
  const isSelected = selectedTaskId === task.id;
  const decayOpacity = variant === 'someday' ? getDecayOpacity(task.updated_at) : 1;

  return (
    <motion.div
      variants={taskRowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      onClick={() => selectTask(task.id)}
      onContextMenu={(e) => onContextMenu?.(e, task)}
      style={{ opacity: decayOpacity }}
      className={`flex flex-col gap-1 px-4 py-3 -mx-4 cursor-pointer transition-colors duration-150 hover:bg-subtle ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      {/* Title */}
      <span className="text-sm font-medium leading-snug">{task.title}</span>

      {/* Project name only */}
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
