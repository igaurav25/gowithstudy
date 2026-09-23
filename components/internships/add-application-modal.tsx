"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreateInternshipInput,
  ApplicationStatus,
  JobType,
  WorkMode,
  APPLICATION_STATUSES,
  JOB_TYPES,
  WORK_MODES,
} from "@/schemas/internships";
import { X, Briefcase, PlusCircle, AlertCircle } from "lucide-react";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInternshipInput) => Promise<boolean>;
}

export function AddApplicationModal({
  isOpen,
  onClose,
  onSubmit,
}: AddApplicationModalProps) {
  const [company, setCompany] = React.useState("");
  const [role, setRole] = React.useState("");
  const [jobType, setJobType] = React.useState<JobType>("INTERNSHIP");
  const [workMode, setWorkMode] = React.useState<WorkMode>("HYBRID");
  const [location, setLocation] = React.useState("");
  const [jobUrl, setJobUrl] = React.useState("");
  const [stipendOrSalary, setStipendOrSalary] = React.useState("");
  const [status, setStatus] = React.useState<ApplicationStatus>("APPLIED");
  const [deadline, setDeadline] = React.useState("");
  const [referralName, setReferralName] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setErrorMsg("Please specify both company name and role title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await onSubmit({
      company: company.trim(),
      role: role.trim(),
      jobType,
      workMode,
      location: location.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      stipendOrSalary: stipendOrSalary.trim() || undefined,
      status,
      deadline: deadline ? deadline : undefined,
      referralName: referralName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setCompany("");
      setRole("");
      setLocation("");
      setJobUrl("");
      setStipendOrSalary("");
      setReferralName("");
      setNotes("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Track New Job / Internship
              </h2>
              <p className="text-xs text-zinc-500">
                Add an opportunity to your campus placement pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Company Name *
              </label>
              <Input
                required
                placeholder="e.g. Google, Microsoft, Uber"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Role Title *
              </label>
              <Input
                required
                placeholder="e.g. SDE Summer Intern 2027"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Job Type, Work Mode & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {JOB_TYPES.map((jt) => (
                  <option key={jt} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {WORK_MODES.map((wm) => (
                  <option key={wm} value={wm}>
                    {wm}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Current Pipeline Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="SAVED">Wishlist / Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="OA_SCHEDULED">OA Scheduled</option>
                <option value="INTERVIEW">Interviewing</option>
                <option value="OFFER">Offer Received</option>
                <option value="REJECTED">Archived</option>
              </select>
            </div>
          </div>

          {/* Stipend, Location & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Stipend / CTC
              </label>
              <Input
                placeholder="e.g. ₹1,00,000 / mo"
                value={stipendOrSalary}
                onChange={(e) => setStipendOrSalary(e.target.value)}
                className="text-xs h-10 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <Input
                placeholder="e.g. Bengaluru, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Deadline (optional)
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>
          </div>

          {/* URL & Referral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Job Posting URL
              </label>
              <Input
                type="url"
                placeholder="https://company.com/jobs/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Referral / Source
              </label>
              <Input
                placeholder="e.g. Senior Alum, LinkedIn, Career Fair"
                value={referralName}
                onChange={(e) => setReferralName(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Notes & Interview Updates
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Online Assessment completed. Technical round scheduled for Friday on Google Meet..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs rounded-xl bg-sky-600 hover:bg-sky-700 text-white gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Adding..." : "Add to Pipeline"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
