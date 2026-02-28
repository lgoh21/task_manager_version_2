'use client';

import { AnimatePresence, Reorder } from 'framer-motion';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { isHeavyDay } from '@/lib/utils/tasks';
import { isThisWeek } from '@/lib/utils/dates';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TodayEmptyState } from '@/components/tasks/TodayEmptyState';
import { Badge } from '@/components/ui/Badge';

export default function TodayPage() {
  const { getTasksByStatus, updateTask, projects, getProject } = useTaskStore();

  const todayTasks = getTasksByStatus('today');
  const inboxTasks = getTasksByStatus('inbox');
  const somedayTasks = getTasksByStatus('someday');
  const upcomingTasks = getTasksByStatus('upcoming');

  const upcomingThisWeek = upcomingTasks.filter(
    (t) => t.due_date && isThisWeek(t.due_date)
  );

  const heavyDay = isHeavyDay(todayTasks);
  const isEmpty = todayTasks.length === 0;

  const handleAddToToday = (taskId: string) => {
    updateTask(taskId, { status: 'today', sort_order: todayTasks.length });
  };

  const handleReorder = (newOrder: typeof todayTasks) => {
    newOrder.forEach((task, index) => {
      if (task.sort_order !== index) {
        updateTask(task.id, { sort_order: index });
      }
    });
  };


  return (
    <div className="p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {heavyDay && (
            <Badge variant="warning" size="sm">Heavy day</Badge>
          )}
        </div>
      </div>

      {/* Empty state or task list */}
      {isEmpty ? (
        <TodayEmptyState
          inboxTasks={inboxTasks}
          upcomingThisWeek={upcomingThisWeek}
          recentSomeday={somedayTasks}
          projects={projects}
          onAddToToday={handleAddToToday}
        />
      ) : (
        <div className="mt-4">
          <Reorder.Group
            axis="y"
            values={todayTasks}
            onReorder={handleReorder}
            className=""
          >
            <AnimatePresence>
              {todayTasks.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  className="list-none"
                >
                  <TaskRow
                    task={task}
                    project={getProject(task.project_id)}
                    variant="today"
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
