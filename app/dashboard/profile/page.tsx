import { getSession } from "@/lib/auth";
import { ProfileService } from "@/services/profile-service";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await ProfileService.getProfile(session.userId);
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Student Profile & Account Settings
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full focus:outline-none">
        <ProfileEditor initialData={profile} />
      </main>
    </div>
  );
}
