'use client';

import { useState, useRef, useEffect } from 'react';
import { IconArrowUp, IconCheck, IconMoreHorizontal, IconClock } from '@/components/ui/Icons';
import type { Task } from '@/types';

interface TaskActionsProps {
  task: Task;
  onMoveToToday: () => void;
  onComplete: () => void;
  onWaitingOn: (text: string) => void;
  onUnblock: () => void;
  onMoveToSomeday: () => void;
  onLetGo: () => void;
  onDelete: () => void;
}

export function TaskActions({
  task,
  onMoveToToday,
  onComplete,
  onWaitingOn,
  onUnblock,
  onMoveToSomeday,
  onLetGo,
  onDelete,
}: TaskActionsProps) {
  const [showMore, setShowMore] = useState(false);
  const [showWaitingInput, setShowWaitingInput] = useState(false);
  const [waitingText, setWaitingText] = useState('');
  const moreRef = useRef<HTMLDivElement>(null);
  const waitingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showWaitingInput && waitingInputRef.current) {
      waitingInputRef.current.focus();
    }
  }, [showWaitingInput]);

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

  const handleWaitingSubmit = () => {
    const trimmed = waitingText.trim();
    if (trimmed) {
      onWaitingOn(trimmed);
      setWaitingText('');
      setShowWaitingInput(false);
    }
  };

  const isOnToday = task.status === 'today';
  const isWaiting = task.status === 'waiting';

  return (
    <div className="border-t border-border px-5 py-3 bg-muted">
      {showWaitingInput && (
        <div className="flex items-center gap-2 mb-3">
          <input
            ref={waitingInputRef}
            value={waitingText}
            onChange={(e) => setWaitingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleWaitingSubmit();
              if (e.key === 'Escape') setShowWaitingInput(false);
            }}
            placeholder="Who or what is blocking?"
            className="flex-1 text-sm bg-muted rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            onClick={handleWaitingSubmit}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Save
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Move to Today (only when not already on Today) */}
        {!isOnToday && !isWaiting && (
          <button
            onClick={onMoveToToday}
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <IconArrowUp size={14} />
            Move to Today
          </button>
        )}

        {/* Waiting on / Unblock */}
        {isWaiting ? (
          <button
            onClick={onUnblock}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            <IconClock size={14} />
            Unblock
          </button>
        ) : (
          <button
            onClick={() => setShowWaitingInput(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconClock size={14} />
            Waiting on...
          </button>
        )}

        <div className="flex-1" />

        {/* Done */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
        >
          <IconCheck size={14} />
          Done
        </button>

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
              {isOnToday && (
                <button
                  onClick={() => { onMoveToSomeday(); setShowMore(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  Move to Someday
                </button>
              )}
              <button
                onClick={() => { onLetGo(); setShowMore(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Let go
              </button>
              <button
                onClick={() => { onDelete(); setShowMore(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-danger hover:bg-muted transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
