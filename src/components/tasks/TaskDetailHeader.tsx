'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IconX, IconPlus } from '@/components/ui/Icons';
import { ProjectPicker } from '@/components/tasks/ProjectPicker';
import { TagInput } from '@/components/tasks/TagInput';
import type { Task, Project, Tag } from '@/types';

interface TaskDetailHeaderProps {
  task: Task;
  project: Project | null;
  projects: Project[];
  tags: Tag[];
  allTags: Tag[];
  onUpdateTitle: (title: string) => void;
  onUpdateProject: (projectId: string | null) => void;
  onAddTag: (tagName: string) => void;
  onRemoveTag: (tagId: string) => void;
  onClose: () => void;
}

export function TaskDetailHeader({ task, project, projects, tags, allTags, onUpdateTitle, onUpdateProject, onAddTag, onRemoveTag, onClose }: TaskDetailHeaderProps) {
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
    <div className="px-7 pt-8 pb-1">
      {/* Top row: project + close */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          {project ? (
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0 opacity-80"
                style={{ backgroundColor: project.colour }}
              />
              {project.name}
            </button>
          ) : (
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              <IconPlus size={11} />
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
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
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
          className="w-full font-heading text-2xl font-semibold leading-tight tracking-tight bg-transparent border-none outline-none resize-none text-foreground"
          rows={1}
        />
      ) : (
        <h2
          onClick={() => setIsEditing(true)}
          className="font-heading text-2xl font-semibold leading-tight tracking-tight cursor-text hover:text-foreground/80 transition-colors"
        >
          {task.title}
        </h2>
      )}

      {/* Tags */}
      <div className="mt-3 mb-1">
        <TagInput tags={tags} allTags={allTags} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
      </div>
    </div>
  );
}
