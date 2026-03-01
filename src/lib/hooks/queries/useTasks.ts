// useTasks.ts — React Query hooks for tasks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/tasks';
import { getCachedUserId } from '@/lib/api/auth';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/types';

// ---- QUERIES ----

export function useAllTasks() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: () => api.fetchAllTasks(userId),
  });
}

export function useTasksByStatus(status: TaskStatus) {
  const { data: allTasks, ...rest } = useAllTasks();
  const filtered = useMemo(
    () =>
      (allTasks ?? [])
        .filter((t) => t.status === status)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allTasks, status]
  );
  return { data: filtered, ...rest };
}

export function useTask(id: string | null) {
  const { data: allTasks } = useAllTasks();
  return useMemo(
    () => (allTasks ?? []).find((t) => t.id === id) ?? null,
    [allTasks, id]
  );
}

// ---- MUTATIONS ----

export function useCreateTask() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      api.createTask({ ...input, user_id: userId }),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      const optimisticTask: Task = {
        id: crypto.randomUUID(),
        title: input.title,
        status: input.status ?? 'inbox',
        size: input.size ?? 'M',
        due_date: input.due_date ?? null,
        project_id: input.project_id ?? null,
        notes: input.notes ?? null,
        waiting_on: input.waiting_on ?? null,
        sort_order: 0,
        days_on_today: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        user_id: userId,
      };

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (old = []) => [
        optimisticTask,
        ...old,
      ]);

      return { previous, optimisticTask };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskInput }) =>
      api.updateTask(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (old = []) =>
        old.map((t) =>
          t.id === id
            ? { ...t, ...updates, updated_at: new Date().toISOString() }
            : t
        )
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all);

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all, (old = []) =>
        old.filter((t) => t.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previous);
      }
    },

    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.byTask(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.byTask(id) });
    },
  });
}

// ---- CONVENIENCE MUTATIONS ----

export function useCompleteTask() {
  const { mutate, mutateAsync, ...rest } = useUpdateTask();
  return {
    ...rest,
    mutate: useCallback(
      (id: string) =>
        mutate({ id, updates: { status: 'done', completed_at: new Date().toISOString() } }),
      [mutate]
    ),
    mutateAsync: useCallback(
      (id: string) =>
        mutateAsync({ id, updates: { status: 'done', completed_at: new Date().toISOString() } }),
      [mutateAsync]
    ),
  };
}

export function useLetGoTask() {
  const { mutate, mutateAsync, ...rest } = useUpdateTask();
  return {
    ...rest,
    mutate: useCallback(
      (id: string) =>
        mutate({ id, updates: { status: 'let_go', completed_at: new Date().toISOString() } }),
      [mutate]
    ),
    mutateAsync: useCallback(
      (id: string) =>
        mutateAsync({ id, updates: { status: 'let_go', completed_at: new Date().toISOString() } }),
      [mutateAsync]
    ),
  };
}

export function useRestoreTask() {
  const { mutate, mutateAsync, ...rest } = useUpdateTask();
  return {
    ...rest,
    mutate: useCallback(
      (id: string) =>
        mutate({ id, updates: { status: 'inbox', completed_at: null } }),
      [mutate]
    ),
    mutateAsync: useCallback(
      (id: string) =>
        mutateAsync({ id, updates: { status: 'inbox', completed_at: null } }),
      [mutateAsync]
    ),
  };
}
