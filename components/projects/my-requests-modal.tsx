"use client";

import * as React from "react";
import { X, Users, Check, Ban, GitBranch, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectItem, ProjectJoinRequestItem } from "@/services/projects-service";

interface MyRequestsModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (requestId: string, status: "ACCEPTED" | "REJECTED") => Promise<void>;
}

export function MyRequestsModal({
  project,
  isOpen,
  onClose,
  onRespond,
}: MyRequestsModalProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  if (!isOpen || !project) return null;

  const joinRequests = project.joinRequests || [];
  const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");
  const pastRequests = joinRequests.filter((r) => r.status !== "PENDING");

  const handleAction = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    setProcessingId(requestId);
    try {
      await onRespond(requestId, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Manage Teammate Applications
              </h3>
              <p className="text-xs text-zinc-500">
                Review and accept applicants for {project.title}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Pending Applications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>Pending Applicants</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px]">
                {pendingRequests.length}
              </span>
            </h4>

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
                          onClick={() => handleAction(req.id, "ACCEPTED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold gap-1 px-3 shadow-xs"
                        >
                          {processingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Accept</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === req.id}
                          onClick={() => handleAction(req.id, "REJECTED")}
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
                        <span>View Portfolio / GitHub Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic py-2">
                No pending applicants waiting for review.
              </p>
            )}
          </div>

          {/* Current Team Members */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Current Team Roster ({project.members.length} / {project.targetTeamSize})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                    {member.name ? member.name[0].toUpperCase() : "M"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
