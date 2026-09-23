import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  PlusCircle,
  Flame,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";

interface DSAHeaderProps {
  streakDays: number;
  revisionCount: number;
  isRevisionMode: boolean;
  onToggleRevisionMode: () => void;
  onOpenAddModal: () => void;
}

export function DSAHeader({
  streakDays,
  revisionCount,
  isRevisionMode,
  onToggleRevisionMode,
  onOpenAddModal,
}: DSAHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              DSA & Placement Practice Sheet
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Curated SDE sheet with Blind 75, LeetCode top interview questions, and revision tracking
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Streak Badge */}
        <Badge
          variant="purple"
          className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{streakDays} Day Practice Streak</span>
        </Badge>

        {/* Quick Revision Mode Toggle */}
        <Button
          type="button"
          variant={isRevisionMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleRevisionMode}
          className={`text-xs gap-1.5 rounded-xl transition-all ${
            isRevisionMode
              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Revision Queue ({revisionCount})</span>
        </Button>

        {/* Add Problem Button */}
        <Button
          type="button"
          onClick={onOpenAddModal}
          size="sm"
          className="text-xs gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/20"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Custom Problem</span>
        </Button>
      </div>
    </div>
  );
}
