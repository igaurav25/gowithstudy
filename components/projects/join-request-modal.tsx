"use client";

import * as React from "react";
import { X, Send, AlertCircle, Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/services/projects-service";
import { CreateJoinRequestInput } from "@/schemas/projects";

interface JoinRequestModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateJoinRequestInput) => Promise<{ success: boolean; error?: string }>;
}

export function JoinRequestModal({
  project,
  isOpen,
  onClose,
  onSubmit,
}: JoinRequestModalProps) {
  const [roleApplied, setRoleApplied] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [portfolioOrGithub, setPortfolioOrGithub] = React.useState("");
  const [skillsInput, setSkillsInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (project?.rolesNeeded && project.rolesNeeded.length > 0) {
      setRoleApplied(project.rolesNeeded[0]);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setLoading(true);
    try {
      const res = await onSubmit({
        projectId: project.id,
        roleApplied,
        message,
        portfolioOrGithub: portfolioOrGithub.trim() ? portfolioOrGithub.trim() : null,
        skills,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMessage("");
          setPortfolioOrGithub("");
          setSkillsInput("");
          onClose();
        }, 1800);
      } else {
        setError(res.error || "Failed to send join application");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send join application");
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
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Apply to Join Team
              </h3>
              <p className="text-xs text-zinc-500">
                Send your role application & portfolio to the project owner
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

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Application Sent!
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your join request has been delivered to {project.ownerName}. You will be notified once they review your application.
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
              <span className="font-semibold text-zinc-500">Project: </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-200">
                {project.title}
              </span>
            </div>

            {/* Role Applied */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Which role are you applying for? *
              </label>
              <select
                required
                value={roleApplied}
                onChange={(e) => setRoleApplied(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {project.rolesNeeded.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivation Message */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Brief Introduction & What You Can Build *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention past hackathon experience, courses taken, or relevant projects..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* GitHub / Portfolio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                GitHub or Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioOrGithub}
                onChange={(e) => setPortfolioOrGithub(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Key Skills */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your Relevant Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Next.js, Tailwind, Docker, Python"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                disabled={loading || message.trim().length < 5}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Application</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
