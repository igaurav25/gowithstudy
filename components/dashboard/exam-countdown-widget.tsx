"use client";

import * as React from "react";
import Link from "next/link";
import { ExamItem } from "@/schemas/exam-timer";
import { ExamTimerService, ExamCountdownStats } from "@/services/exam-timer-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Zap,
} from "lucide-react";

interface ExamCountdownWidgetProps {
  initialExams: ExamItem[];
}

export function ExamCountdownWidget({ initialExams }: ExamCountdownWidgetProps) {
  const [exams] = React.useState<ExamItem[]>(initialExams);

  const getUrgencyBadge = (stats: ExamCountdownStats) => {
    if (stats.hasPassed) {
      return {
        variant: "secondary" as const,
        label: "Exam Concluded",
        className: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
      };
    }
    if (stats.isToday) {
      return {
        variant: "destructive" as const,
        label: "TODAY!",
        className: "bg-rose-600 text-white animate-pulse",
      };
    }
    if (stats.urgency === "CRITICAL") {
      return {
        variant: "destructive" as const,
        label: `${stats.days}d ${stats.hours}h left`,
        className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
      };
    }
    if (stats.urgency === "UPCOMING") {
      return {
        variant: "outline" as const,
        label: `${stats.days} days left`,
        className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
      };
    }
    return {
      variant: "secondary" as const,
      label: `${stats.days} days left`,
      className: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60",
    };
  };

  const formatCategory = (cat: string) => {
    switch (cat) {
      case "MID_SEM":
        return "Mid-Semester";
      case "END_SEM":
        return "End-Semester Major";
      case "PRACTICAL_VIVA":
        return "Practical / Viva";
      default:
        return "Internal Test";
    }
  };

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Exam Countdown & Syllabus Readiness
              </CardTitle>
              <p className="text-[11px] text-zinc-500">
                Official college dates & high-yield revision links
              </p>
            </div>
          </div>
          <Link href="/dashboard/pyqs">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-indigo-600 dark:text-indigo-400 gap-1 h-8 touch-manipulation"
            >
              <span>Explore PYQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {exams.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No exams scheduled in this semester.
          </div>
        ) : (
          exams.slice(0, 3).map((exam) => {
            const stats = ExamTimerService.calculateCountdown(exam.date);
            const badge = getUrgencyBadge(stats);

            return (
              <div
                key={exam.id}
                className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-indigo-400/50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {exam.courseCode}
                      </span>
                      <span className="text-[10px] text-zinc-400">•</span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {formatCategory(exam.category)}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {exam.subject}
                    </h4>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap",
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Date & Venue line */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{exam.time}</span>
                  </div>
                  {exam.venue && (
                    <span className="truncate max-w-[200px]">📍 {exam.venue}</span>
                  )}
                </div>

                {/* Syllabus readiness bar */}
                <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Syllabus Covered</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {exam.syllabusCompletedPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        exam.syllabusCompletedPercent >= 75
                          ? "bg-emerald-500"
                          : exam.syllabusCompletedPercent >= 50
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${exam.syllabusCompletedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Quick actions for student revision */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/dashboard/pyqs?subject=${encodeURIComponent(exam.subject)}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[11px] h-8 gap-1 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 touch-manipulation"
                    >
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>Review PYQs</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/flashcards" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[11px] h-8 gap-1 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 touch-manipulation"
                    >
                      <Zap className="w-3 h-3 text-indigo-500" />
                      <span>Flashcards</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
