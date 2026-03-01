'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { IconX, IconPlus } from '@/components/ui/Icons';
import { ProjectPicker } from '@/components/tasks/ProjectPicker';
import type { Task, Project } from '@/types';

interface TaskDetailHeaderProps {
  task: Task;
  project: Project | null;
  projects: Project[];
  onUpdateTitle: (title: string) => void;
  onUpdateProject: (projectId: string | null) => void;
  onClose: () => void;
}

export function TaskDetailHeader({ task, project, projects, onUpdateTitle, onUpdateProject, onClose }: TaskDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(trimmed);
    } else {
      setEditValue(task.title);
    }
    setIsEditing(false);
  };

  return (
    <div className="px-6 pt-6 pb-1">
      {/* Top row: badges + close */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {task.status === 'waiting' && (
            <Badge variant="warning" size="md">Waiting on</Badge>
          )}
          {/* Project pill / picker */}
          <div className="relative">
            {project ? (
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.colour }}
                />
                {project.name}
              </button>
            ) : (
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                <IconPlus size={12} />
                Add project
              </button>
            )}
            <AnimatePresence>
              {pickerOpen && (
                <ProjectPicker
                  projects={projects}
                  currentProjectId={task.project_id}
                  onSelect={onUpdateProject}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Title */}
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              setEditValue(task.title);
              setIsEditing(false);
            }
          }}
          className="w-full text-2xl font-bold leading-tight tracking-tight bg-transparent border-none outline-none resize-none"
          rows={1}
        />
      ) : (
        <h2
          onClick={() => setIsEditing(true)}
          className="text-2xl font-bold leading-tight tracking-tight cursor-text hover:text-foreground/80 transition-colors"
        >
          {task.title}
        </h2>
      )}
    </div>
  );
}
