import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, UnauthorizedError, ForbiddenError } from "@/lib/guards";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Bell,
  Calendar,
  Users,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  MessageSquareQuote,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Faculty Workspace | GoWithStudy",
  description: "Dedicated workspace for verified educators to manage classes, course materials, announcements, and student interactions.",
};

export default async function TeacherDashboardPage() {
  let userSession;
  try {
    userSession = await requireUser({ roles: ["TEACHER"] });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/login?redirect=/teacher");
    }
    if (err instanceof ForbiddenError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-zinc-900 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Educator Portal Access Only
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This workspace is reserved for verified faculty and teachers. If you are an enrolled student, please use your dedicated student dashboard.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button size="sm" className="gap-2 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go to Student Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  const { user, session } = userSession;

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* 1. Header Navigation */}
      <DashboardNav session={session} notifications={[]} />

      {/* 2. Main Educator Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Faculty Banner */}
        <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-violet-50/40 to-sky-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" className="flex items-center gap-1.5 text-xs py-1 px-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Verified Faculty Member</span>
              </Badge>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                GoWithStudy Academic Network
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome, Prof. {user.name || "Educator"}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Manage your academic batches, publish verified lecture notes, broadcast urgent notices, and coordinate student consultations directly from your faculty console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/notes" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Lecture Notes</span>
              </Button>
            </Link>
            <Link href="/community" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto gap-2 border-zinc-300 dark:border-zinc-800">
                <Bell className="w-4 h-4" />
                <span>Publish Notice</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Classes Today</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3 Lectures</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Next at 11:30 AM
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Published Materials</span>
              <BookOpen className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">18 Notes</p>
            <p className="text-[11px] text-zinc-500">PDFs & syllabus guides</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Enrolled Students</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">142</p>
            <p className="text-[11px] text-zinc-500">Across 2 assigned sections</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium">Student Inquiries</span>
              <MessageSquareQuote className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">5 Unread</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Require consultation</p>
          </div>
        </div>

        {/* Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lecture Timetable Section */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  Today&apos;s Lecture Schedule
                </h3>
              </div>
              <Link href="/timetable" className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1">
                Full Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      Data Structures & Algorithms (CS-201)
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Section A</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 11:30 AM - 12:45 PM • Room LT-3
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                  Upcoming
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      Operating Systems Lab (CS-205)
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Section B</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 02:00 PM - 04:00 PM • Computing Lab 2
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-zinc-500">
                  Scheduled
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Academic Actions */}
          <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Academic Levers
            </h3>

            <div className="space-y-2.5">
              <Link href="/notes" className="block">
                <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Course Materials & Notes</p>
                    <p className="text-[11px] text-zinc-500">Distribute syllabus PDFs and lecture notes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>
              </Link>

              <Link href="/assignments" className="block">
                <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Track Submissions</p>
                    <p className="text-[11px] text-zinc-500">Review homework deadlines and student progress</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>
              </Link>

              <Link href="/community" className="block">
                <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Campus Notice Board</p>
                    <p className="text-[11px] text-zinc-500">Publish signed official announcements</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
