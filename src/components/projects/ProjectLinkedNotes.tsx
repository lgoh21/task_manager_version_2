'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { IconPlus } from '@/components/ui/Icons';
import { useNotes, useUpdateNoteProject } from '@/lib/hooks/queries/useNotes';
import type { Note } from '@/types';

interface ProjectLinkedNotesProps {
  notes: Note[];
  projectId: string;
}

export function ProjectLinkedNotes({ notes, projectId }: ProjectLinkedNotesProps) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const { data: allNotes = [] } = useNotes();
  const updateNoteProject = useUpdateNoteProject();

  // Notes not linked to any project (available to link)
  const unlinkedNotes = allNotes.filter((n) => !n.project_id);

  const handleLinkNote = (noteId: string) => {
    updateNoteProject.mutate({ id: noteId, projectId });
    setShowPicker(false);
  };

  return (
    <div className="px-7 pb-6">
      <h3 className="section-label mb-3">Linked Notes</h3>

      {notes.length === 0 && !showPicker ? (
        <p className="text-sm text-muted-foreground/60 mb-3">No notes linked to this project</p>
      ) : (
        <div className="space-y-2 mb-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push('/notes')}
              className="border border-border rounded-lg p-3 cursor-pointer hover:border-border-hover transition-colors"
            >
              <div className="prose-notes text-sm line-clamp-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
              </div>
              <p className="text-xs font-mono text-muted-foreground/60 mt-2">
                {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Link a note picker */}
      {showPicker ? (
        <div className="border border-border rounded-lg p-2 space-y-1">
          {unlinkedNotes.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 p-2">No unlinked notes available</p>
          ) : (
            unlinkedNotes.slice(0, 5).map((note) => (
              <button
                key={note.id}
                onClick={() => handleLinkNote(note.id)}
                className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors line-clamp-1"
              >
                {note.content.split('\n')[0]?.slice(0, 60) || 'Empty note'}
              </button>
            ))
          )}
          <button
            onClick={() => setShowPicker(false)}
            className="w-full text-center text-xs text-muted-foreground py-1 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <IconPlus size={11} />
          Link a note
        </button>
      )}
    </div>
  );
}
