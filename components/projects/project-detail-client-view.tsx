"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  Calendar,
  GitBranch,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  Check,
  Ban,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/services/projects-service";
import { ProjectType, CreateJoinRequestInput } from "@/schemas/projects";
import { JoinRequestModal } from "@/components/projects/join-request-modal";
import {
  deleteProjectAction,
  respondJoinRequestAction,
  sendJoinRequestAction,
} from "@/features/projects/actions";

interface ProjectDetailClientViewProps {
  initialProject: ProjectItem;
  currentUserId: string;
  userRole?: string;
}

const TYPE_CONFIG: Record<
  ProjectType,
  { label: string; badgeVariant: "purple" | "success" | "warning" | "destructive" | "secondary" | "outline" | "default" }
> = {
  HACKATHON: { label: "Hackathon", badgeVariant: "purple" },
  CAPSTONE: { label: "Capstone", badgeVariant: "default" },
  OPEN_SOURCE: { label: "Open Source", badgeVariant: "success" },
  RESEARCH: { label: "Research", badgeVariant: "secondary" },
  STARTUP: { label: "Startup", badgeVariant: "warning" },
  PRACTICE: { label: "Practice", badgeVariant: "outline" },
};

function formatDeadline(deadline: Date | string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Deadline passed";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays} days (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
}

export function ProjectDetailClientView({
  initialProject,
  currentUserId,
  userRole = "USER",
}: ProjectDetailClientViewProps) {
  const router = useRouter();
  const [project, setProject] = React.useState<ProjectItem>(initialProject);
  const [isApplyOpen, setIsApplyOpen] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const isOwner = project.ownerId === currentUserId;
  const isMember = project.members.some((m) => m.userId === currentUserId);
  const hasApplied = project.hasApplied;
  const spotsLeft = Math.max(0, project.targetTeamSize - project.currentTeamSize);
  const percentFilled = Math.min(
    100,
    Math.round((project.currentTeamSize / project.targetTeamSize) * 100)
  );
  const deadlineText = formatDeadline(project.deadline);
  const typeCfg = TYPE_CONFIG[project.projectType] || {
    label: project.projectType,
    badgeVariant: "secondary",
  };

  const pendingRequests = (project.joinRequests || []).filter(
    (r) => r.status === "PENDING"
  );

  // Apply handler
  const handleSendJoinRequest = async (input: CreateJoinRequestInput) => {
    const res = await sendJoinRequestAction(input);
    if (res.success) {
      setProject((prev) => ({ ...prev, hasApplied: true }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Respond handler for owner
  const handleRespond = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    setProcessingId(requestId);
    try {
      const res = await respondJoinRequestAction({ requestId, status });
      if (res.success) {
        const updatedRequests = (project.joinRequests || []).map((r) =>
          r.id === requestId ? { ...r, status } : r
        );
        let updatedMembers = [...project.members];
        let updatedSize = project.currentTeamSize;

        if (status === "ACCEPTED") {
          const req = project.joinRequests?.find((r) => r.id === requestId);
          if (req) {
            updatedMembers.push({
              id: `mem_${Date.now()}`,
              projectId: project.id,
              userId: req.userId,
              name: req.name,
              avatar: req.avatar,
              role: req.roleApplied,
              joinedAt: new Date(),
            });
            updatedSize += 1;
          }
        }

        setProject((prev) => ({
          ...prev,
          joinRequests: updatedRequests,
          members: updatedMembers,
          currentTeamSize: updatedSize,
          status: updatedSize >= project.targetTeamSize ? "IN_PROGRESS" : project.status,
        }));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Delete project handler
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project listing?")) return;
    const res = await deleteProjectAction(project.id);
    if (res.success) {
      router.push("/dashboard/projects");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>
      </div>

      {/* Main Project Card */}
      <article className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {project.ownerName ? project.ownerName[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                  {project.ownerName}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {project.ownerBranch}
                </span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={typeCfg.badgeVariant} className="text-xs">
              {typeCfg.label}
            </Badge>

            {project.status === "RECRUITING" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Recruiting ({spotsLeft} spots)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {project.status}
              </span>
            )}

            {(isOwner || userRole === "ADMIN") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 px-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
          {project.title}
        </h1>

        {/* Team Capacity Progress Bar */}
        <div className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-indigo-500" />
              Team Formation Progress
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {project.currentTeamSize} of {project.targetTeamSize} Members
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            About This Project
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {/* Open Roles Needed */}
        {project.rolesNeeded && project.rolesNeeded.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Roles Needed in Team
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.rolesNeeded.map((role) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/20"
                >
                  <span className="text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                    {role}
                  </span>
                  {!isOwner && !isMember && !hasApplied && project.status === "RECRUITING" && (
                    <Button
                      size="sm"
                      onClick={() => setIsApplyOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tech Stack
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Required Skills
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {project.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata & Links Row */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80 gap-3 flex-wrap text-xs text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap">
            {deadlineText && (
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{deadlineText}</span>
              </span>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
              >
                <GitBranch className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {project.contactInfo && (
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <Mail className="w-4 h-4" />
                <span>{project.contactInfo}</span>
              </span>
            )}
          </div>

          <div>
            {!isOwner && !isMember && !hasApplied && project.status === "RECRUITING" && (
              <Button
                onClick={() => setIsApplyOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
              >
                <UserPlus className="w-4 h-4" />
                <span>Apply to Join Team</span>
              </Button>
            )}
            {hasApplied && (
              <Badge variant="outline" className="text-xs py-1.5 px-3 gap-1.5 text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Application Pending Review</span>
              </Badge>
            )}
            {isMember && (
              <Badge variant="success" className="text-xs py-1.5 px-3 gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>You are on this Team</span>
              </Badge>
            )}
          </div>
        </div>
      </article>

      {/* Team Roster Section */}
      <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Users2 className="w-5 h-5 text-indigo-500" />
          <span>Active Team Roster</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {project.members.length} / {project.targetTeamSize}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {member.name ? member.name[0].toUpperCase() : "M"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {member.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Owner Applicant Management Section */}
      {isOwner && (
        <section className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Pending Teammate Applicants</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold">
                {pendingRequests.length}
              </span>
            </h2>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {req.name ? req.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {req.name}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {req.branch}
                          </span>
                        </div>
                        <Badge variant="purple" className="text-[10px] mt-0.5">
                          Applying for: {req.roleApplied}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={processingId === req.id}
                        onClick={() => handleRespond(req.id, "ACCEPTED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1 px-3"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Accept to Team</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === req.id}
                        onClick={() => handleRespond(req.id, "REJECTED")}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-8 text-xs font-semibold gap-1 px-3"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                    &ldquo;{req.message}&rdquo;
                  </p>

                  {req.portfolioOrGithub && (
                    <a
                      href={req.portfolioOrGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>View Portfolio / GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic py-2">
              No pending applications for this project currently.
            </p>
          )}
        </section>
      )}

      {/* Apply Modal */}
      <JoinRequestModal
        project={project}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={handleSendJoinRequest}
      />
    </div>
  );
}
