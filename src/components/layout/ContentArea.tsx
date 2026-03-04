'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { DetailPanel } from '@/components/layout/DetailPanel';

// Routes where the detail panel should not appear
const FULL_WIDTH_ROUTES = ['/notes', '/history', '/settings'];

export function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectTask, selectProject } = useAppStore();
  const prevPathname = useRef(pathname);
  const showDetailPanel = !FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));

  // Clear task selection when navigating between routes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      selectTask(null);
      selectProject(null);
      prevPathname.current = pathname;
    }
  }, [pathname, selectTask, selectProject]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {showDetailPanel ? (
        <>
          <main className="min-w-[320px] max-w-[520px] w-[520px] shrink-0 overflow-y-auto border-r border-border">
            {children}
          </main>
          <DetailPanel />  {/* flex-1 min-w-[384px] via DetailPanel wrapper */}
        </>
      ) : (
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      )}
    </div>
  );
}
