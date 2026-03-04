'use client';

import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { ProjectDashboard } from '@/components/projects/ProjectDashboard';

export function DetailPanel() {
  const { selectedTaskId, selectedProjectId, selectTask, selectProject } = useAppStore();

  return (
    <div className="flex-1 min-w-[384px] bg-muted">
      <AnimatePresence mode="wait">
        {selectedProjectId ? (
          <ProjectDashboard key={`project-${selectedProjectId}`} projectId={selectedProjectId} onClose={() => selectProject(null)} />
        ) : selectedTaskId ? (
          <TaskDetail key={selectedTaskId} taskId={selectedTaskId} onClose={() => selectTask(null)} />
        ) : (
          <div key="empty" className="h-full flex items-center justify-center text-muted-foreground/40 text-sm">
            Select a task or project
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
