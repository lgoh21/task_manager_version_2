'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { smoothTransition } from '@/config/animations';

interface WaitingOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function WaitingOnModal({ isOpen, onClose, onSubmit }: WaitingOnModalProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={smoothTransition}
            className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-5 pb-2">
              <p className="text-sm font-ui font-medium mb-3">Who or what is blocking this task?</p>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Client feedback, API access..."
                className="w-full text-sm font-ui bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-accent/50 placeholder:text-muted-foreground/50 transition-colors"
              />
            </div>

            <div className="px-5 py-3 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="text-xs font-ui font-medium px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="text-xs font-ui font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground disabled:opacity-40 transition-all"
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
