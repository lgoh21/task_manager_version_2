'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Task, Project, Subtask } from '@/types';
import { formatDateOnly } from '@/lib/utils/dates';
import { smoothTransition } from '@/config/animations';
import {
  IconChevronDown,
  IconRotateCcw,
  IconTrash,
  IconCheck,
  IconCheckSquare,
  IconSquare,
} from '@/components/ui/Icons';

interface HistoryEntryProps {
  task: Task;
  project: Project | null;
  subtasks: Subtask[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryEntry({ task, project, subtasks, onRestore, onDelete }: HistoryEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dateLabel = task.completed_at ? formatDateOnly(task.completed_at) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={smoothTransition}
      className="border border-border rounded-lg bg-card overflow-hidden"
    >
      {/* Row header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <IconCheck size={14} className="text-muted-foreground shrink-0" />
        <span className="flex-1 text-sm font-ui font-medium truncate">{task.title}</span>
        {project && (
          <span className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: project.colour }}
            />
            <span className="text-xs font-ui text-muted-foreground">{project.name}</span>
          </span>
        )}
        <span className="text-xs font-mono text-muted-foreground shrink-0">{dateLabel}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0"
        >
          <IconChevronDown size={14} />
        </motion.span>
      </button>

      {/* Expanded detail — read-only */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {task.size}
                </span>
                {task.status === 'done' && (
                  <span className="text-xs font-ui text-success font-medium">Completed</span>
                )}
                {task.status === 'let_go' && (
                  <span className="text-xs font-ui text-muted-foreground font-medium">Let go</span>
                )}
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="prose-notes">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {task.notes}
                  </ReactMarkdown>
                </div>
              )}

              {/* Subtasks */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="section-label">
                    Subtasks ({subtasks.filter((s) => s.done).length}/{subtasks.length})
                  </span>
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 text-sm font-ui text-muted-foreground">
                      {st.done ? (
                        <IconCheckSquare size={14} className="text-success shrink-0" />
                      ) : (
                        <IconSquare size={14} className="shrink-0" />
                      )}
                      <span className={st.done ? 'line-through opacity-60' : ''}>{st.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onRestore(task.id); }}
                  className="flex items-center gap-1.5 text-xs font-ui font-medium text-accent hover:text-accent/80 transition-colors px-2 py-1.5 rounded-md hover:bg-accent/5"
                >
                  <IconRotateCcw size={13} />
                  Restore to Inbox
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="flex items-center gap-1.5 text-xs font-ui font-medium text-muted-foreground hover:text-danger transition-colors px-2 py-1.5 rounded-md hover:bg-danger/5"
                  >
                    <IconTrash size={13} />
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-ui text-danger">Delete permanently?</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                      className="text-xs font-medium text-danger hover:text-danger/80 px-2 py-1 rounded-md bg-danger/10"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
