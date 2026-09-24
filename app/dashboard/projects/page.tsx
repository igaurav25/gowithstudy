import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProjectsService } from "@/services/projects-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProjectsClientView } from "@/components/projects/projects-client-view";

export const metadata = {
  title: "Project Team Finder | CampusFlow",
  description:
    "Find teammates for hackathons, capstones, open-source repos, and campus startup ventures.",
};

interface ProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenCreate = resolvedParams?.action === "create";

  const [projects, stats, dashboardData] = await Promise.all([
    ProjectsService.getProjects(undefined, session.userId),
    ProjectsService.getProjectStats(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ProjectsClientView
          initialProjects={projects}
          initialStats={stats}
          currentUserId={session.userId}
          autoOpenCreate={autoOpenCreate}
        />
      </main>
    </div>
  );
}
