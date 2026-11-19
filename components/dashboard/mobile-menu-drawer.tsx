"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserSessionPayload } from "@/lib/rbac";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  CheckSquare,
  Bot,
  Search,
  Sparkles,
  Code2,
  Briefcase,
  Users2,
  Rocket,
  Building2,
  User,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Award,
} from "lucide-react";

interface MobileMenuDrawerProps {
  session: UserSessionPayload;
}

export function MobileMenuDrawer({ session }: MobileMenuDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const handleClose = () => setIsOpen(false);

  // Lock background scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isAdminOrMod = session.role === "ADMIN" || session.role === "MODERATOR";

  const categories = [
    {
      title: "Academic Hub",
      links: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Lecture Notes", href: "/dashboard/notes", icon: FileText },
        { label: "PYQs (Exam Papers)", href: "/dashboard/pyqs", icon: Award },
        { label: "Syllabus Tracker", href: "/dashboard/syllabus", icon: BookOpen },
        { label: "Weekly Timetable", href: "/dashboard/timetable", icon: Calendar },
        { label: "Attendance & 75% Guard", href: "/dashboard/attendance", icon: ShieldCheck },
        { label: "Assignments & Deadlines", href: "/dashboard/assignments", icon: CheckSquare },
      ],
    },
    {
      title: "AI Study Tools",
      links: [
        { label: "AI Tutor & Practice", href: "/dashboard/tutor", icon: Bot },
        { label: "Ask AI Search", href: "/dashboard/search", icon: Search },
        { label: "AI Copilot Workspace", href: "/dashboard/ai", icon: Sparkles },
      ],
    },
    {
      title: "Placement & Career",
      links: [
        { label: "DSA Tracker (SDE Sheets)", href: "/dashboard/placement", icon: Code2 },
        { label: "Internship & Job Pipeline", href: "/dashboard/internships", icon: Briefcase },
      ],
    },
    {
      title: "Campus Life",
      links: [
        { label: "Student Community", href: "/dashboard/community", icon: Users2 },
        { label: "Project Team Finder", href: "/dashboard/projects", icon: Rocket },
        { label: "College Notices & Info", href: "/dashboard/college-info", icon: Building2 },
      ],
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Drawer Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="w-9 h-9 p-0 text-zinc-700 dark:text-zinc-200"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                {session.name}
              </p>
              <p className="text-[10px] text-zinc-500">{session.role} Account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                {cat.title}
              </h4>
              <div className="space-y-0.5">
                {cat.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={handleClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation min-h-[44px]",
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Section (if privileged) */}
          {isAdminOrMod && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                Platform Governance
              </h4>
              <Link
                href="/dashboard/admin"
                onClick={handleClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === "/dashboard/admin"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Admin Console</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Link
            href="/dashboard/profile"
            onClick={handleClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px]"
          >
            <User className="w-4 h-4 text-zinc-500" />
            <span>My Profile & Settings</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
