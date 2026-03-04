'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NOTES_DEBOUNCE_MS } from '@/config/constants';

interface ProjectDescriptionProps {
  description: string | null;
  onUpdate: (description: string | null) => void;
}

export function ProjectDescription({ description, onUpdate }: ProjectDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValue(description ?? '');
  }, [description]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const debouncedSave = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(text || null);
      }, NOTES_DEBOUNCE_MS);
    },
    [onUpdate]
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onUpdate(value || null);
    if (!value) setIsEditing(false);
  };

  return (
    <div className="px-7 pb-6">
      <h3 className="section-label mb-3">Description</h3>

      {isEditing ? (
        <div className="border border-border rounded-md overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleBlur();
                setIsEditing(false);
              }
              if (e.key === 'Escape') {
                handleBlur();
                setIsEditing(false);
              }
            }}
            placeholder="Add a description, goals, links..."
            className="w-full min-h-[120px] font-ui text-sm font-light text-foreground bg-[rgba(255,255,255,0.4)] p-3 outline-none resize-y leading-relaxed placeholder:text-[#B0ADA6] dark:bg-[rgba(255,255,255,0.03)]"
          />
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/50">
            <span className="text-[10px] font-mono text-muted-foreground">
              Markdown supported
            </span>
            <button
              onClick={() => {
                handleBlur();
                setIsEditing(false);
              }}
              className="text-xs font-ui font-medium px-3 py-1 rounded-md bg-accent text-accent-foreground transition-opacity hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
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
            <p className="font-ui text-[13px] text-[#B0ADA6]">
              Add a description, goals, links...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
