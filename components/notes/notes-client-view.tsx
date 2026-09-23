"use client";

import * as React from "react";
import { NoteItem, NotesStats } from "@/services/notes-service";
import { CreateNoteInput, NoteStatus } from "@/schemas/notes";
import { NotesHeader } from "@/components/notes/notes-header";
import { NotesFilters } from "@/components/notes/notes-filters";
import { NotesGrid } from "@/components/notes/notes-grid";
import { UploadNoteModal } from "@/components/notes/upload-note-modal";
import { NotePreviewModal } from "@/components/notes/note-preview-modal";
import {
  createNoteAction,
  updateNoteStatusAction,
  toggleArchiveNoteAction,
  deleteNoteAction,
} from "@/features/notes/actions";
import { Check, AlertCircle } from "lucide-react";

interface NotesClientViewProps {
  initialNotes: NoteItem[];
  initialStats: NotesStats;
  autoOpenUpload?: boolean;
}

export function NotesClientView({
  initialNotes,
  initialStats,
  autoOpenUpload = false,
}: NotesClientViewProps) {
  // Local collections
  const [notes, setNotes] = React.useState<NoteItem[]>(initialNotes);
  const [stats, setStats] = React.useState<NotesStats>(initialStats);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "title" | "size">("newest");
  const [showArchived, setShowArchived] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = React.useState(autoOpenUpload);
  const [previewNote, setPreviewNote] = React.useState<NoteItem | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Re-calculate stats locally on state mutations
  const recalculateStats = (notesList: NoteItem[]) => {
    const activeNotes = notesList.filter((n) => !n.isArchived);
    const archivedNotes = notesList.filter((n) => n.isArchived);

    const subjectCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let inProgress = 0;
    let completed = 0;
    let read = 0;

    for (const n of activeNotes) {
      subjectCounts[n.subject] = (subjectCounts[n.subject] || 0) + 1;
      categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
      if (n.status === "IN_PROGRESS") inProgress++;
      else if (n.status === "COMPLETED") completed++;
      else if (n.status === "READ") read++;
    }

    setStats({
      total: activeNotes.length,
      inProgress,
      completed,
      read,
      archived: archivedNotes.length,
      subjectCounts,
      categoryCounts,
    });
  };

  // Available subjects for filter pill bar
  const availableSubjects = React.useMemo(() => {
    return Array.from(new Set(notes.map((n) => n.subject)));
  }, [notes]);

  // Client-side filtering & sorting
  const filteredNotes = React.useMemo(() => {
    let result = notes.filter((n) => n.isArchived === showArchived);

    // Subject
    if (selectedSubject !== "ALL") {
      result = result.filter(
        (n) => n.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Category
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (n) => n.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Status
    if (selectedStatus !== "ALL") {
      result = result.filter((n) => n.status === selectedStatus);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          n.subject.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "size") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [notes, showArchived, selectedSubject, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedSubject !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSubject("ALL");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
  };

  // Action Handlers
  const handleCreateNote = async (input: CreateNoteInput): Promise<boolean> => {
    const res = await createNoteAction(input);
    if (res.success && res.data) {
      const updatedList = [res.data, ...notes];
      setNotes(updatedList);
      recalculateStats(updatedList);
      showToast("Study material added successfully!");
      return true;
    }
    showToast(res.message || "Failed to create note", "error");
    return false;
  };

  const handleStatusChange = async (id: string, newStatus: NoteStatus) => {
    // Optimistic update
    const updatedList = notes.map((n) =>
      n.id === id ? { ...n, status: newStatus } : n
    );
    setNotes(updatedList);
    recalculateStats(updatedList);

    if (previewNote && previewNote.id === id) {
      setPreviewNote({ ...previewNote, status: newStatus });
    }

    const res = await updateNoteStatusAction(id, newStatus);
    if (res.success) {
      showToast(`Status updated to ${newStatus.replace("_", " ")}`);
    } else {
      showToast(res.message || "Could not update status", "error");
    }
  };

  const handleToggleArchive = async (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    const willArchive = !target.isArchived;
    const updatedList = notes.map((n) =>
      n.id === id ? { ...n, isArchived: willArchive } : n
    );
    setNotes(updatedList);
    recalculateStats(updatedList);

    if (previewNote && previewNote.id === id) {
      setPreviewNote(null);
    }

    const res = await toggleArchiveNoteAction(id);
    if (res.success) {
      showToast(willArchive ? "Note moved to archive" : "Note restored to active");
    } else {
      showToast(res.message || "Failed to toggle archive", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const updatedList = notes.filter((n) => n.id !== id);
    setNotes(updatedList);
    recalculateStats(updatedList);

    if (previewNote && previewNote.id === id) {
      setPreviewNote(null);
    }

    const res = await deleteNoteAction(id);
    if (res.success) {
      showToast("Note deleted successfully!");
    } else {
      showToast(res.message || "Failed to delete note", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === "success"
              ? "bg-zinc-900 text-white border-zinc-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header & KPI Summary */}
      <NotesHeader
        stats={stats}
        onOpenUpload={() => setIsUploadOpen(true)}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
      />

      {/* Search, Pills & Filters */}
      <NotesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={handleResetFilters}
        availableSubjects={availableSubjects}
      />

      {/* Notes Grid / List */}
      <NotesGrid
        notes={filteredNotes}
        viewMode={viewMode}
        hasFilters={hasActiveFilters}
        isArchivedView={showArchived}
        onResetFilters={handleResetFilters}
        onOpenUpload={() => setIsUploadOpen(true)}
        onPreview={(note) => setPreviewNote(note)}
        onStatusChange={handleStatusChange}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDelete}
      />

      {/* Upload Modal */}
      <UploadNoteModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleCreateNote}
      />

      {/* Preview Modal */}
      <NotePreviewModal
        note={previewNote}
        isOpen={Boolean(previewNote)}
        onClose={() => setPreviewNote(null)}
        onStatusChange={handleStatusChange}
        onToggleArchive={handleToggleArchive}
      />
    </div>
  );
}
