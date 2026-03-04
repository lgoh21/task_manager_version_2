'use client';

import { useState, useRef, useEffect } from 'react';
import { IconCheck, IconArchive, IconMoreHorizontal } from '@/components/ui/Icons';
interface ProjectActionsProps {
  onFinish: () => void;
  onArchive: () => void;
}

export function ProjectActions({ onFinish, onArchive }: ProjectActionsProps) {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMore]);

  return (
    <div className="border-t border-border px-5 py-3 bg-muted">
      <div className="flex items-center gap-2">
        {/* Finish Project */}
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
        >
          <IconCheck size={14} />
          Finish Project
        </button>

        {/* Archive */}
        <button
          onClick={onArchive}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArchive size={14} />
          Archive
        </button>

        <div className="flex-1" />

        {/* More menu */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More actions"
          >
            <IconMoreHorizontal size={16} />
          </button>

          {showMore && (
            <div className="absolute bottom-full right-0 mb-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-10 font-ui">
              <button
                onClick={() => { onArchive(); setShowMore(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Archive project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
