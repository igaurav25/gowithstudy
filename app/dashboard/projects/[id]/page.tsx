import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProjectsService } from "@/services/projects-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProjectDetailClientView } from "@/components/projects/project-detail-client-view";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await ProjectsService.getProjectById(id);
  if (!project) {
    return { title: "Project Not Found | CampusFlow" };
  }
  return {
    title: `${project.title} | CampusFlow Projects`,
    description: project.description.slice(0, 150),
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/projects/${id}`);
  }

  const [project, dashboardData] = await Promise.all([
    ProjectsService.getProjectById(id, session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ProjectDetailClientView
          initialProject={project}
          currentUserId={session.userId}
          userRole={session.role}
        />
      </main>
    </div>
  );
}
