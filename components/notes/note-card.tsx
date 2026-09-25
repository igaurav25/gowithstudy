"use client";

import * as React from "react";
import Link from "next/link";
import { NoteItem } from "@/services/notes-service";
import { NoteStatus, NOTE_STATUSES } from "@/schemas/notes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Sparkles,
  Eye,
  Archive,
  Trash2,
  Tag,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowUpRight,
  MoreVertical,
  FileDown,
} from "lucide-react";
import { downloadNoteAsPDF } from "@/lib/pdf-generator";

interface NoteCardProps {
  note: NoteItem;
  viewMode?: "grid" | "list";
  onPreview: (note: NoteItem) => void;
  onStatusChange: (id: string, status: NoteStatus) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({
  note,
  viewMode = "grid",
  onPreview,
  onStatusChange,
  onToggleArchive,
  onDelete,
}: NoteCardProps) {
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  // Format file size
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "PDF";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Status visual attributes
  const getStatusBadge = (status: NoteStatus) => {
    switch (status) {
      case "COMPLETED":
        return {
          variant: "success" as const,
          label: "Completed",
          icon: CheckCircle2,
        };
      case "READ":
        return {
          variant: "purple" as const,
          label: "Read",
          icon: BookOpen,
        };
      case "IN_PROGRESS":
      default:
        return {
          variant: "warning" as const,
          label: "In Progress",
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusBadge(note.status);
  const StatusIcon = statusInfo.icon;

  // Format date
  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Handle status select change
  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as NoteStatus;
    if (newStatus !== note.status) {
      setIsChangingStatus(true);
      await onStatusChange(note.id, newStatus);
      setIsChangingStatus(false);
    }
  };

  if (viewMode === "list") {
    return (
      <div className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 transition-all hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {note.subject}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-500">
                {note.category}
              </span>
              <Badge variant={statusInfo.variant} className="text-[10px] py-0">
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>

            <h3
              onClick={() => onPreview(note)}
              className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
            >
              {note.title}
            </h3>

            {note.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {note.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2 flex-wrap">
              <span>{formatSize(note.fileSize)}</span>
              <span>•</span>
              <span>Updated {formattedDate}</span>
              {note.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {/* Status changer */}
          <select
            value={note.status}
            onChange={handleStatusSelect}
            disabled={isChangingStatus}
            aria-label="Change reading status"
            className="text-xs h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {NOTE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Ask AI deep link */}
          <Link href={`/dashboard/ai?noteId=${note.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Button>
          </Link>

          {/* Download Clean PDF button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadNoteAsPDF(note)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Download clean formatted PDF"
          >
            <FileDown className="w-4 h-4" />
          </Button>

          {/* Preview button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(note)}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600"
            title="Preview note"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Archive button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleArchive(note.id)}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-amber-600"
            title={note.isArchived ? "Unarchive" : "Archive"}
          >
            <Archive className="w-4 h-4" />
          </Button>

          {/* Delete button */}
          {showConfirmDelete ? (
            <div className="flex items-center gap-1 animate-in fade-in">
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs px-2"
                onClick={() => onDelete(note.id)}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-1.5"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirmDelete(true)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
              {note.subject}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {note.category}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant={statusInfo.variant} className="text-[10px] py-0.5">
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onPreview(note)}
          className="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors mb-2"
        >
          {note.title}
        </h3>

        {/* Description */}
        {note.description ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {note.description}
          </p>
        ) : (
          <p className="text-xs text-zinc-400 italic mb-4">
            No description provided.
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                <Tag className="w-2.5 h-2.5 text-zinc-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
        {/* File & Date metadata */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {formatSize(note.fileSize)}
            </span>
          </div>
          <span>Added {formattedDate}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Quick status selector */}
          <select
            value={note.status}
            onChange={handleStatusSelect}
            disabled={isChangingStatus}
            aria-label="Change note status"
            className="text-xs h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {NOTE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === "IN_PROGRESS"
                  ? "In Progress"
                  : st === "COMPLETED"
                  ? "Completed"
                  : "Read"}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            {/* Ask AI button */}
            <Link href={`/dashboard/ai?noteId=${note.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 gap-1 px-2.5"
                title="Ask AI questions grounded in this note"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </Button>
            </Link>

            {/* Direct Clean PDF Download */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadNoteAsPDF(note)}
              className="h-8 text-xs px-2 gap-1 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Download clean formatted PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>

            {/* Preview modal button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPreview(note)}
              className="h-8 text-xs px-2.5 gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Button>

            {/* Archive / Delete quick actions */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleArchive(note.id)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-600"
              title={note.isArchived ? "Restore to active" : "Archive note"}
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>

            {showConfirmDelete ? (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-[11px] px-2"
                onClick={() => onDelete(note.id)}
              >
                Confirm
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmDelete(true)}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
