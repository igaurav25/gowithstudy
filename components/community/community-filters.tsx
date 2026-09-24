"use client";

import * as React from "react";
import { ArrowUpDown, Hash, X, Flame, Clock, MessageSquare, ThumbsUp } from "lucide-react";
import { CommunitySortOption } from "@/schemas/community";

interface CommunityFiltersProps {
  sortBy: CommunitySortOption;
  onSortChange: (sort: CommunitySortOption) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  trendingTags: { tag: string; count: number }[];
}

export function CommunityFilters({
  sortBy,
  onSortChange,
  selectedTag,
  onSelectTag,
  trendingTags,
}: CommunityFiltersProps) {
  const sortButtons: {
    id: CommunitySortOption;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "recent", label: "Newest", icon: Clock },
    { id: "most_discussed", label: "Most Discussed", icon: MessageSquare },
    { id: "top_voted", label: "Top Upvoted", icon: ThumbsUp },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      {/* Sort options */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {sortButtons.map((sb) => {
          const Icon = sb.icon;
          const isActive = sortBy === sb.id;
          return (
            <button
              key={sb.id}
              type="button"
              onClick={() => onSortChange(sb.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sb.label}</span>
            </button>
          );
        })}
      </div>

      {/* Popular tag chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 font-medium">
          <Hash className="w-3.5 h-3.5" />
          Tags:
        </span>
        {trendingTags.slice(0, 6).map((t) => {
          const isSelected = selectedTag === t.tag;
          return (
            <button
              key={t.tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? null : t.tag)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                isSelected
                  ? "bg-violet-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              #{t.tag}
            </button>
          );
        })}

        {selectedTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 shrink-0 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
