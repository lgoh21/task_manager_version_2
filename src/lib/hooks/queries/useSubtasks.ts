// useSubtasks.ts — React Query hooks for subtasks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/subtasks';
import { getCachedUserId } from '@/lib/api/auth';
import type { Subtask } from '@/types';

// ---- QUERIES ----

export function useSubtasksByTask(taskId: string | null) {
  return useQuery({
    queryKey: queryKeys.subtasks.byTask(taskId!),
    queryFn: () => api.fetchSubtasksByTask(taskId!),
    enabled: !!taskId,
  });
}

export function useAllSubtasks() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.subtasks.all,
    queryFn: () => api.fetchAllSubtasks(userId),
  });
}

// ---- MUTATIONS ----

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      text,
      sortOrder,
    }: {
      taskId: string;
      text: string;
      sortOrder: number;
    }) => api.createSubtask(taskId, text, sortOrder),

    onMutate: async ({ taskId, text, sortOrder }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.subtasks.byTask(taskId),
      });
      const previous = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId)
      );

      const optimistic: Subtask = {
        id: crypto.randomUUID(),
        task_id: taskId,
        text,
        done: false,
        sort_order: sortOrder,
      };

      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId),
        (old = []) => [...old, optimistic]
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId),
          context.previous
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(vars.taskId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.all });
    },
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      id: string;
      taskId: string;
      updates: Partial<Pick<Subtask, 'text' | 'done' | 'sort_order'>>;
    }) => api.updateSubtask(vars.id, vars.updates),

    onMutate: async ({ id, taskId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.subtasks.byTask(taskId),
      });
      const previous = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId)
      );

      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId),
        (old = []) => old.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId),
          context.previous
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(vars.taskId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.all });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      api.deleteSubtask(id),

    onMutate: async ({ id, taskId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.subtasks.byTask(taskId),
      });
      const previous = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId)
      );

      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId),
        (old = []) => old.filter((s) => s.id !== id)
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId),
          context.previous
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(vars.taskId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.all });
    },
  });
}
