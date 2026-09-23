"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AssignmentPriority,
  ASSIGNMENT_PRIORITIES,
  CreateAssignmentInput,
} from "@/schemas/assignments";
import { STANDARD_CSE_SUBJECTS } from "@/schemas/notes";
import {
  CheckSquare,
  X,
  Calendar,
  AlertTriangle,
  Clock,
  Check,
  Loader2,
} from "lucide-react";

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssignmentInput) => Promise<boolean>;
}

export function AddAssignmentModal({
  isOpen,
  onClose,
  onSubmit,
}: AddAssignmentModalProps) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState<string>(STANDARD_CSE_SUBJECTS[0]);
  const [isCustomSubject, setIsCustomSubject] = React.useState(false);
  const [customSubject, setCustomSubject] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [priority, setPriority] = React.useState<AssignmentPriority>("MEDIUM");
  const [description, setDescription] = React.useState("");
  const [attachmentUrl, setAttachmentUrl] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const activeSubject = isCustomSubject ? customSubject.trim() : subject;
    if (!activeSubject) {
      setSubmitError("Please select or enter a subject name.");
      return;
    }

    if (!dueDate) {
      setSubmitError("Please specify a due date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAssignmentInput = {
        title: title.trim(),
        subject: activeSubject,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status: "PENDING",
        description: description.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
      };

      const success = await onSubmit(payload);
      if (success) {
        setTitle("");
        setDescription("");
        setAttachmentUrl("");
        setDueDate("");
        onClose();
      } else {
        setSubmitError("Failed to save assignment. Please check inputs.");
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Add Academic Assignment
              </h2>
              <p className="text-xs text-zinc-500">
                Track coursework deadlines and project submissions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {submitError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Normalization Report & BCNF Decomposition"
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Subject & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Subject */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSubject(!isCustomSubject)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isCustomSubject ? "Pick standard" : "Custom"}
                </button>
              </div>

              {isCustomSubject ? (
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Subject name..."
                  className="h-10 text-xs rounded-xl"
                />
              ) : (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Select course subject"
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STANDARD_CSE_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                aria-label="Select priority level"
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="URGENT">🚨 Urgent (Due in 24-48h)</option>
                <option value="HIGH">⚡ High Priority</option>
                <option value="MEDIUM">📌 Medium Priority</option>
                <option value="LOW">☕ Low Priority</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Due Date & Time <span className="text-rose-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Description / Instructions (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Submission guidelines, lab problem statement, or team requirements..."
              className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-md shadow-indigo-500/20 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Assignment</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
