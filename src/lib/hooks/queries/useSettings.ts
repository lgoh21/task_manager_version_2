// useSettings.ts — React Query hooks for user_settings

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as api from '@/lib/api/settings';
import { getCachedUserId } from '@/lib/api/auth';
import type { UserSettings } from '@/types';

export function useSettings() {
  const userId = getCachedUserId();
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => api.fetchSettings(userId),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const userId = getCachedUserId();

  return useMutation({
    mutationFn: (updates: Partial<Omit<UserSettings, 'user_id'>>) =>
      api.upsertSettings(userId, updates),

    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.all });
      const previous = queryClient.getQueryData<UserSettings>(queryKeys.settings.all);

      queryClient.setQueryData<UserSettings>(
        queryKeys.settings.all,
        (old) => old ? { ...old, ...updates } : { user_id: userId, max_projects: 7, ...updates }
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
