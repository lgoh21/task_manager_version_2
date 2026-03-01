'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useTaskStore } from '@/lib/hooks/useTaskStore';
import { ProjectEditModal } from '@/components/tasks/ProjectEditModal';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';
import { IconArchive, IconRotateCcw } from '@/components/ui/Icons';
import { theme } from '@/config/theme';
import {
  HEAVY_DAY,
  DECAY,
  CARRIED_FORWARD,
  MAX_PROJECTS,
} from '@/config/constants';

export default function SettingsPage() {
  const { theme: themeMode, toggleTheme } = useAppStore();
  const { projects, updateProject, archiveProject, unarchiveProject } = useTaskStore();

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const editingProject = editingProjectId
    ? projects.find((p) => p.id === editingProjectId) ?? null
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-heading text-[30px] font-bold tracking-tight">Settings</h1>
      <p className="font-ui text-muted-foreground mt-0.5 text-sm mb-8">
        Customise how Tempus works for you
      </p>

      {/* Theme */}
      <SettingsSection title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-ui font-medium">Theme</p>
            <p className="text-xs font-ui text-muted-foreground mt-0.5">
              Toggle between light and dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              themeMode === 'dark'
                ? 'border-accent/30 bg-accent/5'
                : 'border-border hover:border-border-hover'
            }`}
          >
            <MoonPhaseIcon size={20} isDark={themeMode === 'dark'} />
            <span className="text-sm font-ui font-medium">
              {themeMode === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>
      </SettingsSection>

      {/* Behaviour */}
      <SettingsSection title="Behaviour">
        <SettingsRow
          label="Heavy day threshold"
          description="Total size weight before the 'Heavy day' warning appears"
          value={String(HEAVY_DAY.THRESHOLD)}
          hint="Size weights: S=1, M=2, L=4"
        />
        <SettingsRow
          label="Decay period"
          description="Days before Someday tasks are fully decayed"
          value={`${DECAY.FULL_DECAY_DAYS} days`}
        />
        <SettingsRow
          label="Carried-forward alert"
          description="Days on Today before the day count badge appears"
          value={`${CARRIED_FORWARD.SHOW_COUNT_AFTER_DAYS} days`}
        />
        <SettingsRow
          label="Max projects"
          description="Maximum number of active projects"
          value={String(MAX_PROJECTS)}
        />
      </SettingsSection>

      {/* Projects */}
      <SettingsSection title="Projects">
        {activeProjects.length === 0 && archivedProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet</p>
        ) : (
          <>
            {activeProjects.length > 0 && (
              <div className="space-y-1">
                {activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.colour }}
                    />
                    <span className="text-sm font-ui font-medium flex-1">{project.name}</span>
                    <button
                      onClick={() => setEditingProjectId(project.id)}
                      className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => archiveProject(project.id)}
                      className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                      title="Archive project"
                    >
                      <IconArchive size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {archivedProjects.length > 0 && (
              <div className="mt-4">
                <p className="section-label mb-2">
                  Archived
                </p>
                <div className="space-y-1">
                  {archivedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group opacity-60"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: project.colour }}
                      />
                      <span className="text-sm font-ui flex-1">{project.name}</span>
                      <button
                        onClick={() => unarchiveProject(project.id)}
                        className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                        title="Unarchive project"
                      >
                        <IconRotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </SettingsSection>

      {/* Account (placeholder) */}
      <SettingsSection title="Account">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground font-medium">
            U
          </div>
          <div>
            <p className="text-sm font-ui font-medium text-muted-foreground">Not signed in</p>
            <p className="text-xs font-ui text-muted-foreground/60">
              Connect Supabase to sync across devices
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <div className="flex items-center justify-between">
          <p className="text-sm font-ui text-muted-foreground">Tempus v0.1.0</p>
          <p className="text-xs font-mono text-muted-foreground/60">
            Built with Next.js + Supabase
          </p>
        </div>
      </SettingsSection>

      {/* Project edit modal */}
      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProjectId(null)}
        onSave={(id, updates) => updateProject(id, updates)}
      />
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="section-label mb-3">
        {title}
      </h2>
      <div className="bg-card border border-border rounded-xl p-4">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  value,
  hint,
}: {
  label: string;
  description: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-ui font-medium">{label}</p>
        <p className="text-xs font-ui text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-mono text-muted-foreground">{value}</span>
        {hint && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}
