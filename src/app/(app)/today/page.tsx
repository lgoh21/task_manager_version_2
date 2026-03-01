'use client';

import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, Reorder } from 'framer-motion';
import { useAllTasks, useUpdateTask, useDeleteTask, useCompleteTask, useLetGoTask } from '@/lib/hooks/queries/useTasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useAllTags, useAllTaskTags } from '@/lib/hooks/queries/useTags';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { isHeavyDay } from '@/lib/utils/tasks';
import { isThisWeek } from '@/lib/utils/dates';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TodayEmptyState } from '@/components/tasks/TodayEmptyState';
import { WaitingOnModal } from '@/components/tasks/WaitingOnModal';
import { ContextMenu, type ContextMenuAction } from '@/components/ui/ContextMenu';
import {
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

export default function TodayPage() {
  const { data: allTasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: allTagsList = [] } = useAllTags();
  const { data: allTaskTags = [] } = useAllTaskTags();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const letGoTaskMutation = useLetGoTask();
  const { activeProjectFilter, incrementDoneToday } = useAppStore();

  const getTagsForTask = useCallback((taskId: string) => {
    const tagIds = allTaskTags.filter(tt => tt.task_id === taskId).map(tt => tt.tag_id);
    return allTagsList.filter(t => tagIds.includes(t.id));
  }, [allTaskTags, allTagsList]);

  const allTodayTasks = useMemo(
    () => allTasks.filter(t => t.status === 'today').sort((a, b) => a.sort_order - b.sort_order),
    [allTasks]
  );
  const todayTasks = useMemo(() => {
    let filtered = allTodayTasks;
    if (activeProjectFilter) {
      filtered = filtered.filter((t) => t.project_id === activeProjectFilter);
    }
    return filtered;
  }, [allTodayTasks, activeProjectFilter]);
  const inboxTasks = useMemo(() => allTasks.filter(t => t.status === 'inbox'), [allTasks]);
  const somedayTasks = useMemo(() => allTasks.filter(t => t.status === 'someday'), [allTasks]);
  const upcomingTasks = useMemo(() => allTasks.filter(t => t.status === 'upcoming'), [allTasks]);

  const upcomingThisWeek = upcomingTasks.filter(
    (t) => t.due_date && isThisWeek(t.due_date)
  );

  const [menu, setMenu] = useState<MenuState | null>(null);
  const [waitingTaskId, setWaitingTaskId] = useState<string | null>(null);

  const heavyDay = isHeavyDay(todayTasks);
  const isEmpty = todayTasks.length === 0 && !activeProjectFilter;

  const handleAddToToday = (taskId: string) => {
    updateTaskMutation.mutate({ id: taskId, updates: { status: 'today', sort_order: todayTasks.length } });
  };

  const handleReorder = (newOrder: typeof todayTasks) => {
    newOrder.forEach((task, index) => {
      if (task.sort_order !== index) {
        updateTaskMutation.mutate({ id: task.id, updates: { sort_order: index } });
      }
    });
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: Task) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, task });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const getActions = (task: Task): ContextMenuAction[] => [
    {
      label: 'Waiting On...',
      icon: <IconPause size={14} />,
      onClick: () => setWaitingTaskId(task.id),
    },
    {
      label: 'Move to Someday',
      icon: <IconMoon size={14} />,
      onClick: () => updateTaskMutation.mutate({ id: task.id, updates: { status: 'someday', due_date: null } }),
    },
    {
      label: 'Complete',
      icon: <IconCheck size={14} />,
      onClick: () => { completeTaskMutation.mutate(task.id); incrementDoneToday(); },
      separator: true,
    },
    {
      label: 'Let Go',
      icon: <IconMoon size={14} />,
      onClick: () => letGoTaskMutation.mutate(task.id),
    },
    {
      label: 'Delete',
      icon: <IconTrash size={14} />,
      onClick: () => deleteTaskMutation.mutate(task.id),
      variant: 'danger',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-8">
        <h1 className="font-heading text-[30px] font-bold tracking-tight">Today</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-mono text-[13px] text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {heavyDay && (
            <span className="font-mono text-[11.5px] font-medium text-accent">Heavy day</span>
          )}
        </div>
      </div>

      {/* Empty state or task list */}
      {isEmpty ? (
        <div className="px-8">
          <TodayEmptyState
            inboxTasks={inboxTasks}
            upcomingThisWeek={upcomingThisWeek}
            recentSomeday={somedayTasks}
            projects={projects}
            onAddToToday={handleAddToToday}
          />
        </div>
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
                    project={projects.find(p => p.id === task.project_id) ?? null}
                    tags={getTagsForTask(task.id)}
                    variant="today"
                    onContextMenu={handleContextMenu}
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}
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
        isOpen={!!waitingTaskId}
        onClose={() => setWaitingTaskId(null)}
        onSubmit={(text) => {
          if (waitingTaskId) {
            updateTaskMutation.mutate({ id: waitingTaskId, updates: { status: 'waiting', waiting_on: text } });
          }
          setWaitingTaskId(null);
        }}
      />
    </div>
  );
}
