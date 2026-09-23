"use client";

import * as React from "react";
import Link from "next/link";
import { NoteItem } from "@/services/notes-service";
import { NoteStatus, NOTE_STATUSES } from "@/schemas/notes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  FileText,
  Sparkles,
  Download,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  BookOpen,
  Archive,
  ExternalLink,
  BookMarked,
  Maximize2,
} from "lucide-react";

interface NotePreviewModalProps {
  note: NoteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: NoteStatus) => void;
  onToggleArchive: (id: string) => void;
}

export function NotePreviewModal({
  note,
  isOpen,
  onClose,
  onStatusChange,
  onToggleArchive,
}: NotePreviewModalProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages] = React.useState(12);

  if (!isOpen || !note) return null;

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "PDF";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {note.subject}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Badge variant="secondary" className="text-[10px]">
                  {note.category}
                </Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Ask AI grounding button */}
            <Link href={`/dashboard/ai?noteId=${note.id}`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI Assistant</span>
              </Button>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document viewer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Reading Status</span>
              <select
                value={note.status}
                onChange={(e) => onStatusChange(note.id, e.target.value as NoteStatus)}
                aria-label="Change status in preview"
                className="mt-1 font-semibold text-xs bg-transparent border-0 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                {NOTE_STATUSES.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-zinc-900">
                    {st.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">File Size</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1 block">
                {formatSize(note.fileSize)}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Added On</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1 block">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">File Format</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1 block">
                PDF Document
              </span>
            </div>
          </div>

          {/* Description & Summary */}
          {note.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Summary & Key Objectives
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-800/20 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                {note.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Topic Tags
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {note.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs py-1 px-2.5 bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <Tag className="w-3 h-3 mr-1 text-zinc-400" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Document Viewer Frame */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-bold uppercase tracking-wider">
                Document Preview
              </span>
              <div className="flex items-center gap-2">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-6 min-h-[320px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
              <div className="max-w-md space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-800 mx-auto flex items-center justify-center text-red-500">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {note.fileName || `${note.title}.pdf`}
                  </h5>
                  <p className="text-xs text-zinc-500 mt-1">
                    Document verified for student learning • Grounded with CampusFlow AI RAG
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Link href={`/dashboard/ai?noteId=${note.id}`}>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Study with CampusFlow AI</span>
                    </Button>
                  </Link>

                  {note.fileUrl && (
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={note.fileName || "note.pdf"}
                    >
                      <Button size="sm" variant="outline" className="text-xs gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleArchive(note.id)}
            className="text-xs text-zinc-500 hover:text-amber-600 gap-1.5"
          >
            <Archive className="w-4 h-4" />
            <span>{note.isArchived ? "Unarchive Note" : "Archive Note"}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
