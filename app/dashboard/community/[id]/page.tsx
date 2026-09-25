import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CommunityService } from "@/services/community-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PostDetailClientView } from "@/components/community/post-detail-client-view";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await CommunityService.getPostById(id);
  if (!post) {
    return { title: "Discussion Not Found | GoWithStudy" };
  }
  return {
    title: `${post.title} | GoWithStudy Community`,
    description: post.content.slice(0, 150),
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/community/${id}`);
  }

  const [post, dashboardData] = await Promise.all([
    CommunityService.getPostById(id, session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PostDetailClientView
          initialPost={post}
          currentUserId={session.userId}
          userRole={session.role}
        />
      </main>
    </div>
  );
}
