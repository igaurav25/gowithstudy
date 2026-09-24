import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CollegeInfoService } from "@/services/college-info-service";
import { DashboardService } from "@/services/dashboard-service";
import { ProfileService } from "@/services/profile-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { CollegeInfoClientView } from "@/components/college-info/college-info-client-view";

export const metadata = {
  title: "College-Specific Verified Information | CampusFlow",
  description:
    "Official university source of truth for academic circulars, exam schedules, fee concessions, and capstone guidelines.",
};

export default async function CollegeInfoPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Pre-fetch college data and user profile
  const [colleges, userProfile, dashboardData] = await Promise.all([
    CollegeInfoService.getColleges(),
    ProfileService.getProfile(session.userId),
    DashboardService.getDashboardData(session.userId),
  ]);

  // Determine user's active college code (e.g. DTU if student is from Delhi Technological University)
  let initialCollegeCode = "DTU";
  if (userProfile?.college) {
    const colName = userProfile.college.toLowerCase();
    const matched = colleges.find(
      (c) =>
        c.code.toLowerCase() === colName ||
        c.name.toLowerCase().includes(colName) ||
        colName.includes(c.code.toLowerCase())
    );
    if (matched) {
      initialCollegeCode = matched.code;
    }
  }

  const [initialNotices, initialStats] = await Promise.all([
    CollegeInfoService.getCollegeInfo({ collegeCode: initialCollegeCode }),
    CollegeInfoService.getCollegeStats(initialCollegeCode),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <DashboardNav
        session={session}
        notifications={dashboardData?.notifications || []}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Suspense
          fallback={
            <div className="space-y-6 animate-pulse">
              <div className="h-44 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-24 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
                <div className="h-24 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
                <div className="h-24 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
                <div className="h-24 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
              </div>
              <div className="h-32 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
              <div className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
            </div>
          }
        >
          <CollegeInfoClientView
            initialColleges={colleges}
            initialNotices={initialNotices}
            initialStats={initialStats}
            currentCollegeCode={initialCollegeCode}
            userRole={session.role}
            userCollege={userProfile?.college}
          />
        </Suspense>
      </main>
    </div>
  );
}
