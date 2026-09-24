import { getSession } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { QuickActionsBar } from "@/components/dashboard/quick-actions";
import { TimetableWidget } from "@/components/dashboard/timetable-widget";
import { AssignmentsWidget } from "@/components/dashboard/assignments-widget";
import { CareerDSAWidget } from "@/components/dashboard/career-dsa-widget";
import { RecentNotesWidget } from "@/components/dashboard/recent-notes-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const data = await DashboardService.getDashboardData(session.userId);
  if (!data) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* 1. Dashboard Navigation Bar */}
      <DashboardNav session={session} notifications={data.notifications} />

      {/* 2. Main Dashboard Content */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8 focus:outline-none">
        {/* Welcome & Status Banner */}
        <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-violet-50/40 to-sky-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" className="text-xs">
                {data.student.college}
              </Badge>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                {data.student.course} ({data.student.branch}) • Year {data.student.year}, Sem {data.student.semester}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.greeting}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              You have <strong className="text-indigo-600 dark:text-indigo-400">{data.todayClasses.length} lectures</strong> scheduled today, and <strong className="text-amber-600 dark:text-amber-400">{data.upcomingAssignments.filter(a => !a.completed).length} pending assignments</strong> due this week.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-500">
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                <span>Attendance</span>
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {data.attendanceRate}%
              </p>
            </div>

            <div className="flex-1 md:flex-initial p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-500">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Study Streak</span>
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {data.studyStreakDays}d
              </p>
            </div>

            <div className="flex-1 md:flex-initial p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tasks Done</span>
              </div>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {data.assignmentCompletionRate}%
              </p>
            </div>
          </div>
        </section>

        {/* 3. Student Quick Actions */}
        <section>
          <QuickActionsBar />
        </section>

        {/* 4. Widgets Grid: 2 Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Today's Timetable Widget */}
            <TimetableWidget classes={data.todayClasses} />

            {/* Recent Notes & Document Grounding */}
            <RecentNotesWidget notes={data.recentNotes} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Assignments Deadline Tracker */}
            <AssignmentsWidget initialAssignments={data.upcomingAssignments} />

            {/* Placement, DSA & Internship Tracker */}
            <CareerDSAWidget
              dsaSolved={data.dsaSolvedCount}
              dsaTotal={data.dsaTotalCount}
              streakDays={data.studyStreakDays}
              categories={data.dsaCategories}
              jobStats={data.jobApplicationsCount}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
