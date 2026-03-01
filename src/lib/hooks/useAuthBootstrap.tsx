// useAuthBootstrap.tsx — Resolves auth session on mount, gates rendering

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { setCachedUserId } from '@/lib/api/auth';
import { useAppStore } from '@/lib/hooks/useAppStore';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const { setUserEmail } = useAppStore();

  useEffect(() => {
    const supabase = createClient();

    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        setCachedUserId(user.id);
        setUserEmail(user.email ?? null);
      }
      setReady(true);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userId = session?.user?.id;
        if (userId) {
          setCachedUserId(userId);
          setUserEmail(session?.user?.email ?? null);
        } else {
          setCachedUserId('');
          setUserEmail(null);
        }
        // Invalidate all queries so they refetch with the new user ID
        queryClient.invalidateQueries();
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient, setUserEmail]);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
