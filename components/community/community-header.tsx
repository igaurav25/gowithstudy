"use client";

import * as React from "react";
import { MessageSquarePlus, Users, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CommunityHeaderProps {
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function CommunityHeader({
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
}: CommunityHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Student Community & Doubts
          </h1>
          <Badge variant="purple" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Peer Forum</span>
          </Badge>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Ask academic doubts, exchange placement tips & OA experiences, discuss campus hackathons, and share verified notes.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search discussions or tags..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <Button
          onClick={onOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 gap-2 shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Discussion</span>
        </Button>
      </div>
    </div>
  );
}
