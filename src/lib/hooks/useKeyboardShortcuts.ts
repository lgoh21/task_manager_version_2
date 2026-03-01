'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/hooks/useAppStore';

export function useKeyboardShortcuts() {
  const { toggleSidebar, selectTask, setSearchOpen, searchOpen, captureModalOpen, closeCaptureModal } = useAppStore();

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

      // Cmd+K — toggle global search
      if (mod && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }

      // Cmd+\ — toggle sidebar
      if (mod && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      // Escape — close modals in priority order
      if (e.key === 'Escape') {
        if (captureModalOpen) {
          closeCaptureModal();
        } else if (searchOpen) {
          setSearchOpen(false);
        } else {
          selectTask(null);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, selectTask, setSearchOpen, searchOpen, captureModalOpen, closeCaptureModal]);
}
