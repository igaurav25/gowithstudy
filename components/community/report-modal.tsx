"use client";

import * as React from "react";
import { X, Flag, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_REASONS, ReportReason, ReportContentInput } from "@/schemas/community";
import { reportContentAction } from "@/features/community/actions";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "POST" | "COMMENT";
  entityId: string;
  entityTitle: string;
}

const REASON_LABELS: Record<ReportReason, { title: string; desc: string }> = {
  SPAM: {
    title: "Spam or Promotion",
    desc: "Unsolicited advertising, repetitive content, or automated messages.",
  },
  HARASSMENT: {
    title: "Harassment or Hate Speech",
    desc: "Personal attacks, bullying, discrimination, or abusive language.",
  },
  INAPPROPRIATE: {
    title: "Inappropriate Content",
    desc: "Offensive, vulgar, or unsuited for an academic community.",
  },
  MISINFORMATION: {
    title: "Academic Misinformation",
    desc: "Deliberately misleading exam dates, wrong formulas, or fake notices.",
  },
  PLAGIARISM: {
    title: "Plagiarism or Honor Code Breach",
    desc: "Unauthorized test leaks, copyright infringement, or homework cheating.",
  },
  OTHER: {
    title: "Other Community Breach",
    desc: "Other behavior violating campus community safety.",
  },
};

export function ReportModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
}: ReportModalProps) {
  const [reason, setReason] = React.useState<ReportReason>("SPAM");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await reportContentAction({
        entityType,
        entityId,
        reason,
        description: description.trim() || undefined,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setDescription("");
          onClose();
        }, 1800);
      } else {
        setError(res.error || "Failed to submit report");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Report Content
              </h3>
              <p className="text-xs text-zinc-500">
                Help maintain a safe and respectful student forum
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Report Submitted
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Thank you for keeping CampusFlow constructive. Our moderation team has been notified and will review this content.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs">
              <span className="font-semibold text-zinc-500">Flagging: </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-200 line-clamp-1">
                &ldquo;{entityTitle}&rdquo;
              </span>
            </div>

            {/* Reasons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Reason for report *
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => {
                  const info = REASON_LABELS[r];
                  const isSelected = reason === r;
                  return (
                    <label
                      key={r}
                      onClick={() => setReason(r)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r}
                        checked={isSelected}
                        onChange={() => setReason(r)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {info.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {info.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional info */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context for the moderators..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-medium"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Report</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
