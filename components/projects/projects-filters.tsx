"use client";

import * as React from "react";
import { Filter, Layers, Code, Check, X } from "lucide-react";
import { ProjectType, ProjectStatus, PROJECT_TYPES, PROJECT_STATUSES } from "@/schemas/projects";

interface ProjectsFiltersProps {
  selectedType: ProjectType | "ALL";
  onSelectType: (type: ProjectType | "ALL") => void;
  selectedStatus: ProjectStatus | "ALL";
  onSelectStatus: (status: ProjectStatus | "ALL") => void;
  selectedTech: string | null;
  onSelectTech: (tech: string | null) => void;
  sortBy: "recent" | "spots_open" | "team_size";
  onSortChange: (sort: "recent" | "spots_open" | "team_size") => void;
  typeCounts: Record<ProjectType, number>;
}

const TYPE_LABELS: Record<ProjectType, string> = {
  HACKATHON: "Hackathons",
  CAPSTONE: "Capstone",
  OPEN_SOURCE: "Open Source",
  RESEARCH: "Research",
  STARTUP: "Startups",
  PRACTICE: "Practice",
};

const POPULAR_TECH = [
  "Next.js",
  "Python",
  "FastAPI",
  "Rust",
  "React",
  "Gemini API",
  "PostgreSQL",
  "IoT",
  "Docker",
];

export function ProjectsFilters({
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  selectedTech,
  onSelectTech,
  sortBy,
  onSortChange,
  typeCounts,
}: ProjectsFiltersProps) {
  const totalCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3 pt-2">
      {/* 1. Project Type Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectType("ALL")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            selectedType === "ALL"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80"
          }`}
        >
          <span>All Projects</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedType === "ALL"
                ? "bg-white/20 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {PROJECT_TYPES.map((type) => {
          const isSelected = selectedType === type;
          const count = typeCounts[type] || 0;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80"
              }`}
            >
              <span>{TYPE_LABELS[type]}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Filter Bar (Status, Sort, Tech pills) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value as ProjectStatus | "ALL")}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="RECRUITING">Recruiting</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "recent" | "spots_open" | "team_size")
            }
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="recent">Sort: Newest First</option>
            <option value="spots_open">Sort: Most Open Spots</option>
            <option value="team_size">Sort: Team Size</option>
          </select>
        </div>

        {/* Tech tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
            Tech:
          </span>
          {POPULAR_TECH.map((tech) => {
            const isSelected = selectedTech?.toLowerCase() === tech.toLowerCase();
            return (
              <button
                key={tech}
                type="button"
                onClick={() => onSelectTech(isSelected ? null : tech)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tech}
              </button>
            );
          })}

          {selectedTech && (
            <button
              type="button"
              onClick={() => onSelectTech(null)}
              className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
