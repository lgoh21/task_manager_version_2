'use client';

import { useState, useRef, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { SUBTASK_SOFT_LIMIT } from '@/config/constants';
import { IconGripVertical } from '@/components/ui/Icons';
import type { Subtask } from '@/types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: string, done: boolean) => void;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onReorder?: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ subtasks, onToggle, onAdd, onDelete, onUpdateText, onReorder }: SubtaskListProps) {
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const doneCount = subtasks.filter((s) => s.done).length;
  const total = subtasks.length;
  const overLimit = total >= SUBTASK_SOFT_LIMIT;

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewText('');
    inputRef.current?.focus();
  };

  const startEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditValue(subtask.text);
  };

  const saveEdit = (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== subtasks.find((s) => s.id === id)?.text) {
      onUpdateText(id, trimmed);
    }
    setEditingId(null);
  };

  const placeholder = total === 0 ? "What's the first step?" : 'Add a step...';

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Subtasks
        </h3>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">{doneCount}/{total}</span>
        )}
      </div>

      {total === 0 && (
        <p className="text-xs text-muted-foreground/60 mb-2">
          Breaking it down makes it easier to start
        </p>
      )}

      {/* Subtask items — drag reorderable */}
      {total > 0 && (
        <Reorder.Group
          axis="y"
          values={subtasks}
          onReorder={(newOrder) => onReorder?.(newOrder)}
          className="space-y-0.5 mb-3"
        >
          {subtasks.map((subtask) => (
            <Reorder.Item
              key={subtask.id}
              value={subtask}
              className="list-none"
              dragListener={editingId !== subtask.id}
            >
              <SubtaskRow
                subtask={subtask}
                isEditing={editingId === subtask.id}
                editValue={editValue}
                editRef={editRef}
                onEditChange={setEditValue}
                onToggle={onToggle}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={onDelete}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Static empty-state spacer when no subtasks */}
      {total === 0 && <div className="mb-3" />}

      {/* Add subtask input */}
      <div className="flex items-center gap-3 py-1">
        <span className="w-[18px] h-[18px] rounded border-[1.5px] border-dashed border-border flex-shrink-0" />
        <input
          ref={inputRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {overLimit && (
        <p className="text-xs text-warning/70 mt-2">
          This task has a lot of steps. Consider breaking it into separate tasks.
        </p>
      )}
    </div>
  );
}

/** Single subtask row — extracted to keep SubtaskList under the line limit */
function SubtaskRow({
  subtask,
  isEditing,
  editValue,
  editRef,
  onEditChange,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  subtask: Subtask;
  isEditing: boolean;
  editValue: string;
  editRef: React.Ref<HTMLInputElement>;
  onEditChange: (value: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onStartEdit: (subtask: Subtask) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 group py-2 -mx-2 px-2 rounded-md hover:bg-muted/50">
      {/* Drag handle */}
      <span className="opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing text-muted-foreground flex-shrink-0">
        <IconGripVertical size={14} />
      </span>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(subtask.id, !subtask.done)}
        className={`w-[18px] h-[18px] rounded border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors ${
          subtask.done
            ? 'bg-accent border-accent text-accent-foreground'
            : 'border-border-hover hover:border-accent/50'
        }`}
      >
        {subtask.done && (
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text / edit input */}
      {isEditing ? (
        <input
          ref={editRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={() => onSaveEdit(subtask.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit(subtask.id);
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="flex-1 text-sm bg-transparent outline-none"
        />
      ) : (
        <span
          onClick={() => onStartEdit(subtask)}
          className={`flex-1 text-sm cursor-text ${
            subtask.done ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {subtask.text}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger text-xs transition-opacity p-0.5"
        aria-label="Delete subtask"
      >
        &times;
      </button>
    </div>
  );
}
