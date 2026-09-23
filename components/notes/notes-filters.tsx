"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NOTE_CATEGORIES,
  STANDARD_CSE_SUBJECTS,
  NoteStatus,
} from "@/schemas/notes";
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
} from "lucide-react";

interface NotesFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSubject: string;
  onSubjectChange: (s: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedStatus: string;
  onStatusChange: (st: string) => void;
  sortBy: string;
  onSortChange: (sb: "newest" | "oldest" | "title" | "size") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (vm: "grid" | "list") => void;
  onResetFilters: () => void;
  availableSubjects: string[];
}

export function NotesFilters({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  availableSubjects,
}: NotesFiltersProps) {
  // Combine standard subjects with any subjects present in available notes
  const allSubjects = Array.from(
    new Set(["ALL", ...availableSubjects, ...STANDARD_CSE_SUBJECTS])
  );

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedSubject !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL";

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-4 backdrop-blur-sm">
      {/* Row 1: Search, Category, Status, Sort & View Mode */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes by title, topic, tags, or description..."
            className="pl-9 pr-8 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 focus:ring-indigo-500 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {NOTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Tabs/Select */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by reading status"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="READ">Read</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "newest" | "oldest" | "title" | "size")
            }
            aria-label="Sort notes"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="size">File Size</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700/60 p-0.5 bg-zinc-50 dark:bg-zinc-800/50">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Subject Pills (Scrollable horizontally) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3 h-3" />
          Subject:
        </span>
        {allSubjects.map((subj) => {
          const isSelected =
            subj === "ALL" ? selectedSubject === "ALL" : selectedSubject === subj;
          return (
            <button
              key={subj}
              type="button"
              onClick={() => onSubjectChange(subj)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {subj === "ALL" ? "All Subjects" : subj}
            </button>
          );
        })}
      </div>
    </div>
  );
}
