"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  Sparkles,
  CalendarPlus,
  PlusCircle,
  Briefcase,
  Code2,
  Users2,
  Check,
} from "lucide-react";

export function QuickActionsBar() {
  const [modalAction, setModalAction] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const actions = [
    {
      id: "upload_notes",
      label: "Upload Notes",
      icon: UploadCloud,
      color: "from-blue-500 to-indigo-600",
      description: "Upload syllabus PDF or lecture slides to your notes library.",
      href: "/dashboard/notes?action=upload",
    },
    {
      id: "ask_ai",
      label: "Ask AI",
      icon: Sparkles,
      color: "from-purple-500 to-violet-600",
      description: "Ask conceptual questions or query your uploaded course materials.",
    },
    {
      id: "add_assignment",
      label: "Add Assignment",
      icon: PlusCircle,
      color: "from-amber-500 to-orange-600",
      description: "Set an assignment deadline with priority and subject tags.",
    },
    {
      id: "add_class",
      label: "Add Class",
      icon: CalendarPlus,
      color: "from-emerald-500 to-teal-600",
      description: "Add a recurring class lecture or lab to your weekly timetable.",
    },
    {
      id: "track_app",
      label: "Track Job",
      icon: Briefcase,
      color: "from-sky-500 to-blue-600",
      description: "Add a company internship or full-time application to your pipeline.",
    },
    {
      id: "add_dsa",
      label: "Add DSA Problem",
      icon: Code2,
      color: "from-rose-500 to-pink-600",
      description: "Log a LeetCode or GFG problem to your practice revision queue.",
    },
    {
      id: "find_team",
      label: "Find Team",
      icon: Users2,
      color: "from-indigo-500 to-purple-600",
      description: "Browse or publish hackathon & project teammate requests.",
    },
  ];

  const handleActionClick = (actionId: string, label: string) => {
    setModalAction(actionId);
    setSuccessMsg(`Action Triggered: "${label}" dialog opened.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Student Quick Actions
        </h3>
        {successMsg && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            {successMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const buttonContent = (
            <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer w-full h-full">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-gradient-to-tr group-hover:text-white transition-all flex items-center justify-center group-hover:scale-105">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {act.label}
              </span>
            </div>
          );

          if (act.href) {
            return (
              <Link key={act.id} href={act.href} className="block">
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => handleActionClick(act.id, act.label)}
              className="text-left w-full h-full"
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
