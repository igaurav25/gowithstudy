import { DSAStats } from "@/services/dsa-service";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Flame, BookmarkCheck, BarChart2 } from "lucide-react";

interface DSAStatsOverviewProps {
  stats: DSAStats;
}

export function DSAStatsOverview({ stats }: DSAStatsOverviewProps) {
  const { totalSolved, totalProblems, completionRate, streakDays, revisionCount, difficultyStats } =
    stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Overall Solved Progress */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Problems Solved
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {totalSolved}
                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 ml-1">
                  / {totalProblems}
                </span>
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {completionRate}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Difficulty Breakdown */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Difficulty Split
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                EASY
              </span>
              <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {difficultyStats.easy.solved}/{difficultyStats.easy.total}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                MED
              </span>
              <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300">
                {difficultyStats.medium.solved}/{difficultyStats.medium.total}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/40">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                HARD
              </span>
              <span className="text-xs font-bold font-mono text-rose-700 dark:text-rose-300">
                {difficultyStats.hard.solved}/{difficultyStats.hard.total}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Revision Queue */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Revision Queue
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {revisionCount}
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Tricky problems flagged for mock interview recap
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Study Streak */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Practice Consistency
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {streakDays}
              </span>
              <span className="text-xs font-semibold text-zinc-500">Days Active</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              🔥 On track for campus placements
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
