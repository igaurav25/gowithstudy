"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users2,
  Calendar,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/services/projects-service";
import { ProjectType, ProjectStatus } from "@/schemas/projects";

interface ProjectCardProps {
  project: ProjectItem;
  currentUserId: string;
  onOpenApply: (project: ProjectItem) => void;
  onOpenManage: (project: ProjectItem) => void;
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
  return `Due in ${diffDays} days`;
}

export function ProjectCard({
  project,
  currentUserId,
  onOpenApply,
  onOpenManage,
}: ProjectCardProps) {
  const typeCfg = TYPE_CONFIG[project.projectType] || {
    label: project.projectType,
    badgeVariant: "secondary",
  };

  const isOwner = project.ownerId === currentUserId;
  const isMember = project.members.some((m) => m.userId === currentUserId);
  const hasApplied = project.hasApplied;
  const spotsLeft = Math.max(0, project.targetTeamSize - project.currentTeamSize);
  const percentFilled = Math.min(
    100,
    Math.round((project.currentTeamSize / project.targetTeamSize) * 100)
  );
  const deadlineText = formatDeadline(project.deadline);
  const pendingRequestsCount =
    project.joinRequests?.filter((r) => r.status === "PENDING").length || 0;

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Top Header: Owner Info, Type Badge, Recruiting Status */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {project.ownerName ? project.ownerName[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {project.ownerName}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {project.ownerBranch}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={typeCfg.badgeVariant} className="text-[11px]">
              {typeCfg.label}
            </Badge>

            {project.status === "RECRUITING" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Recruiting ({spotsLeft} spots)
              </span>
            ) : project.status === "IN_PROGRESS" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                In Progress
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {project.status}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="group block"
          >
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
              {project.title}
            </h2>
          </Link>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mt-2">
            {project.description}
          </p>
        </div>

        {/* Team Capacity Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Users2 className="w-3.5 h-3.5 text-zinc-400" />
              Team Roster
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-200">
              {project.currentTeamSize} of {project.targetTeamSize} Members
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentFilled >= 100
                  ? "bg-blue-600"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600"
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Roles Needed Chips */}
        {project.rolesNeeded && project.rolesNeeded.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Roles Needed:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {project.rolesNeeded.map((role) => (
                <span
                  key={role}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Chips */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80 gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          {deadlineText && (
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              {deadlineText}
            </span>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg"
              title="View GitHub Repository"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          )}
        </div>

        <div>
          {isOwner ? (
            <Button
              size="sm"
              onClick={() => onOpenManage(project)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs gap-1.5 h-8 px-3 shadow-xs"
            >
              <span>Manage Team</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-indigo-600 font-bold text-[10px]">
                  {pendingRequestsCount}
                </span>
              )}
            </Button>
          ) : isMember ? (
            <Badge variant="success" className="text-xs py-1 px-3 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Team Member</span>
            </Badge>
          ) : hasApplied ? (
            <Badge variant="outline" className="text-xs py-1 px-3 gap-1 text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Request Pending</span>
            </Badge>
          ) : project.status === "RECRUITING" ? (
            <Button
              size="sm"
              onClick={() => onOpenApply(project)}
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white font-semibold text-xs gap-1.5 h-8 px-3 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Apply to Join</span>
            </Button>
          ) : (
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button variant="outline" size="sm" className="text-xs h-8 px-3 gap-1">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
