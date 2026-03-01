// useTags.ts — React Query hooks for tags + task_tags

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/tags';
import { getCachedUserId } from '@/lib/api/auth';
import type { Tag } from '@/types';

// ---- QUERIES ----

export function useAllTags() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => api.fetchAllTags(userId),
  });
}

export function useTagsForTask(taskId: string | null) {
  return useQuery({
    queryKey: queryKeys.tags.byTask(taskId!),
    queryFn: () => api.fetchTagsForTask(taskId!),
    enabled: !!taskId,
  });
}

export function useAllTaskTags() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.taskTags.all,
    queryFn: () => api.fetchAllTaskTags(userId),
  });
}

// ---- MUTATIONS ----

export function useAddTagToTask() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: ({ taskId, tagName }: { taskId: string; tagName: string }) =>
      api.addTagToTask(taskId, tagName, userId),

    onMutate: async ({ taskId, tagName }) => {
      const normalized = tagName.trim().toLowerCase().replace(/\s+/g, '-');

      await queryClient.cancelQueries({ queryKey: queryKeys.tags.byTask(taskId) });
      const previousTaskTags = queryClient.getQueryData<Tag[]>(
        queryKeys.tags.byTask(taskId)
      );

      // Optimistic: add a temp tag to the task's tags
      const optimisticTag: Tag = {
        id: crypto.randomUUID(),
        name: normalized,
        user_id: userId,
      };

      queryClient.setQueryData<Tag[]>(
        queryKeys.tags.byTask(taskId),
        (old = []) => {
          if (old.some((t) => t.name === normalized)) return old;
          return [...old, optimisticTag];
        }
      );

      return { previousTaskTags, taskId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousTaskTags) {
        queryClient.setQueryData(
          queryKeys.tags.byTask(context.taskId),
          context.previousTaskTags
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.byTask(vars.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskTags.all });
    },
  });
}

export function useRemoveTagFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      api.removeTagFromTask(taskId, tagId),

    onMutate: async ({ taskId, tagId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tags.byTask(taskId) });
      const previous = queryClient.getQueryData<Tag[]>(
        queryKeys.tags.byTask(taskId)
      );

      queryClient.setQueryData<Tag[]>(
        queryKeys.tags.byTask(taskId),
        (old = []) => old.filter((t) => t.id !== tagId)
      );

      return { previous, taskId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.tags.byTask(context.taskId),
          context.previous
        );
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.byTask(vars.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskTags.all });
    },
  });
}
