import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FlashcardService } from "@/services/flashcard-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { FlashcardStudyView } from "@/components/flashcards/flashcard-study-view";

export const metadata = {
  title: "AI Flashcards & Exam Quizzes | GoWithStudy",
  description:
    "Active recall and spaced repetition flashcards and mock quizzes generated from your university lecture notes.",
};

export default async function FlashcardsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [decks, dashboardData] = await Promise.all([
    Promise.resolve(FlashcardService.getDecks(session.userId)),
    DashboardService.getDashboardData(session.userId, session),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <FlashcardStudyView initialDecks={decks} />
      </main>
    </div>
  );
}
