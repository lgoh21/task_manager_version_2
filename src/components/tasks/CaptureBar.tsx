'use client';

import { useState, useRef, useCallback } from 'react';
import { IconPlus } from '@/components/ui/Icons';

interface CaptureBarProps {
  onCapture: (title: string) => void;
}

export function CaptureBar({ onCapture }: CaptureBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onCapture(trimmed);
    setValue('');
  }, [value, onCapture]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <button
        onClick={handleSubmit}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        aria-label="Add task"
      >
        <IconPlus size={16} />
      </button>
      <input
        ref={inputRef}
        data-capture-bar
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Capture a task..."
        className="font-ui flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
      />
      <kbd className="hidden sm:inline-flex font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
        &#8984;N
      </kbd>
    </div>
  );
}
