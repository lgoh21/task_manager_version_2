'use client';

import { useAppStore } from '@/lib/hooks/useAppStore';
import { CaptureBar } from '@/components/tasks/CaptureBar';
import { Badge } from '@/components/ui/Badge';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';
import { IconSearch } from '@/components/ui/Icons';

export function TopBar() {
  const { doneTodayCount, theme, setSearchOpen, openCaptureModal, toggleTheme } = useAppStore();

  const handleCapture = (title: string) => {
    openCaptureModal(title);
  };

  return (
    <div className="shrink-0 bg-card border-b border-border">
      <div className="flex items-center">
        <div className="flex-1">
          <CaptureBar onCapture={handleCapture} />
        </div>
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="font-ui flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Search (Ctrl+K)"
          >
            <IconSearch size={14} />
            <span className="text-xs hidden sm:inline">Search</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <MoonPhaseIcon size={18} isDark={theme === 'dark'} />
          </button>
          {doneTodayCount > 0 && (
            <Badge variant="success" size="md">
              <span className="font-mono text-[11.5px]">{doneTodayCount} done</span>
            </Badge>
          )}
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-ui text-xs text-muted-foreground">
            U
          </div>
        </div>
      </div>
    </div>
  );
}
