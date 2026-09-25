import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AssignmentsService } from "@/services/assignments-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AssignmentsClientView } from "@/components/assignments/assignments-client-view";

export const metadata = {
  title: "Assignments & Project Deadlines | GoWithStudy",
  description:
    "Track coursework submissions, lab reports, and deadlines with priority countdown alerts and progress stats for BTech CSE students.",
};

interface AssignmentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenAdd = resolvedParams?.action === "add";

  // Pre-fetch assignments, statistics, and dashboard notifications in parallel
  const [assignments, stats, dashboardData] = await Promise.all([
    AssignmentsService.getAssignments(session.userId),
    AssignmentsService.getAssignmentsStats(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AssignmentsClientView
          initialAssignments={assignments}
          initialStats={stats}
          autoOpenAdd={autoOpenAdd}
        />
      </main>
    </div>
  );
}
