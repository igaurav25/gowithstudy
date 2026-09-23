"use client";

import * as React from "react";
import { AssignmentItem } from "@/services/assignments-service";
import { AssignmentPriority } from "@/schemas/assignments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Trash2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface AssignmentCardProps {
  assignment: AssignmentItem;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  onToggleStatus,
  onDelete,
}: AssignmentCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const isCompleted = assignment.status === "COMPLETED";
  const isOverdue = assignment.dueDays < 0 && !isCompleted;

  const getPriorityBadge = (p: AssignmentPriority) => {
    switch (p) {
      case "URGENT":
        return {
          variant: "destructive" as const,
          label: "Urgent",
          icon: AlertTriangle,
        };
      case "HIGH":
        return {
          variant: "warning" as const,
          label: "High Priority",
          icon: Clock,
        };
      case "MEDIUM":
        return {
          variant: "secondary" as const,
          label: "Medium",
          icon: Clock,
        };
      case "LOW":
      default:
        return {
          variant: "outline" as const,
          label: "Low Priority",
          icon: Clock,
        };
    }
  };

  const priorityInfo = getPriorityBadge(assignment.priority);
  const PriorityIcon = priorityInfo.icon;

  const formattedDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between gap-3 ${
        isCompleted
          ? "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70"
          : isOverdue
          ? "border-rose-400 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm"
          : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm hover:border-indigo-500/50 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Complete Button */}
        <button
          type="button"
          onClick={() => onToggleStatus(assignment.id)}
          aria-label={isCompleted ? "Mark pending" : "Mark completed"}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent hover:text-zinc-400"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {assignment.subject}
            </span>

            <Badge variant={priorityInfo.variant} className="text-[10px] py-0">
              <PriorityIcon className="w-3 h-3 mr-1" />
              {priorityInfo.label}
            </Badge>

            {/* Due date countdown tag */}
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isCompleted
                  ? "text-zinc-400 line-through"
                  : isOverdue
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : assignment.dueDays <= 1
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-zinc-500"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {assignment.dueLabel}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug ${
              isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : ""
            }`}
          >
            {assignment.title}
          </h3>

          {/* Description */}
          {assignment.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}

          {/* Attachment reference */}
          {assignment.attachmentUrl && (
            <div className="pt-1">
              <a
                href={assignment.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <FileText className="w-3 h-3" />
                <span>Reference Course Material</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer info & delete */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <span>Due date: {formattedDate}</span>

        {showConfirmDelete ? (
          <div className="flex items-center gap-1 animate-in fade-in">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 text-[10px] px-2"
              onClick={() => onDelete(assignment.id)}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-1.5"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Delete assignment"
            className="text-zinc-400 hover:text-rose-500 p-1 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
