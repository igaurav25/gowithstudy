"use client";

import * as React from "react";
import { UpcomingAssignmentItem } from "@/services/dashboard-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function AssignmentsWidget({
  initialAssignments,
}: {
  initialAssignments: UpcomingAssignmentItem[];
}) {
  const [assignments, setAssignments] = React.useState(initialAssignments);

  const toggleComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const priorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "purple";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Upcoming Assignments</CardTitle>
              <CardDescription className="text-xs">
                Deadlines and submission checklists
              </CardDescription>
            </div>
          </div>
          <Badge variant="warning" className="text-[11px]">
            {assignments.filter((a) => !a.completed).length} Pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {assignments.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              No assignments yet.
            </p>
            <p className="mt-1">Add your first assignment to start tracking deadlines.</p>
          </div>
        ) : (
          assignments.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                item.completed
                  ? "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/30 opacity-60"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleComplete(item.id)}
                className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                  item.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500"
                }`}
                aria-label="Toggle completed"
              >
                {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`font-semibold text-xs sm:text-sm truncate ${
                      item.completed
                        ? "line-through text-zinc-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <Badge
                    variant={priorityVariant(item.priority) as "destructive" | "warning" | "purple" | "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {item.priority}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {item.subject}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-3 h-3" />
                    Due {item.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="pt-2 text-right">
          <Link
            href="/dashboard/assignments"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage All Assignments →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
