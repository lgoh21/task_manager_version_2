// useAppStore.ts — Lightweight React context for global UI state
// Not React Query — this is for selectedTaskId, sidebar, filters

'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface AppStore {
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  activeProjectFilter: string | null;
  doneTodayCount: number;
  searchOpen: boolean;
  captureModalOpen: boolean;
  captureModalTitle: string;
  theme: ThemeMode;
  selectTask: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveProjectFilter: (projectId: string | null) => void;
  incrementDoneToday: () => void;
  setSearchOpen: (open: boolean) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  openCaptureModal: (title: string) => void;
  closeCaptureModal: () => void;
  toggleTheme: () => void;
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
  const [activeTagFilter, setActiveTagFilterState] = useState<string | null>(null);
  const [theme, setThemeState] = useState<ThemeMode>('light');

  // Sync theme with DOM and localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tempus-theme') as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tempus-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

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

  const setActiveTagFilter = useCallback((tag: string | null) => {
    setActiveTagFilterState(tag);
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
        activeTagFilter,
        theme,
        selectTask,
        toggleSidebar,
        setSidebarCollapsed,
        setActiveProjectFilter,
        setActiveTagFilter,
        incrementDoneToday,
        setSearchOpen,
        openCaptureModal,
        closeCaptureModal,
        toggleTheme,
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
