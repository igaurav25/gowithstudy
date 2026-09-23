"use client";

import * as React from "react";
import { AssignmentsStats } from "@/services/assignments-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface AssignmentsHeaderProps {
  stats: AssignmentsStats;
  onOpenAdd: () => void;
}

export function AssignmentsHeader({ stats, onOpenAdd }: AssignmentsHeaderProps) {
  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: CheckSquare,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/40",
    },
    {
      label: "Pending / In Progress",
      value: stats.pending + stats.inProgress,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Assignments & Project Tasks
            </h1>
            <Badge variant="purple" className="text-xs">
              {stats.pending + stats.inProgress} Active Deadlines
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Never miss an academic submission. Track priorities, due dates, and mark coursework complete with one click.
          </p>
        </div>

        <Button
          onClick={onOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 h-9 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-2xl border ${card.bg} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-2">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
