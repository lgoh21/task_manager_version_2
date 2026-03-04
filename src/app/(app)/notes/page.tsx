'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useConvertNoteToTask, useUpdateNoteProject } from '@/lib/hooks/queries/useNotes';
import { useProjects } from '@/lib/hooks/queries/useProjects';
import { useAppStore } from '@/lib/hooks/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { formatTimestamp } from '@/lib/utils/dates';
import { IconTrash, IconArrowUp, IconX } from '@/components/ui/Icons';

// Soft tints that rotate across cards for a sticky-note feel — warm palette
const NOTE_TINTS = [
  'bg-amber-50/60 border-amber-200/40 dark:bg-amber-900/10 dark:border-amber-700/20',
  'bg-blue-50/60 border-blue-200/40 dark:bg-blue-900/10 dark:border-blue-700/20',
  'bg-emerald-50/60 border-emerald-200/40 dark:bg-emerald-900/10 dark:border-emerald-700/20',
  'bg-violet-50/60 border-violet-200/40 dark:bg-violet-900/10 dark:border-violet-700/20',
  'bg-rose-50/60 border-rose-200/40 dark:bg-rose-900/10 dark:border-rose-700/20',
];

export default function NotesPage() {
  const { data: notes = [] } = useNotes();
  const { data: projects = [] } = useProjects();
  const { activeProjectFilter, setActiveProjectFilter } = useAppStore();
  const createNote = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const convertNote = useConvertNoteToTask();
  const updateNoteProject = useUpdateNoteProject();
  const { showToast } = useToast();
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const editRef = useRef<HTMLTextAreaElement>(null);

  const activeProjects = projects.filter((p) => !p.archived);
  const filterProject = activeProjects.find((p) => p.id === activeProjectFilter) ?? null;

  const sortedNotes = activeProjectFilter
    ? notes.filter((n) => n.project_id === activeProjectFilter)
    : notes;

  const handleSave = useCallback(() => {
    const content = draft.trim();
    if (!content) return;
    createNote.mutate({ content, projectId: activeProjectFilter });
    setDraft('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [draft, createNote, activeProjectFilter]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  const handleConvert = useCallback(
    (id: string) => {
      const note = (notes ?? []).find((n) => n.id === id);
      if (!note) return;
      const firstLine = note.content.split('\n')[0] ?? 'Untitled task';
      const title = firstLine.replace(/\*\*/g, '').trim() || 'Untitled task';
      convertNote.mutate(note);
      showToast(`"${title}" added to Inbox`);
    },
    [notes, convertNote, showToast]
  );

  // Auto-resize textarea
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    handleInput();
  }, [draft, handleInput]);

  const startEditing = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditDraft(content);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (trimmed) {
      updateNoteMutation.mutate({ id: editingId, content: trimmed });
    }
    setEditingId(null);
  }, [editingId, editDraft, updateNoteMutation]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  // Auto-resize edit textarea
  useEffect(() => {
    if (editingId && editRef.current) {
      const el = editRef.current;
      el.focus();
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [editingId, editDraft]);

  return (
    <div className="p-4">
      {/* Header */}
      <div>
        <h1 className="font-heading text-[30px] font-bold tracking-tight">Notes</h1>
        <p className="font-ui text-muted-foreground mt-0.5 text-sm">
          Brain dump, ideas, meeting notes
        </p>
      </div>

      {/* Project filter banner */}
      {filterProject && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-ui">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: filterProject.colour }}
          />
          <span className="text-muted-foreground">Showing notes for</span>
          <span className="font-medium">{filterProject.name}</span>
          <button
            onClick={() => setActiveProjectFilter(null)}
            className="ml-auto p-0.5 rounded hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
            title="Clear filter"
          >
            <IconX size={14} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="mt-4 border border-border rounded-lg overflow-hidden">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Brain dump... ideas, meeting notes, anything"
          className="w-full px-4 py-3 text-sm font-ui bg-card resize-none outline-none min-h-[80px] placeholder:text-muted-foreground"
          rows={3}
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/50">
          <span className="text-xs font-mono text-muted-foreground">
            Markdown supported &middot; {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to save
          </span>
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            className="text-xs font-ui font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground disabled:opacity-40 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>

      {/* Notes grid */}
      <div className="mt-6">
        {sortedNotes.length === 0 ? (
          <p className="text-sm font-ui text-muted-foreground py-8 text-center">
            No notes yet. Start typing above.
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 gap-3 space-y-3">
            <AnimatePresence>
              {sortedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`break-inside-avoid rounded-lg border p-4 group ${
                    NOTE_TINTS[i % NOTE_TINTS.length]
                  }`}
                >
                  {/* Note content — click to edit */}
                  {editingId === note.id ? (
                    <div>
                      <textarea
                        ref={editRef}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit();
                          }
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="w-full text-sm font-ui bg-transparent resize-none outline-none min-h-[60px]"
                      />
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-current/10">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to save
                        </span>
                        <div className="flex-1" />
                        <button
                          onClick={cancelEdit}
                          className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="text-[11px] font-medium text-accent hover:text-accent/80 px-2 py-1 rounded transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="prose-notes cursor-text"
                        onClick={() => startEditing(note.id, note.content)}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {note.content}
                        </ReactMarkdown>
                      </div>

                      {/* Footer: timestamp + project + hover actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-current/5">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {formatTimestamp(note.created_at)}
                        </span>
                        <NoteProjectPicker
                          projectId={note.project_id}
                          projects={activeProjects}
                          onUpdate={(projectId) => updateNoteProject.mutate({ id: note.id, projectId })}
                        />
                        <div className="flex-1" />
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleConvert(note.id)}
                            className="flex items-center gap-1 text-[11px] font-ui text-muted-foreground hover:text-accent transition-colors"
                            title="Convert to task"
                          >
                            <IconArrowUp size={12} />
                            <span>To task</span>
                          </button>
                          <button
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="flex items-center gap-1 text-[11px] font-ui text-muted-foreground hover:text-danger transition-colors"
                            title="Delete note"
                          >
                            <IconTrash size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/** Inline project picker for a note card */
function NoteProjectPicker({
  projectId,
  projects,
  onUpdate,
}: {
  projectId: string | null;
  projects: { id: string; name: string; colour: string }[];
  onUpdate: (projectId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const project = projects.find((p) => p.id === projectId) ?? null;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {project ? (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-[11px] font-ui text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.colour }} />
          {project.name}
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="text-[11px] font-ui text-muted-foreground/50 hover:text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          + Project
        </button>
      )}

      {open && (
        <div className="absolute left-0 bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-10 font-ui">
          {project && (
            <button
              onClick={() => { onUpdate(null); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
            >
              Remove project
            </button>
          )}
          {projects
            .filter((p) => p.id !== projectId)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => { onUpdate(p.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.colour }} />
                {p.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
