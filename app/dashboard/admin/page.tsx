import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/rbac";
import { AdminService } from "@/services/admin-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AdminClientView } from "@/components/admin/admin-client-view";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Admin & Governance Console | CampusFlow",
  description:
    "Student role management, community moderation queue, verified announcements, and system audit trail.",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Server-side authorization barrier: must be MODERATOR or ADMIN
  const isAuthorized = hasRequiredRole(session.role, "MODERATOR");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-900/90 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Access Denied (403 Forbidden)
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Campus Governance Console requires verified <span className="font-semibold text-rose-600">MODERATOR</span> or <span className="font-semibold text-rose-600">ADMIN</span> clearance. Your current role is <span className="font-bold">{session.role}</span>.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="sm" className="gap-2 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Student Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [users, reports, announcements, auditLogs, stats, dashboardData] =
    await Promise.all([
      AdminService.getUsers(session.userId),
      AdminService.getModerationQueue(session.userId),
      AdminService.getAnnouncements(session.userId),
      AdminService.getAuditLogs(session.userId),
      AdminService.getAdminOverview(session.userId),
      DashboardService.getDashboardData(session.userId),
    ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AdminClientView
          initialUsers={users}
          initialReports={reports}
          initialAnnouncements={announcements}
          initialAuditLogs={auditLogs}
          initialStats={stats}
          currentUserId={session.userId}
          currentUserRole={session.role}
        />
      </main>
    </div>
  );
}
