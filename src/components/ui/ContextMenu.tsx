'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - actions.length * 36 - 16);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-lg py-1"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {actions.map((action, i) => (
        <div key={i}>
          {action.separator && i > 0 && (
            <div className="h-px bg-border my-1" />
          )}
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-ui text-left transition-colors hover:bg-muted ${
              action.variant === 'danger'
                ? 'text-danger hover:bg-danger/5'
                : 'text-foreground'
            }`}
          >
            {action.icon && (
              <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        </div>
      ))}
    </motion.div>
  );
}
