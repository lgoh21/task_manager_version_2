'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAllTasks, useUpdateTask, useDeleteTask, useCompleteTask, useLetGoTask } from '@/lib/hooks/queries/useTasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useAllSubtasks } from '@/lib/hooks/queries/useSubtasks';
import { useAllTags, useAllTaskTags } from '@/lib/hooks/queries/useTags';
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
  const { data: allTasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: allSubtasks = [] } = useAllSubtasks();
  const { data: allTagsList = [] } = useAllTags();
  const { data: allTaskTags = [] } = useAllTaskTags();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const letGoTaskMutation = useLetGoTask();
  const { activeProjectFilter } = useAppStore();
  const { dragTarget, pendingWaitingTaskId, clearPendingWaiting, handleDragOver, handleDragLeave, handleDrop } = usePlanDrag();

  const getProject = useCallback((id: string | null) => projects.find(p => p.id === id) ?? null, [projects]);
  const getSubtasksForTask = useCallback((taskId: string) => allSubtasks.filter(s => s.task_id === taskId), [allSubtasks]);
  const getTagsForTask = useCallback((taskId: string) => {
    const tagIds = allTaskTags.filter(tt => tt.task_id === taskId).map(tt => tt.tag_id);
    return allTagsList.filter(t => tagIds.includes(t.id));
  }, [allTaskTags, allTagsList]);

  const doUpdateTask = useCallback((id: string, updates: Record<string, unknown>) => {
    updateTaskMutation.mutate({ id, updates });
  }, [updateTaskMutation]);

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

  const inboxTasks = useMemo(() => filterTasks(allTasks.filter(t => t.status === 'inbox').sort((a, b) => a.sort_order - b.sort_order)), [filterTasks, allTasks]);
  const upcomingTasks = useMemo(
    () =>
      filterTasks(allTasks.filter(t => t.status === 'upcoming')).sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }),
    [filterTasks, allTasks]
  );
  const waitingTasks = useMemo(() => filterTasks(allTasks.filter(t => t.status === 'waiting')), [filterTasks, allTasks]);
  const somedayTasks = useMemo(() => filterTasks(allTasks.filter(t => t.status === 'someday')), [filterTasks, allTasks]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: Task) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, task });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleRevive = useCallback(
    (taskId: string) => updateTaskMutation.mutate({ id: taskId, updates: { updated_at: new Date().toISOString() } }),
    [updateTaskMutation]
  );

  const getActions = (task: Task): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    if (task.status !== 'today') {
      actions.push({
        label: 'Move to Today',
        icon: <IconArrowUp size={14} />,
        onClick: () => updateTaskMutation.mutate({ id: task.id, updates: { status: 'today' } }),
      });
    }

    if (task.status !== 'someday') {
      actions.push({
        label: 'Move to Someday',
        icon: <IconMoon size={14} />,
        onClick: () => updateTaskMutation.mutate({ id: task.id, updates: { status: 'someday', due_date: null } }),
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
      onClick: () => completeTaskMutation.mutate(task.id),
      separator: true,
    });

    actions.push({
      label: 'Let Go',
      icon: <IconMoon size={14} />,
      onClick: () => letGoTaskMutation.mutate(task.id),
    });

    actions.push({
      label: 'Delete',
      icon: <IconTrash size={14} />,
      onClick: () => deleteTaskMutation.mutate(task.id),
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
        onDrop={handleDrop('inbox', doUpdateTask)}
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
        onDrop={handleDrop('upcoming', doUpdateTask)}
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
        onDrop={handleDrop('waiting', doUpdateTask)}
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
        onDrop={handleDrop('someday', doUpdateTask)}
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
                hasSubtasks={getSubtasksForTask(task.id).length > 0}
                draggable
                onContextMenu={handleContextMenu}
                onRevive={handleRevive}
                onLetGo={(id: string) => letGoTaskMutation.mutate(id)}
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
            updateTaskMutation.mutate({ id: activeWaitingTaskId, updates: { status: 'waiting', waiting_on: text } });
          }
          setWaitingTaskId(null);
          clearPendingWaiting();
        }}
      />
    </div>
  );
}
