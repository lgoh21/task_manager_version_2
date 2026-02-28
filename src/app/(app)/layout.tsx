// App shell layout — thin orchestrator
// 3-column: Sidebar | Task List (fixed) | Detail Panel (fills remaining)

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DetailPanel } from '@/components/layout/DetailPanel';
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <KeyboardShortcuts />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          {/* Task list column — 40% width */}
          <main className="flex-[2] min-w-[320px] max-w-[520px] overflow-y-auto border-r border-border">
            {children}
          </main>
          {/* Detail panel — 60% width */}
          <DetailPanel />
        </div>
      </div>
    </div>
  );
}
