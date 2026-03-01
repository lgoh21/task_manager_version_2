'use client';

import { usePathname } from 'next/navigation';
import { DetailPanel } from '@/components/layout/DetailPanel';

// Routes where the detail panel should not appear
const FULL_WIDTH_ROUTES = ['/notes', '/history', '/settings'];

export function ContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showDetailPanel = !FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="flex-1 flex overflow-hidden">
      {showDetailPanel ? (
        <>
          <main className="flex-[2] min-w-[320px] max-w-[520px] overflow-y-auto border-r border-border">
            {children}
          </main>
          <DetailPanel />
        </>
      ) : (
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      )}
    </div>
  );
}
