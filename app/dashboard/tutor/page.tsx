import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NotesService } from "@/services/notes-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { TutorService } from "@/services/tutor/tutor-service";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";

export const metadata = {
  title: "Interactive Multilingual AI Tutor | CampusFlow",
  description:
    "AI-powered interactive course teacher. Learn from your course notes and syllabus with step-by-step guidance, checks for understanding, and live web research in English, Hindi, or Hinglish.",
};

interface TutorPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TutorPage({ searchParams }: TutorPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const noteId = (resolvedParams?.noteId as string) || "note_os_01";
  const courseId = (resolvedParams?.courseId as string) || undefined;

  // Pre-fetch student's notes, dashboard data, and initialize course
  const [notes, dashboardData, tutorData] = await Promise.all([
    NotesService.getNotes(session.userId, { isArchived: false }),
    DashboardService.getDashboardData(session.userId),
    TutorService.startOrResumeCourse(session.userId, courseId, noteId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-16 flex flex-col">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col justify-start">
        <TutorWorkspace
          initialCourse={tutorData.course}
          initialProgress={tutorData.progress}
          initialInteraction={tutorData.interaction}
          availableNotes={notes}
        />
      </main>
    </div>
  );
}
