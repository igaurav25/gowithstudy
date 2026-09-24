import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NotificationsService } from "@/services/notifications-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NotificationsCenterView } from "@/components/notifications/notifications-center-view";

export const metadata = {
  title: "Notification Center | CampusFlow",
  description:
    "Track assignment reminders, deadline alerts, teammate applications, and system notices.",
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [notifications, preferences, stats, dashboardData] = await Promise.all([
    NotificationsService.getNotifications(session.userId),
    NotificationsService.getPreferences(session.userId),
    NotificationsService.getNotificationStats(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 focus:outline-none">
        <Suspense fallback={<div className="h-96 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 animate-pulse" />}>
          <NotificationsCenterView
            initialNotifications={notifications}
            initialPreferences={preferences}
            initialStats={stats}
            currentUserId={session.userId}
          />
        </Suspense>
      </main>
    </div>
  );
}
