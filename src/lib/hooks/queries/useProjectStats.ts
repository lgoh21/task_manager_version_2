// useProjectStats.ts — Derived project stats and activity from cached task data

'use client';

import { useMemo } from 'react';
import { useAllTasks } from './useTasks';
import type { ActivityEntry } from '@/types';

export function useProjectStats(projectId: string | null) {
  const { data: allTasks = [] } = useAllTasks();

  return useMemo(() => {
    if (!projectId) return null;
    const projectTasks = allTasks.filter((t) => t.project_id === projectId);

    return {
      active: projectTasks.filter((t) => ['inbox', 'someday', 'upcoming'].includes(t.status)).length,
      today: projectTasks.filter((t) => t.status === 'today').length,
      waiting: projectTasks.filter((t) => t.status === 'waiting').length,
      done: projectTasks.filter((t) => t.status === 'done').length,
    };
  }, [allTasks, projectId]);
}

export function useProjectActivity(projectId: string | null): ActivityEntry[] {
  const { data: allTasks = [] } = useAllTasks();

  return useMemo(() => {
    if (!projectId) return [];
    const projectTasks = allTasks.filter((t) => t.project_id === projectId);
    const entries: ActivityEntry[] = [];

    for (const task of projectTasks) {
      if (task.status === 'done' && task.completed_at) {
        entries.push({
          id: `${task.id}-done`,
          type: 'completed',
          taskTitle: task.title,
          timestamp: task.completed_at,
        });
      } else if (task.status === 'let_go' && task.completed_at) {
        entries.push({
          id: `${task.id}-let_go`,
          type: 'let_go',
          taskTitle: task.title,
          timestamp: task.completed_at,
        });
      }

      // Show "added" for active (non-terminal) tasks
      if (task.status !== 'done' && task.status !== 'let_go') {
        entries.push({
          id: `${task.id}-added`,
          type: 'added',
          taskTitle: task.title,
          timestamp: task.created_at,
        });
      }
    }

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return entries.slice(0, 10);
  }, [allTasks, projectId]);
}
