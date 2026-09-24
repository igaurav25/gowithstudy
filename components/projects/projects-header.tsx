"use client";

import * as React from "react";
import { PlusCircle, Users2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectsHeaderProps {
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: "browse" | "my_projects";
  onTabChange: (tab: "browse" | "my_projects") => void;
  myProjectsCount: number;
}

export function ProjectsHeader({
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  myProjectsCount,
}: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Project Team Finder
            </h1>
            <Badge variant="purple" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Campus Teammates</span>
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Find teammates for Smart India Hackathons, final-year capstone projects, open-source repos, and campus startup ventures.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects, tech stack, roles..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <Button
            onClick={onOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onTabChange("browse")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "browse"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          Explore All Listings
        </button>

        <button
          type="button"
          onClick={() => onTabChange("my_projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "my_projects"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <span>My Projects & Applications</span>
          {myProjectsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-500 text-white font-bold">
              {myProjectsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
