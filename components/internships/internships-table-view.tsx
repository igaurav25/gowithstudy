"use client";

import { InternshipApplicationItem } from "@/services/internships-service";
import { ApplicationStatus, APPLICATION_STATUSES } from "@/schemas/internships";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

interface InternshipsTableViewProps {
  applications: InternshipApplicationItem[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onSelectApplication: (app: InternshipApplicationItem) => void;
  onDeleteApplication: (id: string) => void;
}

export function InternshipsTableView({
  applications,
  onStatusChange,
  onSelectApplication,
  onDeleteApplication,
}: InternshipsTableViewProps) {
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "OFFER":
        return <Badge variant="success">🎉 Offer Received</Badge>;
      case "INTERVIEW":
        return <Badge variant="purple">🎯 Interviewing</Badge>;
      case "OA_SCHEDULED":
        return <Badge variant="warning">📝 OA Scheduled</Badge>;
      case "APPLIED":
        return <Badge variant="default" className="bg-sky-600 hover:bg-sky-700">📩 Applied</Badge>;
      case "SAVED":
        return <Badge variant="outline">💡 Wishlist</Badge>;
      case "REJECTED":
        return <Badge variant="secondary">📁 Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
        No job or internship applications found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Role Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Type / Mode</th>
              <th className="py-3 px-4">Stipend / Salary</th>
              <th className="py-3 px-4">Applied Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                {/* Company Name */}
                <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <span>{app.company}</span>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-400 hover:text-indigo-600"
                        title="Open job listing"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Role */}
                <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                  {app.role}
                </td>

                {/* Status Badge & Dropdown */}
                <td className="py-3.5 px-4">
                  <select
                    value={app.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onStatusChange(app.id, e.target.value as ApplicationStatus)
                    }
                    className="text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none px-2 py-1 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="SAVED">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="OA_SCHEDULED">OA Scheduled</option>
                    <option value="INTERVIEW">Interviewing</option>
                    <option value="OFFER">Offer Received</option>
                    <option value="REJECTED">Archived</option>
                  </select>
                </td>

                {/* Type & Mode */}
                <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {app.jobType}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {app.workMode}
                    </Badge>
                  </div>
                </td>

                {/* Stipend */}
                <td className="py-3.5 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  {app.stipendOrSalary || "TBD"}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-zinc-500">
                  {new Date(app.applicationDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteApplication(app.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
