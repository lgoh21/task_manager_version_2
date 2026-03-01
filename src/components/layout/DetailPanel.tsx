'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useAllTasks, useUpdateTask, useDeleteTask, useCompleteTask, useLetGoTask } from '@/lib/hooks/queries/useTasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useSubtasksByTask, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from '@/lib/hooks/queries/useSubtasks';
import { useTagsForTask, useAllTags, useAddTagToTask, useRemoveTagFromTask } from '@/lib/hooks/queries/useTags';
import { useToast } from '@/components/ui/Toast';
import { TaskDetailHeader } from '@/components/tasks/TaskDetailHeader';
import { TaskDetailMeta } from '@/components/tasks/TaskDetailMeta';
import { TaskNotes } from '@/components/tasks/TaskNotes';
import { SubtaskList } from '@/components/tasks/SubtaskList';
import { TaskActions } from '@/components/tasks/TaskActions';
import type { TaskSize } from '@/types';

export function DetailPanel() {
  const { selectedTaskId, selectTask, incrementDoneToday } = useAppStore();
  const { showToast } = useToast();

  const { data: allTasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: allTags = [] } = useAllTags();

  const task = selectedTaskId ? allTasks.find(t => t.id === selectedTaskId) ?? null : null;
  const project = task ? projects.find(p => p.id === task.project_id) ?? null : null;
  const { data: subtasks = [] } = useSubtasksByTask(task?.id ?? null);
  const { data: tags = [] } = useTagsForTask(task?.id ?? null);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const letGoTaskMutation = useLetGoTask();
  const createSubtask = useCreateSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const addTagMutation = useAddTagToTask();
  const removeTagMutation = useRemoveTagFromTask();

  const handleComplete = () => {
    if (!task) return;
    completeTaskMutation.mutate(task.id);
    incrementDoneToday();
    showToast(`${task.title.length > 30 ? task.title.slice(0, 30) + '...' : task.title} done`);
    selectTask(null);
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTaskMutation.mutate(task.id);
    selectTask(null);
  };

  const handleLetGo = () => {
    if (!task) return;
    letGoTaskMutation.mutate(task.id);
    selectTask(null);
  };

  return (
    <div className="flex-1 min-w-[384px] bg-muted">
      <AnimatePresence mode="wait">
        {task ? (
          <motion.aside
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="h-full bg-muted flex flex-col"
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <TaskDetailHeader
                task={task}
                project={project}
                projects={projects}
                tags={tags}
                allTags={allTags}
                onUpdateTitle={(title) => updateTaskMutation.mutate({ id: task.id, updates: { title } })}
                onUpdateProject={(projectId) => updateTaskMutation.mutate({ id: task.id, updates: { project_id: projectId } })}
                onAddTag={(name) => addTagMutation.mutate({ taskId: task.id, tagName: name })}
                onRemoveTag={(tagId) => removeTagMutation.mutate({ taskId: task.id, tagId })}
                onClose={() => selectTask(null)}
              />
              <TaskDetailMeta
                task={task}
                onUpdateSize={(size: TaskSize) => updateTaskMutation.mutate({ id: task.id, updates: { size } })}
                onUpdateDueDate={(dueDate) => updateTaskMutation.mutate({ id: task.id, updates: { due_date: dueDate } })}
              />

              {/* Waiting on block */}
              {task.status === 'waiting' && task.waiting_on && (
                <div className="mx-7 mb-2 px-3 py-2.5 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs font-medium text-warning/80 mb-1">Waiting on</p>
                  <p className="text-sm">{task.waiting_on}</p>
                </div>
              )}

              <TaskNotes
                notes={task.notes}
                onUpdateNotes={(notes) => updateTaskMutation.mutate({ id: task.id, updates: { notes } })}
                isNewTask={!task.notes && task.status === 'inbox'}
              />

              <SubtaskList
                subtasks={subtasks}
                onToggle={(id, done) => updateSubtaskMutation.mutate({ id, taskId: task.id, updates: { done } })}
                onAdd={(text) => createSubtask.mutate({ taskId: task.id, text, sortOrder: subtasks.length })}
                onDelete={(id) => deleteSubtaskMutation.mutate({ id, taskId: task.id })}
                onUpdateText={(id, text) => updateSubtaskMutation.mutate({ id, taskId: task.id, updates: { text } })}
                onReorder={(reordered) => {
                  reordered.forEach((s, i) => {
                    if (s.sort_order !== i) updateSubtaskMutation.mutate({ id: s.id, taskId: task!.id, updates: { sort_order: i } });
                  });
                }}
              />
            </div>

            {/* Fixed bottom action bar */}
            <TaskActions
              task={task}
              onMoveToToday={() => updateTaskMutation.mutate({ id: task.id, updates: { status: 'today', waiting_on: null } })}
              onComplete={handleComplete}
              onWaitingOn={(text) => updateTaskMutation.mutate({ id: task.id, updates: { status: 'waiting', waiting_on: text } })}
              onUnblock={() => updateTaskMutation.mutate({ id: task.id, updates: { status: 'today', waiting_on: null } })}
              onMoveToSomeday={() => updateTaskMutation.mutate({ id: task.id, updates: { status: 'someday' } })}
              onLetGo={handleLetGo}
              onDelete={handleDelete}
            />
          </motion.aside>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm">
            Select a task to see details
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
