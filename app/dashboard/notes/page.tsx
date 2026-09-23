import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NotesService } from "@/services/notes-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NotesClientView } from "@/components/notes/notes-client-view";

export const metadata = {
  title: "Study Notes & Materials | CampusFlow",
  description:
    "Organize lecture notes, syllabus PDFs, and revision cheatsheets with full-text search and AI study grounding.",
};

interface NotesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const autoOpenUpload = resolvedParams?.action === "upload";

  // Fetch student data and notes in parallel
  const [notes, stats, dashboardData] = await Promise.all([
    NotesService.getNotes(session.userId),
    NotesService.getNotesStats(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <NotesClientView
          initialNotes={notes}
          initialStats={stats}
          autoOpenUpload={autoOpenUpload}
        />
      </main>
    </div>
  );
}
