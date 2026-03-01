'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useAllTasks } from '@/lib/hooks/queries/useTasks';
import { useNotes } from '@/lib/hooks/queries/useNotes';
import { useAllSubtasks } from '@/lib/hooks/queries/useSubtasks';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useAllTags, useAllTaskTags } from '@/lib/hooks/queries/useTags';
import { IconSearch } from '@/components/ui/Icons';
import { SearchResult, type SearchResultItem } from '@/components/ui/SearchResult';
import { smoothTransition } from '@/config/animations';

const MAX_RESULTS = 12;

export function SearchPalette() {
  const { searchOpen, setSearchOpen, selectTask } = useAppStore();
  const { data: tasks = [] } = useAllTasks();
  const { data: notes = [] } = useNotes();
  const { data: subtasks = [] } = useAllSubtasks();
  const { data: projects = [] } = useProjects();
  const { data: allTagsList = [] } = useAllTags();
  const { data: allTaskTags = [] } = useAllTaskTags();
  const router = useRouter();

  const getTagsForTask = useCallback((taskId: string) => {
    const tagIds = allTaskTags.filter(tt => tt.task_id === taskId).map(tt => tt.tag_id);
    return allTagsList.filter(t => tagIds.includes(t.id));
  }, [allTaskTags, allTagsList]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset state when opened
  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActiveIndex(0);
      // Small delay to let the modal mount before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  // Search logic
  const results = useMemo((): SearchResultItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResultItem[] = [];

    // Search tasks (titles, notes, subtask text)
    for (const task of tasks) {
      if (items.length >= MAX_RESULTS) break;

      const titleMatch = task.title.toLowerCase().includes(q);
      const notesMatch = task.notes?.toLowerCase().includes(q);
      const taskSubtasks = subtasks.filter((s) => s.task_id === task.id);
      const subtaskMatch = taskSubtasks.find((s) => s.text.toLowerCase().includes(q));
      const taskTags = getTagsForTask(task.id);
      const tagMatch = taskTags.find((t) => t.name.toLowerCase().includes(q));

      if (titleMatch || notesMatch || subtaskMatch || tagMatch) {
        let snippet: string | null = null;
        if (notesMatch && task.notes) {
          snippet = getSnippet(task.notes, q);
        } else if (subtaskMatch) {
          snippet = `Subtask: ${subtaskMatch.text}`;
        } else if (tagMatch) {
          snippet = `Tag: #${tagMatch.name}`;
        }
        items.push({ type: 'task', task, project: projects.find(p => p.id === task.project_id) ?? null, snippet });
      }
    }

    // Search standalone notes
    for (const note of notes) {
      if (items.length >= MAX_RESULTS) break;
      if (note.content.toLowerCase().includes(q)) {
        items.push({ type: 'note', note, snippet: getSnippet(note.content, q) });
      }
    }

    return items;
  }, [query, tasks, notes, subtasks, projects, getTagsForTask]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      setSearchOpen(false);
      if (item.type === 'task') {
        selectTask(item.task.id);
      } else {
        router.push('/notes');
      }
    },
    [setSearchOpen, selectTask, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    },
    [results, activeIndex, handleSelect, setSearchOpen]
  );

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={smoothTransition}
            className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <IconSearch size={16} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tasks, notes, subtasks..."
                className="flex-1 text-sm font-ui bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto p-1.5">
              {query.trim() && results.length === 0 && (
                <p className="text-sm font-ui text-muted-foreground text-center py-6">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}
              {results.map((item, i) => (
                <SearchResult
                  key={item.type === 'task' ? item.task.id : item.note.id}
                  item={item}
                  active={i === activeIndex}
                  onSelect={() => handleSelect(item)}
                />
              ))}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span><kbd className="bg-muted px-1 py-0.5 rounded">↑↓</kbd> navigate</span>
                <span><kbd className="bg-muted px-1 py-0.5 rounded">↵</kbd> open</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Extract a short snippet around the first match */
function getSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text.slice(0, 80);

  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  let snippet = text.slice(start, end).replace(/\n/g, ' ');
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}
