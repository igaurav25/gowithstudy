import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UniversalSearchView } from "@/components/search/universal-search-view";

export const metadata = {
  title: "Universal AI Search & Ask Anything | CampusFlow",
  description:
    "Ask conversational questions across your courses, university notices, and live authoritative web sources with full citations.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const initialQuery = (resolvedParams?.q as string) || "";
  const targetNoteId = (resolvedParams?.noteId as string) || "ALL";

  const dashboardData = await DashboardService.getDashboardData(session.userId);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-16 flex flex-col">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col justify-start">
        <UniversalSearchView initialQuery={initialQuery} targetNoteId={targetNoteId} />
      </main>
    </div>
  );
}
