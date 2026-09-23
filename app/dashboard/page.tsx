import { getSession } from "@/lib/auth";
import { logoutAction, logoutAllDevicesAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  LogOut,
  ShieldAlert,
  UserCheck,
  Building,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Dashboard Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                CampusFlow
              </span>
            </Link>
            <Badge variant="purple" className="text-[11px] ml-2">
              Role: {session.role}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span>Log Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-sky-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Authenticated Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back, {session.name}!
            </h1>
            <p className="mt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {session.college || "University Student"} • {session.course || "B.Tech"} in {session.branch || "CSE"} • Year {session.year || 3}, Sem {session.semester || 6}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <form action={logoutAllDevicesAction}>
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-rose-600" type="submit">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                <span>Revoke All Other Devices</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Phase 3 Auth Verification Card */}
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Session & Security Telemetry</CardTitle>
              <Badge variant="success">HttpOnly Cookie Protected</Badge>
            </div>
            <CardDescription>
              Verified server-side session payload extracted from cryptographically signed cookie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">User ID</span>
                <p className="mt-1 text-sm font-mono text-zinc-900 dark:text-zinc-100">{session.userId}</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</span>
                <p className="mt-1 text-sm font-mono text-zinc-900 dark:text-zinc-100">{session.email}</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Role</span>
                <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">{session.role}</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Session Key</span>
                <p className="mt-1 text-xs font-mono text-zinc-500 truncate">{session.sessionId}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between text-xs">
              <span className="text-indigo-900 dark:text-indigo-300 font-medium">
                Phase 3 (Authentication & Account Security) complete. Ready for Phase 4 (Database & Prisma Models).
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Phase 4 Ready →</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
