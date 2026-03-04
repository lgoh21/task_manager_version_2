'use client';

import { motion } from 'framer-motion';
import { useProjects, useUpdateProject, useFinishProject, useArchiveProject } from '@/lib/hooks/queries/useProjects';
import { useNotes } from '@/lib/hooks/queries/useNotes';
import { useProjectStats, useProjectActivity } from '@/lib/hooks/queries/useProjectStats';
import { useToast } from '@/components/ui/Toast';
import { ProjectDashboardHeader } from '@/components/projects/ProjectDashboardHeader';
import { ProjectStatsGrid } from '@/components/projects/ProjectStatsGrid';
import { ProjectDescription } from '@/components/projects/ProjectDescription';
import { ProjectActivityTimeline } from '@/components/projects/ProjectActivityTimeline';
import { ProjectLinkedNotes } from '@/components/projects/ProjectLinkedNotes';
import { ProjectActions } from '@/components/projects/ProjectActions';

interface ProjectDashboardProps {
  projectId: string;
  onClose: () => void;
}

export function ProjectDashboard({ projectId, onClose }: ProjectDashboardProps) {
  const { data: projects = [] } = useProjects();
  const { data: allNotes = [] } = useNotes();
  const stats = useProjectStats(projectId);
  const activity = useProjectActivity(projectId);
  const updateProject = useUpdateProject();
  const finishProject = useFinishProject();
  const archiveProject = useArchiveProject();
  const { showToast } = useToast();

  const project = projects.find((p) => p.id === projectId) ?? null;
  const projectNotes = allNotes.filter((n) => n.project_id === projectId);

  if (!project) return null;

  const handleFinish = () => {
    finishProject.mutate(projectId);
    showToast(`${project.name} finished`);
    onClose();
  };

  const handleArchive = () => {
    archiveProject.mutate(projectId);
    showToast(`${project.name} archived`);
    onClose();
  };

  return (
    <motion.aside
      key={projectId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      className="h-full bg-muted flex flex-col"
    >
      <div className="flex-1 overflow-y-auto">
        <ProjectDashboardHeader
          project={project}
          onUpdateName={(name) => updateProject.mutate({ id: projectId, updates: { name } })}
          onClose={onClose}
        />
        {stats && <ProjectStatsGrid stats={stats} />}
        <ProjectDescription
          description={project.description}
          onUpdate={(description) => updateProject.mutate({ id: projectId, updates: { description } })}
        />
        <ProjectActivityTimeline activity={activity} />
        <ProjectLinkedNotes notes={projectNotes} projectId={projectId} />
      </div>
      <ProjectActions
        onFinish={handleFinish}
        onArchive={handleArchive}
      />
    </motion.aside>
  );
}
