// App shell layout — thin orchestrator
// Sidebar | Content (with or without detail panel, depending on route)

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ContentArea } from '@/components/layout/ContentArea';
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts';
import { SearchPalette } from '@/components/ui/SearchPalette';
import { CaptureModal } from '@/components/tasks/CaptureModal';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <KeyboardShortcuts />
      <SearchPalette />
      <CaptureModal />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}
