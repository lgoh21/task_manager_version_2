'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DatePicker } from '@/components/tasks/DatePicker';
import { TASK_SIZES } from '@/config/constants';
import { formatDueDate } from '@/lib/utils/dates';
import { getCarriedForwardLabel } from '@/lib/utils/carriedForward';
import type { Task, TaskSize } from '@/types';

interface TaskDetailMetaProps {
  task: Task;
  onUpdateSize: (size: TaskSize) => void;
  onUpdateDueDate: (dueDate: string | null) => void;
}

const SIZE_LABELS: Record<string, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
};

function getStatusLabel(task: Task): string {
  switch (task.status) {
    case 'inbox': return 'Inbox';
    case 'today': return 'Today';
    case 'someday': return 'Someday';
    case 'upcoming': return 'Upcoming';
    case 'waiting': return 'Waiting';
    case 'done': return 'Done';
    case 'let_go': return 'Let go';
    default: return task.status;
  }
}

export function TaskDetailMeta({ task, onUpdateSize, onUpdateDueDate }: TaskDetailMetaProps) {
  const carriedLabel = getCarriedForwardLabel(task);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sizePickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setSizePickerOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setSizePickerOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sizePickerOpen]);

  const statusDisplay = carriedLabel || getStatusLabel(task);
  const isCarried = !!carriedLabel;

  return (
    <div className="px-7 mb-8">
      <div className="border-t border-b border-border py-2">
        {/* Size row */}
        <div className="flex items-center min-h-[36px]">
          <span className="w-[100px] font-mono text-xs text-muted-foreground shrink-0">
            Size
          </span>
          <div className="relative" ref={sizeRef}>
            <button
              onClick={() => setSizePickerOpen((v) => !v)}
              className="font-ui text-[13.5px] text-foreground hover:text-foreground/70 transition-colors cursor-pointer"
            >
              {SIZE_LABELS[task.size] || task.size}
            </button>
            {sizePickerOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[120px] bg-card border border-border rounded-lg shadow-lg py-1">
                {TASK_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onUpdateSize(s);
                      setSizePickerOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-muted ${
                      task.size === s ? 'text-foreground font-medium' : 'text-foreground'
                    }`}
                  >
                    {SIZE_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Due row */}
        <div className="flex items-center min-h-[36px]">
          <span className="w-[100px] font-mono text-xs text-muted-foreground shrink-0">
            Due
          </span>
          <div className="relative">
            {task.due_date ? (
              <button
                onClick={() => setDatePickerOpen((v) => !v)}
                className="font-ui text-[13.5px] text-foreground hover:text-foreground/70 transition-colors cursor-pointer"
              >
                {formatDueDate(task.due_date)}
              </button>
            ) : (
              <button
                onClick={() => setDatePickerOpen((v) => !v)}
                className="font-ui text-[13.5px] text-[#B0ADA6] hover:text-muted-foreground transition-colors cursor-pointer"
              >
                + Add due date
              </button>
            )}
            <AnimatePresence>
              {datePickerOpen && (
                <DatePicker
                  currentDate={task.due_date}
                  onSelect={onUpdateDueDate}
                  onClose={() => setDatePickerOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center min-h-[36px]">
          <span className="w-[100px] font-mono text-xs text-muted-foreground shrink-0">
            Status
          </span>
          <span className={`font-ui text-[13.5px] ${isCarried ? 'text-warning' : 'text-foreground'}`}>
            {statusDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}
