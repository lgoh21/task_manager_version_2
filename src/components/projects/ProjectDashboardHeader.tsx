'use client';

import { useState, useRef, useEffect } from 'react';
import { IconX } from '@/components/ui/Icons';
import type { Project } from '@/types';

interface ProjectDashboardHeaderProps {
  project: Project;
  onUpdateName: (name: string) => void;
  onClose: () => void;
}

export function ProjectDashboardHeader({ project, onUpdateName, onClose }: ProjectDashboardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(project.name);
  }, [project.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== project.name) {
      onUpdateName(trimmed);
    } else {
      setEditValue(project.name);
    }
    setIsEditing(false);
  };

  const startedDate = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="px-7 pt-8 pb-1">
      {/* Top row: project label + close */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <span
            className="w-[7px] h-[7px] rounded-full shrink-0 opacity-80"
            style={{ backgroundColor: project.colour }}
          />
          PROJECT
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Editable project name */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
            if (e.key === 'Escape') { setEditValue(project.name); setIsEditing(false); }
          }}
          className="w-full font-heading text-2xl font-semibold leading-tight tracking-tight bg-transparent border-none outline-none text-foreground"
          maxLength={60}
        />
      ) : (
        <h2
          onClick={() => setIsEditing(true)}
          className="font-heading text-2xl font-semibold leading-tight tracking-tight cursor-text hover:text-foreground/80 transition-colors"
        >
          {project.name}
        </h2>
      )}

      {/* Started date */}
      <p className="font-mono text-xs text-muted-foreground mt-1.5">
        Started {startedDate}
      </p>
    </div>
  );
}
