'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { ContextMenu, type ContextMenuAction } from '@/components/ui/ContextMenu';
import { ProjectEditModal } from '@/components/tasks/ProjectEditModal';
import { IconPlus, IconArchive, IconSettings } from '@/components/ui/Icons';
import { theme } from '@/config/theme';
import { MAX_PROJECTS } from '@/config/constants';

export function SidebarProjects() {
  const { activeProjectFilter, setActiveProjectFilter } = useAppStore();
  const { projects, addProject, updateProject, archiveProject } = useTaskStore();

  const activeProjects = projects.filter((p) => !p.archived);
  const atLimit = activeProjects.length >= MAX_PROJECTS;

  const usedColours = new Set(activeProjects.map((p) => p.colour));
  const availableColours = theme.projectColors.filter((c) => !usedColours.has(c.value));

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; projectId: string } | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const editingProject = editingProjectId ? projects.find((p) => p.id === editingProjectId) ?? null : null;

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    if (!creating) return;
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setCreating(false);
        setNewName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [creating]);

  const startCreating = () => {
    setSelectedColour(availableColours[0]?.value ?? theme.projectColors[0].value);
    setCreating(true);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setCreating(false); return; }
    addProject(trimmed, selectedColour);
    setNewName('');
    setCreating(false);
  };

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, projectId });
  };

  const contextActions: ContextMenuAction[] = contextMenu
    ? [
        {
          label: 'Edit project',
          icon: <IconSettings size={14} />,
          onClick: () => setEditingProjectId(contextMenu.projectId),
        },
        {
          label: 'Archive project',
          icon: <IconArchive size={14} />,
          onClick: () => {
            archiveProject(contextMenu.projectId);
            if (activeProjectFilter === contextMenu.projectId) {
              setActiveProjectFilter(null);
            }
          },
        },
      ]
    : [];

  return (
    <div className="pt-5 pb-1">
      {/* Section header with + button */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Projects
        </span>
        {!atLimit && (
          <button
            onClick={startCreating}
            className="p-0.5 rounded hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            aria-label="Add project"
          >
            <IconPlus size={12} />
          </button>
        )}
      </div>

      {/* Inline create form */}
      {creating && (
        <div ref={formRef} className="mt-1.5 px-2">
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
            placeholder="Project name"
            className="w-full px-2 py-1 text-sm bg-sidebar-accent/50 border border-border rounded-md outline-none focus:border-accent placeholder:text-sidebar-muted"
            maxLength={40}
          />
          {/* Colour dots — only show unused colours */}
          <div className="flex items-center gap-1.5 mt-1.5 mb-1">
            {availableColours.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColour(c.value)}
                className={`w-5 h-5 rounded-full transition-all ${
                  selectedColour === c.value
                    ? 'ring-2 ring-offset-1 ring-offset-sidebar ring-accent scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="mt-1.5 space-y-0.5">
        {activeProjects.map((project) => (
          <button
            key={project.id}
            onClick={() =>
              setActiveProjectFilter(
                activeProjectFilter === project.id ? null : project.id
              )
            }
            onContextMenu={(e) => handleContextMenu(e, project.id)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all outline-none ${
              activeProjectFilter === project.id
                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
            style={{
              opacity: activeProjectFilter && activeProjectFilter !== project.id ? 0.45 : 1,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project.colour }}
            />
            <span className="truncate">{project.name}</span>
          </button>
        ))}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            actions={contextActions}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Edit project modal */}
      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProjectId(null)}
        onSave={(id, updates) => updateProject(id, updates)}
      />
    </div>
  );
}
