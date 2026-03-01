// useNotes.ts — React Query hooks for notes

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/notes';
import * as taskApi from '@/lib/api/tasks';
import { getCachedUserId } from '@/lib/api/auth';
import type { Note, Task } from '@/types';

// ---- QUERIES ----

export function useNotes() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: () => api.fetchNotes(userId),
  });
}

// ---- MUTATIONS ----

export function useCreateNote() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: (content: string) => api.createNote(content, userId),

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      const optimistic: Note = {
        id: crypto.randomUUID(),
        content,
        user_id: userId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (old = []) => [
        optimistic,
        ...old,
      ]);

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updateNote(id, content),

    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, content } : n))
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });
      const previous = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      queryClient.setQueryData<Note[]>(queryKeys.notes.all, (old = []) =>
        old.filter((n) => n.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notes.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}

export function useConvertNoteToTask() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: async (note: Note): Promise<Task> => {
      const firstLine = note.content.split('\n')[0] ?? 'Untitled task';
      const title = firstLine.replace(/\*\*/g, '').trim() || 'Untitled task';
      const task = await taskApi.createTask({
        title,
        notes: note.content,
        status: 'inbox',
        user_id: userId,
      });
      await api.deleteNote(note.id);
      return task;
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });
}
