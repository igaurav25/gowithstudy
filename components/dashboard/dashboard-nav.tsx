import Link from "next/link";
import { siteConfig } from "@/config/site";
import { UserSessionPayload } from "@/lib/rbac";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationsDrawer } from "@/components/dashboard/notifications-drawer";
import { StudentNotificationItem } from "@/services/dashboard-service";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  CheckSquare,
  Sparkles,
  Code2,
  Briefcase,
  Users2,
  Rocket,
  ShieldCheck,
  Building2,
  Search,
  Bot,
} from "lucide-react";

export function DashboardNav({
  session,
  notifications,
}: {
  session: UserSessionPayload;
  notifications: StudentNotificationItem[];
}) {
  const isAdminOrMod = session.role === "ADMIN" || session.role === "MODERATOR";

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Ask AI", href: "/dashboard/search", icon: Search },
    { label: "AI Tutor", href: "/dashboard/tutor", icon: Bot },
    { label: "AI Copilot", href: "/dashboard/ai", icon: Sparkles },
    { label: "Notes", href: "/dashboard/notes", icon: FileText },
    { label: "Syllabus", href: "/dashboard/syllabus", icon: BookOpen },
    { label: "Timetable", href: "/dashboard/timetable", icon: Calendar },
    { label: "Assignments", href: "/dashboard/assignments", icon: CheckSquare },
    { label: "DSA", href: "/dashboard/placement", icon: Code2 },
    { label: "Internships", href: "/dashboard/internships", icon: Briefcase },
    { label: "Community", href: "/dashboard/community", icon: Users2 },
    { label: "Projects", href: "/dashboard/projects", icon: Rocket },
    { label: "University", href: "/dashboard/college-info", icon: Building2 },
    ...(isAdminOrMod ? [{ label: "Admin", href: "/dashboard/admin", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Tag */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              {siteConfig.name}
            </span>
          </Link>
          <Badge variant="purple" className="text-[10px] hidden sm:inline-flex">
            {session.role}
          </Badge>
        </div>

        {/* Desktop Quick Submenu */}
        <nav aria-label="Main Application Navigation" className="hidden lg:flex items-center gap-5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/search"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 text-xs text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium">Ask AI</span>
          </Link>
          <ThemeToggle />
          <NotificationsDrawer initialNotifications={notifications} />

          {/* Profile Quick Pill */}
          <Link href="/dashboard/profile" aria-label={`View ${session.name}'s profile`}>
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                {session.name[0]}
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hidden sm:inline-block max-w-[100px] truncate">
                {session.name}
              </span>
            </div>
          </Link>

          <form action={logoutAction}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              aria-label="Log out of CampusFlow"
              title="Log out of account"
              className="p-2 h-9 w-9 text-zinc-500 hover:text-rose-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
