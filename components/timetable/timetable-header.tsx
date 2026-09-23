"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Download,
  LayoutGrid,
  Clock,
  Sparkles,
} from "lucide-react";

interface TimetableHeaderProps {
  totalClasses: number;
  todayClassesCount: number;
  currentDay: string;
  viewMode: "grid" | "agenda";
  onViewModeChange: (vm: "grid" | "agenda") => void;
  onOpenAddModal: () => void;
  onExportIcs: () => void;
}

export function TimetableHeader({
  totalClasses,
  todayClassesCount,
  currentDay,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onExportIcs,
}: TimetableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Class Timetable & Schedule
          </h1>
          <Badge variant="purple" className="text-xs">
            {todayClassesCount} Lectures Today
          </Badge>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Weekly course schedule for BTech Computer Science. Track live lectures, lab sessions, and sync with your calendar.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Weekly Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("agenda")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "agenda"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Agenda</span>
          </button>
        </div>

        {/* iCal Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportIcs}
          className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5 h-9"
          title="Download .ics file for Google or Apple Calendar"
        >
          <Download className="w-4 h-4" />
          <span>Export iCal</span>
        </Button>

        {/* Add Class Button */}
        <Button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 h-9"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </Button>
      </div>
    </div>
  );
}
