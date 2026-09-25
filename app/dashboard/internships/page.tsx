import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { InternshipsService } from "@/services/internships-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { InternshipsClientView } from "@/components/internships/internships-client-view";

export const metadata = {
  title: "Internship & Job Pipeline Tracker | GoWithStudy",
  description:
    "Interactive Kanban pipeline, OA deadlines, interview logs, and offer tracker for computer science students.",
};

interface InternshipsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InternshipsPage({
  searchParams,
}: InternshipsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenAdd = resolvedParams?.action === "add";

  // Pre-fetch applications, statistics, and dashboard notifications in parallel
  const [applications, stats, dashboardData] = await Promise.all([
    InternshipsService.getApplications(session.userId),
    InternshipsService.getInternshipStats(session.userId),
    DashboardService.getDashboardData(session.userId),
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
        <InternshipsClientView
          initialApplications={applications}
          initialStats={stats}
          autoOpenAdd={autoOpenAdd}
        />
      </main>
    </div>
  );
}
