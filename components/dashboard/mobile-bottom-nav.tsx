"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Calendar,
  Briefcase,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const primaryTabs = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Notes",
      href: "/dashboard/notes",
      icon: FileText,
      isActive: pathname.startsWith("/dashboard/notes"),
    },
    {
      label: "AI Study",
      href: "/dashboard/tutor",
      icon: Bot,
      isActive:
        pathname.startsWith("/dashboard/tutor") ||
        pathname.startsWith("/dashboard/ai") ||
        pathname.startsWith("/dashboard/search"),
    },
    {
      label: "Timetable",
      href: "/dashboard/timetable",
      icon: Calendar,
      isActive: pathname.startsWith("/dashboard/timetable"),
    },
    {
      label: "Jobs",
      href: "/dashboard/internships",
      icon: Briefcase,
      isActive:
        pathname.startsWith("/dashboard/internships") ||
        pathname.startsWith("/dashboard/placement"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg shadow-lg"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-w-[56px] py-1 transition-all rounded-xl touch-manipulation",
                active
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-normal"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/60 scale-105"
                    : "bg-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
