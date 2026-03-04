// useAppStore.ts — Lightweight React context for global UI state
// Not React Query — this is for selectedTaskId, sidebar, filters

'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface AppStore {
  selectedTaskId: string | null;
  selectedProjectId: string | null;
  sidebarCollapsed: boolean;
  activeProjectFilter: string | null;
  searchOpen: boolean;
  captureModalOpen: boolean;
  captureModalTitle: string;
  theme: ThemeMode;
  userEmail: string | null;
  selectTask: (id: string | null) => void;
  selectProject: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveProjectFilter: (projectId: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  openCaptureModal: (title: string) => void;
  closeCaptureModal: () => void;
  toggleTheme: () => void;
  setUserEmail: (email: string | null) => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string | null>(null);
  const [searchOpen, setSearchOpenState] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [captureModalTitle, setCaptureModalTitle] = useState('');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [userEmail, setUserEmailState] = useState<string | null>(null);

  // Sync theme with localStorage
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
    if (id) setSelectedProjectId(null); // mutual exclusion
  }, []);

  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
    setSelectedTaskId(null); // mutual exclusion — panel shows one or the other
    setActiveProjectFilter(id); // filter task list to this project
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => !prev);
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
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

  const setUserEmail = useCallback((email: string | null) => {
    setUserEmailState(email);
  }, []);

  return (
    <AppStoreContext.Provider
      value={{
        selectedTaskId,
        selectedProjectId,
        sidebarCollapsed,
        activeProjectFilter,
        searchOpen,
        captureModalOpen,
        captureModalTitle,
        theme,
        userEmail,
        selectTask,
        selectProject,
        toggleSidebar,
        setSidebarCollapsed,
        setActiveProjectFilter,
        setSearchOpen,
        openCaptureModal,
        closeCaptureModal,
        toggleTheme,
        setUserEmail,
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
