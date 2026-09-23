import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Briefcase, Flame, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CareerDSAWidget({
  dsaSolved,
  dsaTotal,
  streakDays,
  categories,
  jobStats,
}: {
  dsaSolved: number;
  dsaTotal: number;
  streakDays: number;
  categories: { name: string; solved: number; total: number; pct: number }[];
  jobStats: { applied: number; interview: number; offer: number };
}) {
  const overallPct = Math.round((dsaSolved / dsaTotal) * 100);

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Placement & Career Preparation</CardTitle>
              <CardDescription className="text-xs">
                DSA challenge sheet & internship pipeline
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="text-[11px] flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{streakDays} Day Streak</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* DSA Overall Progress */}
        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-zinc-700 dark:text-zinc-300">Total Solved Problems</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
              {dsaSolved}/{dsaTotal} ({overallPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {/* Mini Categories */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            {categories.map((cat) => (
              <div key={cat.name} className="text-left">
                <div className="flex justify-between text-[11px] text-zinc-500 mb-0.5">
                  <span className="truncate">{cat.name}</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{cat.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Pipeline Stats Counter */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Applied</span>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{jobStats.applied}</p>
          </div>
          <div className="p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Interviews</span>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{jobStats.interview}</p>
          </div>
          <div className="p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Offers</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{jobStats.offer}</p>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-xs">
          <Link
            href="/dashboard/placement"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Open DSA Sheet →
          </Link>
          <Link
            href="/dashboard/internships"
            className="font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Track Applications →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
