import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NotesService } from "@/services/notes-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AIWorkspace } from "@/components/ai/ai-workspace";

export const metadata = {
  title: "AI Study Copilot & Grounded RAG | CampusFlow",
  description:
    "Ask conceptual questions, generate practice quizzes, and extract cheatsheets grounded directly in your syllabus and course notes.",
};

interface AIPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AIPage({ searchParams }: AIPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const initialNoteId = (resolvedParams?.noteId as string) || "ALL";

  // Pre-fetch student's notes and dashboard data in parallel
  const [notes, dashboardData] = await Promise.all([
    NotesService.getNotes(session.userId, { isArchived: false }),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-12 flex flex-col">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main AI Workspace Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full flex flex-col justify-center">
        <AIWorkspace availableNotes={notes} initialNoteId={initialNoteId} />
      </main>
    </div>
  );
}
