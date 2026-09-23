"use client";

import * as React from "react";
import { InternshipApplicationItem } from "@/services/internships-service";
import { ApplicationStatus } from "@/schemas/internships";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  Send,
  Clock,
  Users,
  Trophy,
  Archive,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";

interface InternshipsKanbanBoardProps {
  applications: InternshipApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onSelectApplication: (app: InternshipApplicationItem) => void;
}

interface ColumnConfig {
  id: ApplicationStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  headerBg: string;
  badgeBg: string;
  nextStatus?: ApplicationStatus;
  nextLabel?: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "SAVED",
    title: "Wishlist",
    icon: Bookmark,
    color: "text-zinc-600 dark:text-zinc-400",
    headerBg: "border-zinc-300 dark:border-zinc-700",
    badgeBg: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    nextStatus: "APPLIED",
    nextLabel: "Apply",
  },
  {
    id: "APPLIED",
    title: "Applied",
    icon: Send,
    color: "text-sky-600 dark:text-sky-400",
    headerBg: "border-sky-500/50",
    badgeBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    nextStatus: "OA_SCHEDULED",
    nextLabel: "OA Link",
  },
  {
    id: "OA_SCHEDULED",
    title: "OA Scheduled",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    headerBg: "border-amber-500/50",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    nextStatus: "INTERVIEW",
    nextLabel: "Interview",
  },
  {
    id: "INTERVIEW",
    title: "Interviewing",
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    headerBg: "border-purple-500/50",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    nextStatus: "OFFER",
    nextLabel: "Got Offer!",
  },
  {
    id: "OFFER",
    title: "Offer Received",
    icon: Trophy,
    color: "text-emerald-600 dark:text-emerald-400",
    headerBg: "border-emerald-500/60",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    id: "REJECTED",
    title: "Archived",
    icon: Archive,
    color: "text-zinc-500",
    headerBg: "border-zinc-200 dark:border-zinc-800",
    badgeBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
];

export function InternshipsKanbanBoard({
  applications,
  onStatusChange,
  onSelectApplication,
}: InternshipsKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const colApps = applications.filter((a) => a.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-zinc-100/60 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 min-h-[500px] overflow-hidden"
          >
            {/* Column Header */}
            <div
              className={`p-3.5 border-b bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm flex items-center justify-between ${col.headerBg}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {col.title}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
              >
                {colApps.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[750px]">
              {colApps.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 dark:text-zinc-600 text-xs italic">
                  No applications
                </div>
              ) : (
                colApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer space-y-2.5 group relative"
                  >
                    {/* Top Row: Company Name & Work Mode */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {app.company}
                        </h4>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {app.role}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase px-1.5 py-0 font-semibold shrink-0"
                      >
                        {app.workMode}
                      </Badge>
                    </div>

                    {/* Meta Row: Stipend & Location */}
                    <div className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {app.stipendOrSalary && (
                        <div className="flex items-center gap-1 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          <span className="truncate">{app.stipendOrSalary}</span>
                        </div>
                      )}
                      {app.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{app.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer: Date & Fast Forward Action */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.applicationDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Quick Move Next Arrow */}
                      {col.nextStatus && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(app.id, col.nextStatus!);
                          }}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1 transition-all"
                          title={`Move to ${col.nextLabel}`}
                        >
                          <span>{col.nextLabel}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
