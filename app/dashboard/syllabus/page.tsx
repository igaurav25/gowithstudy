import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SyllabusService } from "@/services/syllabus-service";
import { DashboardService } from "@/services/dashboard-service";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SyllabusClientView } from "@/components/syllabus/syllabus-client-view";

export const metadata = {
  title: "B.Tech CSE Syllabus & Curriculum | GoWithStudy",
  description:
    "Official semester-wise B.Tech Computer Science syllabus, unit-wise chapters, exam weightage, and prescribed reference textbooks.",
};

export default async function SyllabusPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [courses, dashboardData] = await Promise.all([
    Promise.resolve(SyllabusService.getAllCourses()),
    DashboardService.getDashboardData(session.userId),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      {/* Top Navigation */}
      <DashboardNav session={session} notifications={dashboardData?.notifications || []} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SyllabusClientView allCourses={courses} />
      </main>
    </div>
  );
}
