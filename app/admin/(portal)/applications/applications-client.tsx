"use client";

import * as React from "react";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  Copy,
  ExternalLink,
  GraduationCap,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  approveApplicationAction,
  rejectApplicationAction,
  getAdminApplicationsAction,
} from "@/features/admin/application-actions";

export function AdminApplicationsClient({
  initialApplications,
}: {
  initialApplications: any[];
}) {
  const [applications, setApplications] = React.useState<any[]>(initialApplications);
  const [filterStatus, setFilterStatus] = React.useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [confirmApproveId, setConfirmApproveId] = React.useState<string | null>(null);
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [activationModal, setActivationModal] = React.useState<{ link: string; refId: string } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const reloadApplications = async () => {
    setIsPending(true);
    try {
      const res = await getAdminApplicationsAction({
        status: filterStatus,
        search: searchQuery,
      });
      if (res.success && res.data?.applications) {
        setApplications(res.data.applications);
      }
    } finally {
      setIsPending(false);
    }
  };

  React.useEffect(() => {
    reloadApplications();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!confirmApproveId) return;
    const target = applications.find((a) => a.id === confirmApproveId);
    setIsPending(true);
    setMessage(null);

    try {
      const res = await approveApplicationAction(confirmApproveId);
      if (res.success && res.data) {
        setMessage({ type: "success", text: res.message || "Application approved!" });
        if (res.data.activationLink) {
          setActivationModal({
            link: res.data.activationLink,
            refId: target?.referenceId || "",
          });
        }
        setConfirmApproveId(null);
        await reloadApplications();
      } else {
        setMessage({ type: "error", text: res.message || "Failed to approve application." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during approval." });
    } finally {
      setIsPending(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    setIsPending(true);
    setMessage(null);

    try {
      const res = await rejectApplicationAction({
        applicationId: rejectId,
        rejectionReason: rejectionReason.trim(),
      });

      if (res.success) {
        setMessage({ type: "success", text: "Application marked as rejected." });
        setRejectId(null);
        setRejectionReason("");
        await reloadApplications();
      } else {
        setMessage({ type: "error", text: res.message || "Failed to reject application." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during rejection." });
    } finally {
      setIsPending(false);
    }
  };

  const filtered = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(s) ||
      app.email.toLowerCase().includes(s) ||
      app.referenceId.toLowerCase().includes(s) ||
      (app.college && app.college.toLowerCase().includes(s)) ||
      (app.rollNumber && app.rollNumber.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>Admissions Review Queue</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Examine submitted student and educator credentials, verify academic records, and grant activation links.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, roll no, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs scrollbar-none border-b border-zinc-800 pb-2">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === st
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {st === "PENDING" && "Pending Review"}
            {st === "APPROVED" && "Approved"}
            {st === "REJECTED" && "Rejected"}
            {st === "ALL" && "All Applications"}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
              : "bg-rose-950/40 border border-rose-800/60 text-rose-300"
          }`}
        >
          {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Applicant Cards List (Mobile-first, stacks cleanly at 360px) */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500">
            No applications found matching the selected filter.
          </div>
        ) : (
          filtered.map((app) => (
            <Card
              key={app.id}
              className="border-zinc-800 bg-zinc-900/80 p-4 transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm sm:text-base text-zinc-100">
                      {app.fullName}
                    </span>
                    <Badge variant={app.type === "STUDENT" ? "purple" : "default"} className="text-[10px] py-0">
                      {app.type}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-indigo-400">
                      {app.referenceId}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">
                    {app.type === "STUDENT"
                      ? `${app.course} · ${app.branch} (Year ${app.year})`
                      : `${app.designation} · ${app.department}`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {app.college || app.institution}
                  </p>
                </div>

                {/* Status Indicator */}
                <div>
                  {app.status === "PENDING" && (
                    <Badge variant="warning" className="gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </Badge>
                  )}
                  {app.status === "APPROVED" && (
                    <Badge variant="success" className="gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </Badge>
                  )}
                  {app.status === "REJECTED" && (
                    <Badge variant="destructive" className="gap-1 text-[11px]">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/60 text-xs">
                <div>
                  <span className="text-zinc-500 block">Contact:</span>
                  <span className="text-zinc-300 truncate block">{app.email}</span>
                  <span className="text-zinc-400">{app.phone}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block">
                    {app.type === "STUDENT" ? "Roll / Student ID:" : "Qualification:"}
                  </span>
                  <span className="font-mono text-zinc-200">
                    {app.type === "STUDENT" ? app.rollNumber : app.qualification}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Submitted:</span>
                  <span className="text-zinc-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons for PENDING applications */}
              {app.status === "PENDING" && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                  <Button
                    type="button"
                    variant="gradient"
                    size="sm"
                    className="w-full sm:w-auto text-xs font-semibold"
                    disabled={isPending}
                    onClick={() => setConfirmApproveId(app.id)}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Approve & Send Activation Link</span>
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto text-xs font-semibold"
                    disabled={isPending}
                    onClick={() => setRejectId(app.id)}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span>Reject</span>
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* CONFIRM APPROVAL MODAL */}
      {confirmApproveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-100">
              Confirm Applicant Approval
            </h3>
            <p className="text-xs text-zinc-400">
              Approving this application will generate a secure 48-hour password setup token and create the student/educator record in GoWithStudy.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setConfirmApproveId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="text-xs font-semibold"
                isLoading={isPending}
                onClick={handleApprove}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-base text-zinc-100">
              Reject Application
            </h3>
            <p className="text-xs text-zinc-400">
              Please state why this application is being rejected (e.g. invalid roll number, unverified college enrollment):
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason (min 5 characters)..."
              className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setRejectId(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs font-semibold"
                isLoading={isPending}
                disabled={rejectionReason.trim().length < 5}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVATION LINK DISPLAY MODAL */}
      {activationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-emerald-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-base text-zinc-100">
                Activation Link Dispatched
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              The activation link has been dispatched to the applicant. In testing environments, you can copy it directly below:
            </p>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-indigo-300 break-all select-all">
              {activationModal.link}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(activationModal.link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="text-xs"
                onClick={() => setActivationModal(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
