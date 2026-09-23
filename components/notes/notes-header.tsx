"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotesStats } from "@/services/notes-service";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  BookOpen,
  Archive,
} from "lucide-react";

interface NotesHeaderProps {
  stats: NotesStats;
  onOpenUpload: () => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}

export function NotesHeader({
  stats,
  onOpenUpload,
  showArchived,
  onToggleArchived,
}: NotesHeaderProps) {
  const statCards = [
    {
      label: "Total Materials",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/40",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
      label: "Active Subjects",
      value: Object.keys(stats.subjectCounts).length,
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {showArchived ? "Archived Notes" : "Study Notes Library"}
            </h1>
            <Badge variant="purple" className="text-xs">
              {showArchived ? `${stats.archived} Archived` : `${stats.total} Documents`}
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Organize lecture slides, syllabus PDFs, and revision cheatsheets with full-text search, reading progress, and AI study grounding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleArchived}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5"
          >
            <Archive className="w-4 h-4" />
            <span>{showArchived ? "Back to Active" : "Archived"}</span>
          </Button>

          <Button
            onClick={onOpenUpload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-2xl border ${card.bg} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-2">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
