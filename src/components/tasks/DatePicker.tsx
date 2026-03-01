'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconX } from '@/components/ui/Icons';

interface DatePickerProps {
  currentDate: string | null;
  onSelect: (date: string | null) => void;
  onClose: () => void;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseExistingDate(dateStr: string | null): { date: string; time: string } {
  if (!dateStr) return { date: '', time: '' };
  const d = new Date(dateStr);
  const date = toLocalDateString(d);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const time = hours === 0 && minutes === 0 ? '' : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { date, time };
}

function buildISOString(date: string, time: string): string {
  if (time) {
    return new Date(`${date}T${time}`).toISOString();
  }
  return new Date(`${date}T00:00:00`).toISOString();
}

export function DatePicker({ currentDate, onSelect, onClose }: DatePickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseExistingDate(currentDate);
  const [dateValue, setDateValue] = useState(parsed.date);
  const [timeValue, setTimeValue] = useState(parsed.time);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    if (newDate) {
      onSelect(buildISOString(newDate, timeValue));
      onClose();
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (dateValue) {
      onSelect(buildISOString(dateValue, newTime));
    }
  };

  const handleQuickPick = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const iso = toLocalDateString(d);
    setDateValue(iso);
    setTimeValue('');
    onSelect(buildISOString(iso, ''));
    onClose();
  };

  const handleClear = () => {
    onSelect(null);
    onClose();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.1 }}
      className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-card border border-border rounded-lg shadow-lg p-3"
    >
      {/* Quick picks */}
      <div className="flex flex-col gap-0.5 mb-2">
        <button onClick={() => handleQuickPick(0)} className="text-xs px-2 py-1.5 rounded hover:bg-muted w-full text-left text-foreground">
          Today
        </button>
        <button onClick={() => handleQuickPick(1)} className="text-xs px-2 py-1.5 rounded hover:bg-muted w-full text-left text-foreground">
          Tomorrow
        </button>
        <button onClick={() => handleQuickPick(7)} className="text-xs px-2 py-1.5 rounded hover:bg-muted w-full text-left text-foreground">
          Next week
        </button>
      </div>

      <div className="h-px bg-border mb-2" />

      {/* Date input */}
      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Date</label>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => handleDateChange(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded border border-border bg-muted text-foreground outline-none focus:border-accent"
      />

      {/* Time input (optional) */}
      <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mt-2 mb-1">Time (optional)</label>
      <input
        type="time"
        value={timeValue}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded border border-border bg-muted text-foreground outline-none focus:border-accent"
      />

      {/* Clear */}
      {currentDate && (
        <>
          <div className="h-px bg-border mt-2 mb-1" />
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded hover:bg-muted w-full text-left text-danger"
          >
            <IconX size={12} />
            No date
          </button>
        </>
      )}
    </motion.div>
  );
}
