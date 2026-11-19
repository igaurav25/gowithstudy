import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AttendanceService } from "@/services/attendance-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AttendanceClientView } from "@/components/attendance/attendance-client-view";

export const metadata = {
  title: "Attendance Tracker & Bunk Calculator | GoWithStudy",
  description:
    "Track your college attendance against the 75% rule. Calculate safe bunks, predict debarment risks, and mark classes directly.",
};

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Pre-fetch attendance data and dashboard notifications in parallel
  const [attendanceSummary, dashboardData] = await Promise.all([
    AttendanceService.getAttendance(session.userId),
    DashboardService.getDashboardData(session.userId, session),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AttendanceClientView initialData={attendanceSummary} />
      </main>
    </div>
  );
}
