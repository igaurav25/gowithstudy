"use client";

import * as React from "react";
import { NoteItem } from "@/services/notes-service";
import { NoteStatus } from "@/schemas/notes";
import { NoteCard } from "@/components/notes/note-card";
import { EmptyNotes } from "@/components/notes/empty-notes";

interface NotesGridProps {
  notes: NoteItem[];
  viewMode: "grid" | "list";
  hasFilters: boolean;
  isArchivedView: boolean;
  onResetFilters: () => void;
  onOpenUpload: () => void;
  onPreview: (note: NoteItem) => void;
  onStatusChange: (id: string, status: NoteStatus) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotesGrid({
  notes,
  viewMode,
  hasFilters,
  isArchivedView,
  onResetFilters,
  onOpenUpload,
  onPreview,
  onStatusChange,
  onToggleArchive,
  onDelete,
}: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <EmptyNotes
        hasFilters={hasFilters}
        isArchivedView={isArchivedView}
        onResetFilters={onResetFilters}
        onOpenUpload={onOpenUpload}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            viewMode="list"
            onPreview={onPreview}
            onStatusChange={onStatusChange}
            onToggleArchive={onToggleArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          viewMode="grid"
          onPreview={onPreview}
          onStatusChange={onStatusChange}
          onToggleArchive={onToggleArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
