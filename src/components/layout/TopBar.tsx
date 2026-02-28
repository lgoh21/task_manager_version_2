'use client';

import { useAppStore } from '@/lib/hooks/useAppStore';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { CaptureBar } from '@/components/tasks/CaptureBar';
import { Badge } from '@/components/ui/Badge';

export function TopBar() {
  const { doneTodayCount, selectTask } = useAppStore();
  const { addTask } = useTaskStore();

  const handleCapture = (title: string) => {
    const newTask = addTask(title);
    selectTask(newTask.id);
  };

  return (
    <div className="shrink-0">
      <div className="flex items-center">
        <div className="flex-1">
          <CaptureBar onCapture={handleCapture} />
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
          {doneTodayCount > 0 && (
            <Badge variant="success" size="md">
              {doneTodayCount} done
            </Badge>
          )}
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            U
          </div>
        </div>
      </div>
    </div>
  );
}
