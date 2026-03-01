'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { usePlanDrag } from '@/lib/hooks/usePlanDrag';
import { TaskRow } from '@/components/tasks/TaskRow';
import { WaitingOnModal } from '@/components/tasks/WaitingOnModal';
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
    getSubtasks,
    getTagsForTask,
    updateTask,
    deleteTask,
    completeTask,
    letGoTask,
  } = useTaskStore();
  const { activeProjectFilter } = useAppStore();
  const { dragTarget, pendingWaitingTaskId, clearPendingWaiting, handleDragOver, handleDragLeave, handleDrop } = usePlanDrag();

  const [menu, setMenu] = useState<MenuState | null>(null);
  const [waitingTaskId, setWaitingTaskId] = useState<string | null>(null);

  // Either the context menu or the drag-drop can trigger the waiting modal
  const activeWaitingTaskId = waitingTaskId ?? pendingWaitingTaskId;

  const filterTasks = useCallback(
    (tasks: Task[]) => {
      let filtered = tasks;
      if (activeProjectFilter) {
        filtered = filtered.filter((t) => t.project_id === activeProjectFilter);
      }
      return filtered;
    },
    [activeProjectFilter]
  );

  const inboxTasks = useMemo(() => filterTasks(getTasksByStatus('inbox')), [filterTasks, getTasksByStatus]);
  const upcomingTasks = useMemo(
    () =>
      filterTasks(getTasksByStatus('upcoming')).sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }),
    [filterTasks, getTasksByStatus]
  );
  const waitingTasks = useMemo(() => filterTasks(getTasksByStatus('waiting')), [filterTasks, getTasksByStatus]);
  const somedayTasks = useMemo(() => filterTasks(getTasksByStatus('someday')), [filterTasks, getTasksByStatus]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: Task) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, task });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleRevive = useCallback(
    (taskId: string) => updateTask(taskId, { updated_at: new Date().toISOString() }),
    [updateTask]
  );

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
        onClick: () => setWaitingTaskId(task.id),
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
    <div>
      {/* Header */}
      <div className="px-8 pt-8">
        <h1 className="font-heading text-[30px] font-bold tracking-tight">Plan</h1>
        <p className="font-mono text-[13px] text-muted-foreground mt-0.5">
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
        isDragTarget={dragTarget === 'inbox'}
        onDragOver={handleDragOver('inbox')}
        onDrop={handleDrop('inbox', updateTask)}
        onDragLeave={handleDragLeave('inbox')}
      >
        {inboxTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-8">
            No tasks in inbox
          </p>
        ) : (
          <AnimatePresence>
            {inboxTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                tags={getTagsForTask(task.id)}
                variant="inbox"
                draggable
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Upcoming */}
      <CollapsibleSection
        title="Upcoming"
        count={upcomingTasks.length}
        isDragTarget={dragTarget === 'upcoming'}
        onDragOver={handleDragOver('upcoming')}
        onDrop={handleDrop('upcoming', updateTask)}
        onDragLeave={handleDragLeave('upcoming')}
      >
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-8">
            No upcoming tasks
          </p>
        ) : (
          <AnimatePresence>
            {upcomingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                tags={getTagsForTask(task.id)}
                variant="upcoming"
                draggable
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Waiting On */}
      <CollapsibleSection
        title="Waiting On"
        count={waitingTasks.length}
        isDragTarget={dragTarget === 'waiting'}
        onDragOver={handleDragOver('waiting')}
        onDrop={handleDrop('waiting', updateTask)}
        onDragLeave={handleDragLeave('waiting')}
      >
        {waitingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-8">
            No blocked tasks
          </p>
        ) : (
          <AnimatePresence>
            {waitingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                tags={getTagsForTask(task.id)}
                variant="waiting"
                draggable
                onContextMenu={handleContextMenu}
              />
            ))}
          </AnimatePresence>
        )}
      </CollapsibleSection>

      {/* Someday */}
      <CollapsibleSection
        title="Someday"
        count={somedayTasks.length}
        isDragTarget={dragTarget === 'someday'}
        onDragOver={handleDragOver('someday')}
        onDrop={handleDrop('someday', updateTask)}
        onDragLeave={handleDragLeave('someday')}
      >
        {somedayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-8">
            No someday tasks
          </p>
        ) : (
          <AnimatePresence>
            {somedayTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={getProject(task.project_id)}
                tags={getTagsForTask(task.id)}
                variant="someday"
                hasSubtasks={getSubtasks(task.id).length > 0}
                draggable
                onContextMenu={handleContextMenu}
                onRevive={handleRevive}
                onLetGo={letGoTask}
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

      {/* Waiting On modal */}
      <WaitingOnModal
        isOpen={!!activeWaitingTaskId}
        onClose={() => { setWaitingTaskId(null); clearPendingWaiting(); }}
        onSubmit={(text) => {
          if (activeWaitingTaskId) {
            updateTask(activeWaitingTaskId, { status: 'waiting', waiting_on: text });
          }
          setWaitingTaskId(null);
          clearPendingWaiting();
        }}
      />
    </div>
  );
}
