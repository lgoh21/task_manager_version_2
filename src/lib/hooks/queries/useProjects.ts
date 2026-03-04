// useProjects.ts — React Query hooks for projects

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/projects';
import { getCachedUserId } from '@/lib/api/auth';
import type { Project } from '@/types';
import { MAX_PROJECTS } from '@/config/constants';

// ---- QUERIES ----

export function useProjects() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => api.fetchProjects(userId),
  });
}

/** Lookup helper: returns a function that finds a project by ID from cached data */
export function useProjectLookup() {
  const { data: projects = [] } = useProjects();
  return useCallback(
    (id: string | null): Project | null =>
      projects.find((p) => p.id === id) ?? null,
    [projects]
  );
}

// ---- MUTATIONS ----

export function useCreateProject() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: ({ name, colour }: { name: string; colour: string }) => {
      const current = queryClient.getQueryData<Project[]>(queryKeys.projects.all) ?? [];
      const activeCount = current.filter((p) => !p.archived).length;
      if (activeCount >= MAX_PROJECTS) {
        return Promise.reject(new Error(`Maximum ${MAX_PROJECTS} active projects allowed`));
      }
      return api.createProject(name, colour, userId);
    },

    onMutate: async ({ name, colour }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      const previous = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      const optimistic: Project = {
        id: crypto.randomUUID(),
        name,
        colour,
        archived: false,
        description: null,
        status: 'active',
        finished_at: null,
        user_id: userId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Project[]>(
        queryKeys.projects.all,
        (old = []) => [...old, optimistic]
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.projects.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Project, 'name' | 'colour' | 'archived' | 'description' | 'status' | 'finished_at'>>;
    }) => api.updateProject(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      const previous = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      queryClient.setQueryData<Project[]>(
        queryKeys.projects.all,
        (old = []) => old.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.projects.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useFinishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.finishProject(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      const previous = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      queryClient.setQueryData<Project[]>(
        queryKeys.projects.all,
        (old = []) => old.map((p) => (p.id === id ? { ...p, status: 'finished' as const, finished_at: new Date().toISOString() } : p))
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.projects.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.archiveProject(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });
      const previous = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      queryClient.setQueryData<Project[]>(
        queryKeys.projects.all,
        (old = []) => old.map((p) => (p.id === id ? { ...p, status: 'archived' as const, archived: true } : p))
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.projects.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
