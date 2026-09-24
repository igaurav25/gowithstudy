"use client";

import * as React from "react";
import {
  Compass,
  BookOpen,
  Code2,
  Target,
  Briefcase,
  Rocket,
  Building2,
  FileText,
} from "lucide-react";
import { CommunityCategory } from "@/schemas/community";

interface CommunityCategoriesNavProps {
  selectedCategory: CommunityCategory | "ALL";
  onSelectCategory: (cat: CommunityCategory | "ALL") => void;
  categoryCounts: Record<CommunityCategory, number>;
}

export function CommunityCategoriesNav({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CommunityCategoriesNavProps) {
  const categories: {
    id: CommunityCategory | "ALL";
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "ALL", label: "All Discussions", icon: Compass },
    { id: "STUDY", label: "Academics & Theory", icon: BookOpen },
    { id: "PROGRAMMING", label: "Programming & Contests", icon: Code2 },
    { id: "PLACEMENTS", label: "Placements & OAs", icon: Target },
    { id: "INTERNSHIPS", label: "Internships", icon: Briefcase },
    { id: "PROJECTS", label: "Projects & Hackathons", icon: Rocket },
    { id: "COLLEGE_LIFE", label: "Campus Life", icon: Building2 },
    { id: "RESOURCES", label: "Notes & PYQs", icon: FileText },
  ];

  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const count =
          cat.id === "ALL" ? totalCount : categoryCounts[cat.id as CommunityCategory] || 0;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              isSelected
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-zinc-400 dark:text-zinc-500"}`} />
            <span>{cat.label}</span>
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
  );
}
