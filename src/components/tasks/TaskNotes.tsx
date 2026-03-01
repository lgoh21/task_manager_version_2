'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NOTES_DEBOUNCE_MS } from '@/config/constants';

interface TaskNotesProps {
  notes: string | null;
  onUpdateNotes: (notes: string | null) => void;
  isNewTask?: boolean;
}

export function TaskNotes({ notes, onUpdateNotes, isNewTask }: TaskNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(notes ?? '');
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValue(notes ?? '');
  }, [notes]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const debouncedSave = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdateNotes(text || null);
      }, NOTES_DEBOUNCE_MS);
    },
    [onUpdateNotes]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSave(newValue);
  };

  const handleBlur = () => {
    // Save immediately on blur
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onUpdateNotes(value || null);
    if (!value) setIsEditing(false);
  };

  const showNudge = isNewTask && !notes && !nudgeDismissed && !isEditing;

  return (
    <div className="px-6 pb-6">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>

      {showNudge && (
        <p
          className="text-xs text-muted-foreground/60 mb-2 cursor-pointer hover:text-muted-foreground transition-colors"
          onClick={() => setNudgeDismissed(true)}
        >
          Got 2 minutes? Add some context while it&apos;s fresh.
        </p>
      )}

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleBlur();
              setIsEditing(false);
            }
          }}
          placeholder="Add context, links, thoughts..."
          className="w-full min-h-[120px] text-sm bg-transparent border border-border rounded-lg p-3 outline-none focus:border-accent/50 resize-y leading-relaxed"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[48px] cursor-text rounded-lg border border-transparent hover:border-border transition-colors p-2 -mx-2"
        >
          {value ? (
            <div className="prose-notes">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">
              Add context, links, thoughts...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
