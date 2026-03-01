'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { TaskRow } from '@/components/tasks/TaskRow';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ContextMenu, type ContextMenuAction } from '@/components/ui/ContextMenu';
import {
  IconArrowUp,
  IconMoon,
  IconPause,
  IconCheck,
  IconTrash,
} from '@/components/ui/Icons';
import type { Task } from '@/types';

interface MenuState {
  x: number;
  y: number;
  task: Task;
}

export default function PlanPage() {
  const {
    getTasksByStatus,
    getProject,
    updateTask,
    deleteTask,
    completeTask,
    letGoTask,
  } = useTaskStore();
  const { activeProjectFilter } = useAppStore();

  const [menu, setMenu] = useState<MenuState | null>(null);

  const byProject = useCallback(
    (tasks: Task[]) =>
      activeProjectFilter
        ? tasks.filter((t) => t.project_id === activeProjectFilter)
        : tasks,
    [activeProjectFilter]
  );

  const inboxTasks = useMemo(() => byProject(getTasksByStatus('inbox')), [byProject, getTasksByStatus]);
  const upcomingTasks = useMemo(
    () =>
      byProject(getTasksByStatus('upcoming')).sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }),
    [byProject, getTasksByStatus]
  );
  const waitingTasks = useMemo(() => byProject(getTasksByStatus('waiting')), [byProject, getTasksByStatus]);
  const somedayTasks = useMemo(() => byProject(getTasksByStatus('someday')), [byProject, getTasksByStatus]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: Task) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, task });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const getActions = (task: Task): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    if (task.status !== 'today') {
      actions.push({
        label: 'Move to Today',
        icon: <IconArrowUp size={14} />,
        onClick: () => updateTask(task.id, { status: 'today' }),
      });
    }

    if (task.status !== 'someday') {
      actions.push({
        label: 'Move to Someday',
        icon: <IconMoon size={14} />,
        onClick: () => updateTask(task.id, { status: 'someday', due_date: null }),
      });
    }

    if (task.status !== 'waiting') {
      actions.push({
        label: 'Waiting On...',
        icon: <IconPause size={14} />,
        onClick: () => {
          const who = window.prompt('Who or what is blocking this task?');
          if (who) {
            updateTask(task.id, { status: 'waiting', waiting_on: who });
          }
        },
      });
    }

    actions.push({
      label: 'Complete',
      icon: <IconCheck size={14} />,
      onClick: () => completeTask(task.id),
      separator: true,
    });

    actions.push({
      label: 'Let Go',
      icon: <IconMoon size={14} />,
      onClick: () => letGoTask(task.id),
    });

    actions.push({
      label: 'Delete',
      icon: <IconTrash size={14} />,
      onClick: () => deleteTask(task.id),
      variant: 'danger',
    });

    return actions;
  };

  return (
    <div className="p-4">
      {/* Header — matches Today page format */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plan</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Triage and organise your tasks
        </p>
      </div>

      {/* Inbox */}
      <CollapsibleSection
        title="Inbox"
        count={inboxTasks.length}
        badge={
          inboxTasks.length > 0
            ? { label: 'needs scoping', variant: 'warning' }
            : undefined
        }
      >
        {inboxTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">
            No tasks in inbox
          </p>
        ) : (
          <AnimatePresence>
            {inboxTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                variant="inbox"
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Upcoming */}
      <CollapsibleSection title="Upcoming" count={upcomingTasks.length}>
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">
            No upcoming tasks
          </p>
        ) : (
          <AnimatePresence>
            {upcomingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                variant="upcoming"
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Waiting On */}
      <CollapsibleSection title="Waiting On" count={waitingTasks.length}>
        {waitingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">
            No blocked tasks
          </p>
        ) : (
          <AnimatePresence>
            {waitingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                variant="waiting"
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Someday */}
      <CollapsibleSection title="Someday" count={somedayTasks.length}>
        {somedayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">
            No someday tasks
          </p>
        ) : (
          <AnimatePresence>
            {somedayTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                variant="someday"
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Context menu */}
      <AnimatePresence>
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            actions={getActions(menu.task)}
            onClose={closeMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
