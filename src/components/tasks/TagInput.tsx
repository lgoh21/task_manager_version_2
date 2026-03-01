'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IconX } from '@/components/ui/Icons';
import type { Tag } from '@/types';

interface TagInputProps {
  tags: Tag[];
  allTags: Tag[];
  onAddTag: (tagName: string) => void;
  onRemoveTag: (tagId: string) => void;
}

export function TagInput({ tags, allTags, onAddTag, onRemoveTag }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = inputValue.trim()
    ? allTags
        .filter(
          (t) =>
            t.name.includes(inputValue.trim().toLowerCase()) &&
            !tags.some((existing) => existing.id === t.id)
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const commitTag = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      onAddTag(trimmed);
      setInputValue('');
      setShowSuggestions(false);
    },
    [onAddTag]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (showSuggestions && suggestions[activeIndex]) {
        commitTag(suggestions[activeIndex].name);
      } else {
        commitTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 flex-wrap">
      {/* Existing tag pills */}
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 text-[11px] font-ui px-2 py-0.5 rounded-md bg-[rgba(107,92,231,0.1)] text-[#6B5CE7] font-medium"
        >
          {tag.name}
          <button
            onClick={() => onRemoveTag(tag.id)}
            className="hover:text-accent/70 transition-colors"
            aria-label={`Remove tag ${tag.name}`}
          >
            <IconX size={10} />
          </button>
        </span>
      ))}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Add tag...' : '+'}
          className="text-[11px] font-ui bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/60 w-16"
        />

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
            {suggestions.map((tag, i) => (
              <button
                key={tag.id}
                onClick={() => commitTag(tag.name)}
                className={`w-full text-left text-xs font-ui px-3 py-1.5 transition-colors ${
                  i === activeIndex ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
