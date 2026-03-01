'use client';

import type { Task, Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDueDate } from '@/lib/utils/dates';

interface TodayEmptyStateProps {
  inboxTasks: Task[];
  upcomingThisWeek: Task[];
  recentSomeday: Task[];
  projects: Project[];
  onAddToToday: (taskId: string) => void;
}

export function TodayEmptyState({
  inboxTasks,
  upcomingThisWeek,
  recentSomeday,
  projects,
  onAddToToday,
}: TodayEmptyStateProps) {
  const getProject = (id: string | null) => projects.find((p) => p.id === id);
  const hasAnything = inboxTasks.length > 0 || upcomingThisWeek.length > 0 || recentSomeday.length > 0;

  return (
    <div className="mt-12 max-w-md mx-auto">
      <p className="text-lg font-heading text-center text-muted-foreground">
        What are you focusing on today?
      </p>

      {hasAnything && (
        <div className="mt-8 space-y-6">
          {inboxTasks.length > 0 && (
            <PlanningSection title="Inbox" count={inboxTasks.length}>
              {inboxTasks.slice(0, 5).map((task) => (
                <PlanningRow
                  key={task.id}
                  task={task}
                  project={getProject(task.project_id)}
                  onAdd={() => onAddToToday(task.id)}
                />
              ))}
            </PlanningSection>
          )}

          {upcomingThisWeek.length > 0 && (
            <PlanningSection title="Due this week">
              {upcomingThisWeek.map((task) => (
                <PlanningRow
                  key={task.id}
                  task={task}
                  project={getProject(task.project_id)}
                  onAdd={() => onAddToToday(task.id)}
                  subtitle={task.due_date ? formatDueDate(task.due_date) : undefined}
                />
              ))}
            </PlanningSection>
          )}

          {recentSomeday.length > 0 && (
            <PlanningSection title="Someday">
              {recentSomeday.slice(0, 5).map((task) => (
                <PlanningRow
                  key={task.id}
                  task={task}
                  project={getProject(task.project_id)}
                  onAdd={() => onAddToToday(task.id)}
                />
              ))}
            </PlanningSection>
          )}
        </div>
      )}

      {!hasAnything && (
        <p className="text-sm font-ui text-center text-muted-foreground/60 mt-3">
          Capture a task or plan your day from the Plan view.
        </p>
      )}
    </div>
  );
}

function PlanningSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="section-label">
          {title}
        </span>
        {count !== undefined && (
          <Badge variant="muted" size="sm">{count}</Badge>
        )}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function PlanningRow({
  task,
  project,
  subtitle,
  onAdd,
}: {
  task: Task;
  project?: Project | null;
  subtitle?: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted group">
      {project && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: project.colour }}
        />
      )}
      <span className="flex-1 text-sm font-ui truncate">{task.title}</span>
      {subtitle && (
        <span className="text-xs font-mono text-muted-foreground">{subtitle}</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="text-xs font-ui text-accent opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded hover:bg-accent/10"
      >
        + Today
      </button>
    </div>
  );
}
