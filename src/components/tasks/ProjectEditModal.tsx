'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { smoothTransition } from '@/config/animations';
import { theme } from '@/config/theme';
import type { Project } from '@/types';

interface ProjectEditModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, updates: { name?: string; colour?: string }) => void;
}

export function ProjectEditModal({ project, onClose, onSave }: ProjectEditModalProps) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColour(project.colour);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [project]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || !project) return;
    const updates: { name?: string; colour?: string } = {};
    if (trimmed !== project.name) updates.name = trimmed;
    if (colour !== project.colour) updates.colour = colour;
    if (Object.keys(updates).length > 0) {
      onSave(project.id, updates);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-foreground/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={smoothTransition}
            className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-5 pb-3">
              <p className="text-sm font-medium mb-3">Edit project</p>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Project name"
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-accent/50 placeholder:text-muted-foreground/50 transition-colors"
                maxLength={40}
              />
              <div className="flex items-center gap-2 mt-3">
                {theme.projectColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColour(c.value)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      colour === c.value
                        ? 'ring-2 ring-offset-2 ring-offset-card ring-accent scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>
            <div className="px-5 py-3 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="text-xs font-medium px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground disabled:opacity-40 transition-all"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
