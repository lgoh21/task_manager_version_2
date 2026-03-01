'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useCreateTask } from '@/lib/hooks/queries/useTasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useToast } from '@/components/ui/Toast';
import { ProjectPicker } from '@/components/tasks/ProjectPicker';
import { smoothTransition } from '@/config/animations';
import type { TaskSize } from '@/types';

const SIZE_OPTIONS: { value: TaskSize; label: string }[] = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
];

export function CaptureModal() {
  const { captureModalOpen, captureModalTitle, closeCaptureModal } = useAppStore();
  const createTask = useCreateTask();
  const { data: projects = [] } = useProjects();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [size, setSize] = useState<TaskSize>('M');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Sync from captureModalTitle when modal opens
  useEffect(() => {
    if (captureModalOpen) {
      setTitle(captureModalTitle);
      setNotes('');
      setSize('M');
      setProjectId(null);
      setPickerOpen(false);
      requestAnimationFrame(() => {
        // Focus notes if title already filled, otherwise focus title
        if (captureModalTitle) {
          notesRef.current?.focus();
        } else {
          titleRef.current?.focus();
        }
      });
    }
  }, [captureModalOpen, captureModalTitle]);

  const handleCreate = useCallback(
    (status: 'inbox' | 'today') => {
      const trimmed = title.trim();
      if (!trimmed) return;
      createTask.mutate({
        title: trimmed,
        status,
        notes: notes.trim() || undefined,
        size: size !== 'M' ? size : undefined,
        project_id: projectId || undefined,
      });
      closeCaptureModal();
      showToast(
        status === 'today'
          ? `"${trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed}" added to Today`
          : `"${trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed}" added to Inbox`
      );
    },
    [title, notes, size, projectId, createTask, closeCaptureModal, showToast]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCaptureModal();
      }
      // Cmd/Ctrl+Enter → send to inbox
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreate('inbox');
      }
    },
    [closeCaptureModal, handleCreate]
  );

  // Auto-resize notes textarea
  useEffect(() => {
    if (notesRef.current) {
      const el = notesRef.current;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [notes]);

  return (
    <AnimatePresence>
      {captureModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop — click to close (no creation) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={closeCaptureModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={smoothTransition}
            className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl"
          >
            {/* Title */}
            <div className="px-5 pt-5 pb-3">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full text-base font-ui font-medium bg-transparent outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Notes */}
            <div className="px-5 pb-3">
              <textarea
                ref={notesRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes... (optional)"
                className="w-full text-sm font-ui bg-transparent outline-none resize-none min-h-[48px] placeholder:text-muted-foreground/40"
                rows={2}
              />
            </div>

            {/* Meta row: size + project */}
            <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
              {/* Size picker */}
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSize(opt.value)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                      size === opt.value
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Project picker pill */}
              <div className="relative">
                <button
                  onClick={() => setPickerOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-ui px-2.5 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {projectId ? (
                    <>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: projects.find((p) => p.id === projectId)?.colour }}
                      />
                      <span>{projects.find((p) => p.id === projectId)?.name}</span>
                    </>
                  ) : (
                    <span>Add project</span>
                  )}
                </button>
                <AnimatePresence>
                  {pickerOpen && (
                    <ProjectPicker
                      projects={projects}
                      currentProjectId={projectId}
                      onSelect={setProjectId}
                      onClose={() => setPickerOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Divider + actions */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send to Inbox
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreate('inbox')}
                  disabled={!title.trim()}
                  className="text-xs font-ui font-medium px-3 py-1.5 rounded-md bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-all"
                >
                  Send to Inbox
                </button>
                <button
                  onClick={() => handleCreate('today')}
                  disabled={!title.trim()}
                  className="text-xs font-ui font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground disabled:opacity-40 transition-all"
                >
                  Add to Today
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
