"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ASSIGNMENT_PRIORITIES,
  ASSIGNMENT_STATUSES,
} from "@/schemas/assignments";
import { STANDARD_CSE_SUBJECTS } from "@/schemas/notes";
import { Search, X, RotateCcw } from "lucide-react";

interface AssignmentsFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (st: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedSubject: string;
  onSubjectChange: (s: string) => void;
  sortBy: string;
  onSortChange: (sb: "due_soonest" | "due_latest" | "priority" | "title") => void;
  onResetFilters: () => void;
  availableSubjects: string[];
}

export function AssignmentsFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  selectedSubject,
  onSubjectChange,
  sortBy,
  onSortChange,
  onResetFilters,
  availableSubjects,
}: AssignmentsFiltersProps) {
  const allSubjects = Array.from(
    new Set(["ALL", ...availableSubjects, ...STANDARD_CSE_SUBJECTS])
  );

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedStatus !== "ALL" ||
    selectedPriority !== "ALL" ||
    selectedSubject !== "ALL";

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assignments by title, topic, or description..."
            className="pl-9 pr-8 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-sm"
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

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter assignments by status"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter assignments by priority"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            {ASSIGNMENT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            aria-label="Filter assignments by course subject"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[160px] truncate"
          >
            <option value="ALL">All Subjects</option>
            {allSubjects
              .filter((s) => s !== "ALL")
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(
                e.target.value as "due_soonest" | "due_latest" | "priority" | "title"
              )
            }
            aria-label="Sort assignments"
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="due_soonest">Due Soonest</option>
            <option value="due_latest">Due Latest</option>
            <option value="priority">Priority First</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Reset Filters */}
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
    </div>
  );
}
