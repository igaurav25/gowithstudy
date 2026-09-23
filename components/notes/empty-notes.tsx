"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion, UploadCloud, RotateCcw } from "lucide-react";

interface EmptyNotesProps {
  hasFilters: boolean;
  onResetFilters: () => void;
  onOpenUpload: () => void;
  isArchivedView?: boolean;
}

export function EmptyNotes({
  hasFilters,
  onResetFilters,
  onOpenUpload,
  isArchivedView = false,
}: EmptyNotesProps) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {hasFilters
          ? "No matching study notes found"
          : isArchivedView
          ? "No archived notes"
          : "Your study library is empty"}
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm">
        {hasFilters
          ? "Try adjusting your search keywords, clearing subject filters, or switching status filters."
          : isArchivedView
          ? "Archived documents will appear here. You can archive any finished lecture notes to keep your active feed clean."
          : "Upload your first syllabus PDF, lecture slides, or exam cheatsheet to start organizing your semester."}
      </p>

      <div className="flex items-center gap-3 mt-6">
        {hasFilters ? (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All Filters</span>
          </Button>
        ) : (
          <Button
            onClick={onOpenUpload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload First Note</span>
          </Button>
        )}
      </div>
    </div>
  );
}
