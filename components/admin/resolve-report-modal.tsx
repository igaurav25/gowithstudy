"use client";

import * as React from "react";
import { X, ShieldAlert, Loader2, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModerationReportItem } from "@/services/admin-service";
import { ReportActionTaken, ResolveReportInput } from "@/schemas/admin";

interface ResolveReportModalProps {
  report: ModerationReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ResolveReportInput) => Promise<void>;
}

export function ResolveReportModal({
  report,
  isOpen,
  onClose,
  onSubmit,
}: ResolveReportModalProps) {
  const [status, setStatus] = React.useState<"RESOLVED" | "REJECTED">("RESOLVED");
  const [actionTaken, setActionTaken] = React.useState<ReportActionTaken>("DELETE_CONTENT");
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      setError("Please provide a brief moderation resolution note.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        reportId: report.id,
        status,
        actionTaken,
        resolutionNote: resolutionNote.trim(),
      });
      setResolutionNote("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resolve report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Resolve Moderation Report
              </h3>
              <p className="text-xs text-zinc-500">
                Review flagged student content and record moderation audit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flagged Item Details Card */}
        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Flagged {report.entityType}
            </span>
            <Badge variant="destructive" className="text-[10px]">
              {report.reason}
            </Badge>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {report.entityTitle}
          </p>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
            &ldquo;{report.entitySnippet}&rdquo;
          </p>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>Reported by: {report.reporterName}</span>
            <span>Reason: {report.description || "Violation of campus guidelines"}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resolution Outcome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Moderation Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "RESOLVED" | "REJECTED")}
                className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="RESOLVED">Resolved (Action Taken)</option>
                <option value="REJECTED">Rejected (False Report)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Action Taken
              </label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value as ReportActionTaken)}
                className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DELETE_CONTENT">Delete Content</option>
                <option value="WARN_USER">Issue Warning to Author</option>
                <option value="SUSPEND_USER">Suspend User Account</option>
                <option value="DISMISS">Dismiss Without Penalty</option>
              </select>
            </div>
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Audit Resolution Note *
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Explain rationale for moderation audit log (e.g. Content violated academic honesty policy)..."
              rows={3}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Resolution</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
