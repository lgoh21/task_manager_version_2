// useAppStore.ts — Lightweight React context for global UI state
// Not React Query — this is for selectedTaskId, sidebar, filters

'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

interface AppStore {
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  activeProjectFilter: string | null;
  doneTodayCount: number;
  searchOpen: boolean;
  captureModalOpen: boolean;
  captureModalTitle: string;
  selectTask: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveProjectFilter: (projectId: string | null) => void;
  incrementDoneToday: () => void;
  setSearchOpen: (open: boolean) => void;
  openCaptureModal: (title: string) => void;
  closeCaptureModal: () => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string | null>(null);
  const [doneTodayCount, setDoneTodayCount] = useState(0);
  const [searchOpen, setSearchOpenState] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [captureModalTitle, setCaptureModalTitle] = useState('');

  const selectTask = useCallback((id: string | null) => {
    setSelectedTaskId(id);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => !prev);
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
  }, []);

  const incrementDoneToday = useCallback(() => {
    setDoneTodayCount((prev) => prev + 1);
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    setSearchOpenState(open);
  }, []);

  const openCaptureModal = useCallback((title: string) => {
    setCaptureModalTitle(title);
    setCaptureModalOpen(true);
  }, []);

  const closeCaptureModal = useCallback(() => {
    setCaptureModalOpen(false);
    setCaptureModalTitle('');
  }, []);

  return (
    <AppStoreContext.Provider
      value={{
        selectedTaskId,
        sidebarCollapsed,
        activeProjectFilter,
        doneTodayCount,
        searchOpen,
        captureModalOpen,
        captureModalTitle,
        selectTask,
        toggleSidebar,
        setSidebarCollapsed,
        setActiveProjectFilter,
        incrementDoneToday,
        setSearchOpen,
        openCaptureModal,
        closeCaptureModal,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}
