'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { useToast } from '@/components/ui/Toast';
import { TaskDetailHeader } from '@/components/tasks/TaskDetailHeader';
import { TaskDetailMeta } from '@/components/tasks/TaskDetailMeta';
import { TaskNotes } from '@/components/tasks/TaskNotes';
import { SubtaskList } from '@/components/tasks/SubtaskList';
import { TaskActions } from '@/components/tasks/TaskActions';
import type { TaskSize } from '@/types';

export function DetailPanel() {
  const { selectedTaskId, selectTask, incrementDoneToday } = useAppStore();
  const { getTaskById, getProject, getSubtasks, projects, updateTask, deleteTask, completeTask, letGoTask, addSubtask, updateSubtask, deleteSubtask } = useTaskStore();
  const { showToast } = useToast();

  const task = selectedTaskId ? getTaskById(selectedTaskId) : undefined;
  const project = task ? getProject(task.project_id) : null;
  const subtasks = task ? getSubtasks(task.id) : [];

  const handleComplete = () => {
    if (!task) return;
    completeTask(task.id);
    incrementDoneToday();
    showToast(`${task.title.length > 30 ? task.title.slice(0, 30) + '...' : task.title} done`);
    selectTask(null);
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    selectTask(null);
  };

  const handleLetGo = () => {
    if (!task) return;
    letGoTask(task.id);
    selectTask(null);
  };

  return (
    <div className="flex-1 min-w-0">
      <AnimatePresence mode="wait">
        {task ? (
          <motion.aside
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="h-full bg-card flex flex-col"
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <TaskDetailHeader
                task={task}
                project={project}
                projects={projects}
                onUpdateTitle={(title) => updateTask(task.id, { title })}
                onUpdateProject={(projectId) => updateTask(task.id, { project_id: projectId })}
                onClose={() => selectTask(null)}
              />
              <TaskDetailMeta
                task={task}
                onUpdateSize={(size: TaskSize) => updateTask(task.id, { size })}
              />

              {/* Waiting on block */}
              {task.status === 'waiting' && task.waiting_on && (
                <div className="mx-6 mb-2 px-3 py-2.5 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs font-medium text-warning/80 mb-1">Waiting on</p>
                  <p className="text-sm">{task.waiting_on}</p>
                </div>
              )}

              {/* Section divider */}
              <div className="mx-6 border-t border-border my-4" />

              <TaskNotes
                notes={task.notes}
                onUpdateNotes={(notes) => updateTask(task.id, { notes })}
                isNewTask={!task.notes && task.status === 'inbox'}
              />
              {/* Section divider */}
              <div className="mx-6 border-t border-border mb-5" />

              <SubtaskList
                subtasks={subtasks}
                onToggle={(id, done) => updateSubtask(id, { done })}
                onAdd={(text) => addSubtask(task.id, text)}
                onDelete={deleteSubtask}
                onUpdateText={(id, text) => updateSubtask(id, { text })}
              />
            </div>

            {/* Fixed bottom action bar */}
            <TaskActions
              task={task}
              onMoveToToday={() => updateTask(task.id, { status: 'today', waiting_on: null })}
              onComplete={handleComplete}
              onWaitingOn={(text) => updateTask(task.id, { status: 'waiting', waiting_on: text })}
              onUnblock={() => updateTask(task.id, { status: 'today', waiting_on: null })}
              onMoveToSomeday={() => updateTask(task.id, { status: 'someday' })}
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
