"use client";

import * as React from "react";
import { Users2, UserCheck, Trophy, Send } from "lucide-react";
import { ProjectStats } from "@/services/projects-service";

interface ProjectsStatsBarProps {
  stats: ProjectStats;
}

export function ProjectsStatsBar({ stats }: ProjectsStatsBarProps) {
  const cards = [
    {
      title: "Recruiting Teams",
      value: stats.recruitingCount,
      subtitle: "Actively seeking members",
      icon: Users2,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      title: "Open Teammate Roles",
      value: stats.openRolesCount,
      subtitle: "Frontend, ML, IoT & Backend",
      icon: UserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      title: "Hackathon Teams",
      value: stats.hackathonTeams,
      subtitle: "SIH & collegiate hackathons",
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
    {
      title: "Applications Tracked",
      value: stats.myApplicationsCount,
      subtitle: "Join requests submitted",
      icon: Send,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10 dark:bg-violet-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {c.title}
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {c.value}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                {c.subtitle}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
