'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/types';

interface ProjectPickerProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  onClose: () => void;
}

export function ProjectPicker({ projects, currentProjectId, onSelect, onClose }: ProjectPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.1 }}
      className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-lg py-1"
    >
      {/* No project option */}
      <button
        onClick={() => { onSelect(null); onClose(); }}
        className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-ui text-left transition-colors hover:bg-muted ${
          currentProjectId === null ? 'text-foreground font-medium' : 'text-muted-foreground'
        }`}
      >
        <span className="w-2 h-2 rounded-full shrink-0 border border-border" />
        No project
      </button>

      {activeProjects.length > 0 && <div className="h-px bg-border my-1" />}

      {activeProjects.map((project) => (
        <button
          key={project.id}
          onClick={() => { onSelect(project.id); onClose(); }}
          className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-ui text-left transition-colors hover:bg-muted ${
            currentProjectId === project.id ? 'text-foreground font-medium' : 'text-foreground'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: project.colour }}
          />
          {project.name}
        </button>
      ))}
    </motion.div>
  );
}
