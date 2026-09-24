"use client";

import * as React from "react";
import { X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECT_TYPES, ProjectType, CreateProjectInput } from "@/schemas/projects";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<{ success: boolean; error?: string }>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [title, setTitle] = React.useState("");
  const [projectType, setProjectType] = React.useState<ProjectType>("HACKATHON");
  const [targetTeamSize, setTargetTeamSize] = React.useState(4);
  const [rolesNeededInput, setRolesNeededInput] = React.useState("");
  const [techStackInput, setTechStackInput] = React.useState("");
  const [requiredSkillsInput, setRequiredSkillsInput] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [contactInfo, setContactInfo] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rolesNeeded = rolesNeededInput
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const requiredSkills = requiredSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rolesNeeded.length === 0) {
      setError("Please specify at least one role needed (e.g. Frontend Developer)");
      return;
    }

    if (techStack.length === 0) {
      setError("Please specify at least one technology (e.g. Next.js, Python)");
      return;
    }

    setLoading(true);
    try {
      const res = await onSubmit({
        title,
        projectType,
        targetTeamSize,
        rolesNeeded,
        techStack,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : techStack,
        description,
        deadline: deadline ? deadline : null,
        githubUrl: githubUrl.trim() ? githubUrl.trim() : null,
        contactInfo: contactInfo.trim() ? contactInfo.trim() : null,
        status: "RECRUITING",
      });

      if (res.success) {
        setTitle("");
        setDescription("");
        setRolesNeededInput("");
        setTechStackInput("");
        setRequiredSkillsInput("");
        setDeadline("");
        setGithubUrl("");
        setContactInfo("");
        onClose();
      } else {
        setError(res.error || "Failed to publish project listing");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish project listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Create Project & Find Teammates
              </h3>
              <p className="text-xs text-zinc-500">
                Publish a recruiting listing for hackathons, capstones, or open-source projects
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart India Hackathon: Agentic Campus Study Booking"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Project Type & Target Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Project Category *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Target Team Capacity *
              </label>
              <input
                type="number"
                min={2}
                max={10}
                required
                value={targetTeamSize}
                onChange={(e) => setTargetTeamSize(parseInt(e.target.value) || 2)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Roles Needed */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Open Roles Needed (Comma separated) *
            </label>
            <input
              type="text"
              required
              value={rolesNeededInput}
              onChange={(e) => setRolesNeededInput(e.target.value)}
              placeholder="e.g. Frontend UI/UX (Next.js), AI / PyTorch Engineer, IoT Specialist"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Tech Stack & Required Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Technology Stack (Comma separated) *
              </label>
              <input
                type="text"
                required
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="Next.js, FastAPI, PostgreSQL, Gemini"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Required Skills
              </label>
              <input
                type="text"
                value={requiredSkillsInput}
                onChange={(e) => setRequiredSkillsInput(e.target.value)}
                placeholder="React, REST APIs, Python, Docker"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Project Description & Goals *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem you are solving, current project progress, hackathon submission milestones, and what you expect from collaborators..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
            />
          </div>

          {/* Deadline, GitHub URL, Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Submission Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                GitHub Repository
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contact Handle / Channel
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Discord: @handle, Telegram"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
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
              disabled={loading || title.trim().length < 3 || description.trim().length < 10}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Publish Listing</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
