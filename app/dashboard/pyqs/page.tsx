import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PYQService } from "@/services/pyq-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PYQExplorerView } from "@/components/pyqs/pyq-explorer-view";

export const metadata = {
  title: "Previous Year Questions (PYQs) | GoWithStudy",
  description:
    "Explore authentic B.Tech CSE previous year examination papers with step-by-step model answers and AI-assisted solutions.",
};

export default async function PYQsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Pre-fetch papers and dashboard notifications in parallel
  const [papers, dashboardData] = await Promise.all([
    Promise.resolve(PYQService.getPapers()),
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
        <PYQExplorerView initialPapers={papers} />
      </main>
    </div>
  );
}
