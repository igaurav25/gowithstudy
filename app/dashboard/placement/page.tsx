import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DSAService } from "@/services/dsa-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DSAClientView } from "@/components/dsa/dsa-client-view";

export const metadata = {
  title: "Placement & DSA Practice Tracker | CampusFlow",
  description:
    "Curated technical interview coding sheet, Blind 75 algorithms, live solve streak, and revision queue for BTech CSE students.",
};

interface PlacementPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PlacementPage({ searchParams }: PlacementPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenAdd = resolvedParams?.action === "add";

  // Pre-fetch problems, analytics, and dashboard notifications in parallel
  const [problems, stats, dashboardData] = await Promise.all([
    DSAService.getProblems(session.userId),
    DSAService.getDSAStats(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <DSAClientView
          initialProblems={problems}
          initialStats={stats}
          autoOpenAdd={autoOpenAdd}
        />
      </main>
    </div>
  );
}
