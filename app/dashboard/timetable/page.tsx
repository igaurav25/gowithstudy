import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TimetableService } from "@/services/timetable-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { TimetableClientView } from "@/components/timetable/timetable-client-view";
import { DayOfWeek } from "@/schemas/timetable";

export const metadata = {
  title: "Class Timetable & Schedule | CampusFlow",
  description:
    "Interactive weekly schedule grid, real-time ongoing lecture tracker, clash detector, and RFC 5545 iCal export for BTech CSE students.",
};

interface TimetablePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TimetablePage({ searchParams }: TimetablePageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenAdd = resolvedParams?.action === "add";

  // Pre-fetch timetable, current day, and dashboard notifications in parallel
  const [schedule, currentDay, dashboardData] = await Promise.all([
    TimetableService.getWeeklyTimetable(session.userId),
    Promise.resolve(TimetableService.getCurrentDay()),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <TimetableClientView
          initialClasses={schedule}
          currentDay={currentDay}
          autoOpenAdd={autoOpenAdd}
        />
      </main>
    </div>
  );
}
