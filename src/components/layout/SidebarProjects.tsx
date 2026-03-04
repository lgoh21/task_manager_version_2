'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useProjects, useCreateProject, useUpdateProject } from '@/lib/hooks/queries/useProjects';
import { ContextMenu, type ContextMenuAction } from '@/components/ui/ContextMenu';
import { ProjectEditModal } from '@/components/tasks/ProjectEditModal';
import { IconPlus, IconArchive, IconSettings } from '@/components/ui/Icons';
import { ColourPicker } from '@/components/ui/ColourPicker';
import { useSettings } from '@/lib/hooks/queries/useSettings';
import { theme } from '@/config/theme';
import { MAX_PROJECTS } from '@/config/constants';

export function SidebarProjects() {
  const { activeProjectFilter, selectedProjectId, selectProject } = useAppStore();
  const { data: projects = [] } = useProjects();
  const { data: settings } = useSettings();
  const createProject = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const maxProjects = settings?.max_projects ?? MAX_PROJECTS;
  const activeProjects = projects.filter((p) => !p.archived);
  const atLimit = activeProjects.length >= maxProjects;

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
    setSelectedColour(theme.projectColors[0].value);
    setCreating(true);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setCreating(false); return; }
    createProject.mutate({ name: trimmed, colour: selectedColour });
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
            updateProjectMutation.mutate({ id: contextMenu.projectId, updates: { archived: true } });
            if (selectedProjectId === contextMenu.projectId) {
              selectProject(null);
            }
          },
        },
      ]
    : [];

  return (
    <div className="pt-5 pb-1">
      {/* Section header with + button */}
      <div className="flex items-center justify-between px-2">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-sidebar-muted">
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
            className="font-ui w-full px-2 py-1 text-[13.5px] bg-sidebar text-sidebar-foreground border border-border rounded-md outline-none focus:border-accent placeholder:text-sidebar-muted"
            maxLength={40}
          />
          <div className="mt-1.5 mb-1">
            <ColourPicker
              value={selectedColour}
              onChange={setSelectedColour}
              compact
            />
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="mt-1.5 space-y-0.5">
        {activeProjects.map((project) => (
          <button
            key={project.id}
            onClick={() =>
              selectProject(
                selectedProjectId === project.id ? null : project.id
              )
            }
            onContextMenu={(e) => handleContextMenu(e, project.id)}
            className={`font-ui w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13.5px] transition-all outline-none ${
              selectedProjectId === project.id
                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
            style={{
              opacity: activeProjectFilter && activeProjectFilter !== project.id ? 0.45 : 1,
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0 opacity-80"
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
        onSave={(id, updates) => updateProjectMutation.mutate({ id, updates })}
      />
    </div>
  );
}
