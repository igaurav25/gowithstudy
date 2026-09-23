import { InternshipStats } from "@/services/internships-service";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Users, Trophy, TrendingUp } from "lucide-react";

interface InternshipsStatsBarProps {
  stats: InternshipStats;
}

export function InternshipsStatsBar({ stats }: InternshipsStatsBarProps) {
  const { total, applied, oaScheduled, interview, offer, offerRate } = stats;
  const activePipeline = oaScheduled + interview;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Applications Submitted */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Applications Sent
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                {applied}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {total} tracked total
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Active candidates in recruitment cycle
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active OAs & Interviews */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Active Assessments & Interviews
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {activePipeline}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                ({oaScheduled} OAs, {interview} Interviews)
              </span>
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
              Live rounds currently scheduled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Offers Secured */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Offers Secured
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {offer}
              </span>
              <span className="text-xs text-emerald-600/80 font-medium">
                🎉 Direct Offer Letters
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Accepted with Pre-Placement pathway
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Conversion Rate */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Interview to Offer Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {offerRate}%
              </span>
              <span className="text-xs text-zinc-400">
                High conversion
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, offerRate)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
