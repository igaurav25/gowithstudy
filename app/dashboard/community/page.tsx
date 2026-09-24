import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CommunityService } from "@/services/community-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { CommunityFeedView } from "@/components/community/community-feed-view";

export const metadata = {
  title: "Student Community & Doubts | CampusFlow",
  description:
    "Ask academic doubts, participate in college discussions, exchange placement tips, and learn with peers.",
};

export default async function CommunityPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Pre-fetch posts, statistics, and dashboard notifications in parallel
  const [posts, stats, dashboardData] = await Promise.all([
    CommunityService.getPosts(undefined, session.userId),
    CommunityService.getCommunityStats(),
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
        <CommunityFeedView
          initialPosts={posts}
          initialStats={stats}
          currentUserId={session.userId}
          userRole={session.role}
        />
      </main>
    </div>
  );
}
