// useQueryProvider.tsx — React Query client provider
// One query client in root layout. Views consume cached data.

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 2 minutes — prevents refetches on tab switch
            staleTime: 2 * 60 * 1000,
            // Keep cached data for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Don't retry on error immediately
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
