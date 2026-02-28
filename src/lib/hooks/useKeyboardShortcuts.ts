'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/hooks/useAppStore';

export function useKeyboardShortcuts() {
  const { toggleSidebar, selectTask } = useAppStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd+N — focus capture bar
      if (mod && e.key === 'n') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(
          '[data-capture-bar]'
        );
        input?.focus();
      }

      // Cmd+\ — toggle sidebar
      if (mod && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      // Escape — close detail panel
      if (e.key === 'Escape') {
        selectTask(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, selectTask]);
}
