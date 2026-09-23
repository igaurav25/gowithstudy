"use client";

import * as React from "react";
import { InternshipApplicationItem } from "@/services/internships-service";
import { ApplicationStatus, APPLICATION_STATUSES } from "@/schemas/internships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  User,
  FileText,
  Trash2,
  CheckCircle2,
  Building2,
  Clock,
} from "lucide-react";

interface InternshipDetailModalProps {
  application: InternshipApplicationItem | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

export function InternshipDetailModal({
  application,
  onClose,
  onStatusChange,
  onDelete,
}: InternshipDetailModalProps) {
  if (!application) return null;

  const STATUS_FLOW: { id: ApplicationStatus; label: string; color: string }[] = [
    { id: "SAVED", label: "Wishlist", color: "hover:bg-zinc-100" },
    { id: "APPLIED", label: "Applied", color: "hover:bg-sky-50 dark:hover:bg-sky-950/40" },
    { id: "OA_SCHEDULED", label: "OA", color: "hover:bg-amber-50 dark:hover:bg-amber-950/40" },
    { id: "INTERVIEW", label: "Interview", color: "hover:bg-purple-50 dark:hover:bg-purple-950/40" },
    { id: "OFFER", label: "Offer", color: "hover:bg-emerald-50 dark:hover:bg-emerald-950/40" },
    { id: "REJECTED", label: "Archived", color: "hover:bg-zinc-100" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {application.company}
              </h2>
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
              {application.role}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pipeline Step Switcher */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Pipeline Stage
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {STATUS_FLOW.map((step) => {
              const isActive = application.status === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStatusChange(application.id, step.id)}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : `bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 ${step.color}`
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-500" /> Stipend / CTC
            </span>
            <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {application.stipendOrSalary || "Not specified"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-500" /> Type & Work Mode
            </span>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {application.jobType} • {application.workMode}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" /> Location
            </span>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {application.location || "Remote / Various"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" /> Date Applied
            </span>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {new Date(application.applicationDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Referral or Recruiter Contact */}
        {(application.referralName || application.recruiterContact) && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <User className="w-3 h-3 text-purple-500" /> Referral / Recruiter Note
            </span>
            <p className="text-zinc-700 dark:text-zinc-300">
              {application.referralName && (
                <span><strong>Referral:</strong> {application.referralName} </span>
              )}
              {application.recruiterContact && (
                <span><strong>Contact:</strong> {application.recruiterContact}</span>
              )}
            </p>
          </div>
        )}

        {/* Notes & Updates */}
        {application.notes && (
          <div className="space-y-1.5 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Notes & Interview Feedback
            </span>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {application.notes}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onDelete(application.id);
              onClose();
            }}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Application</span>
          </Button>

          <Button
            type="button"
            onClick={onClose}
            className="text-xs rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-5"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
