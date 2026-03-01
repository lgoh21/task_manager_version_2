import { useState, useCallback } from 'react';
import type { TaskStatus } from '@/types';

/** Status each Plan section maps to */
type PlanSection = 'inbox' | 'upcoming' | 'waiting' | 'someday';

interface PlanDragState {
  dragTarget: PlanSection | null;
  /** Task ID dropped on the Waiting section, needs a waiting_on prompt */
  pendingWaitingTaskId: string | null;
  clearPendingWaiting: () => void;
  handleDragOver: (section: PlanSection) => (e: React.DragEvent) => void;
  handleDragLeave: (section: PlanSection) => (e: React.DragEvent) => void;
  handleDrop: (
    section: PlanSection,
    updateTask: (id: string, updates: Record<string, unknown>) => void,
  ) => (e: React.DragEvent) => void;
}

export function usePlanDrag(): PlanDragState {
  const [dragTarget, setDragTarget] = useState<PlanSection | null>(null);
  const [pendingWaitingTaskId, setPendingWaitingTaskId] = useState<string | null>(null);

  const clearPendingWaiting = useCallback(() => setPendingWaitingTaskId(null), []);

  const handleDragOver = useCallback(
    (section: PlanSection) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragTarget(section);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (section: PlanSection) => (e: React.DragEvent) => {
      // Only clear if leaving the section entirely (not entering a child)
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragTarget((prev) => (prev === section ? null : prev));
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (
      section: PlanSection,
      updateTask: (id: string, updates: Record<string, unknown>) => void,
    ) =>
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragTarget(null);
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;

      const statusMap: Record<PlanSection, TaskStatus> = {
        inbox: 'inbox',
        upcoming: 'upcoming',
        waiting: 'waiting',
        someday: 'someday',
      };

      if (section === 'waiting') {
        setPendingWaitingTaskId(taskId);
      } else {
        updateTask(taskId, {
          status: statusMap[section],
          waiting_on: null,
          ...(section === 'someday' ? { due_date: null } : {}),
        });
      }
    },
    [],
  );

  return { dragTarget, pendingWaitingTaskId, clearPendingWaiting, handleDragOver, handleDragLeave, handleDrop };
}
