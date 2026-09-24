"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Megaphone,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  UserCheck,
  Ban,
  Activity,
  Filter,
  Pin,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role } from "@/lib/rbac";
import {
  AdminUserItem,
  ModerationReportItem,
  AnnouncementItem,
  AuditLogItem,
  AdminOverviewStats,
} from "@/services/admin-service";
import {
  updateUserRoleAction,
  toggleUserStatusAction,
  resolveReportAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
} from "@/features/admin/actions";
import { CreateAnnouncementModal } from "@/components/admin/create-announcement-modal";
import { ResolveReportModal } from "@/components/admin/resolve-report-modal";
import { UpdateRoleModal } from "@/components/admin/update-role-modal";
import {
  CreateAnnouncementInput,
  ResolveReportInput,
  UpdateUserRoleInput,
} from "@/schemas/admin";

interface AdminClientViewProps {
  initialUsers: AdminUserItem[];
  initialReports: ModerationReportItem[];
  initialAnnouncements: AnnouncementItem[];
  initialAuditLogs: AuditLogItem[];
  initialStats: AdminOverviewStats;
  currentUserId: string;
  currentUserRole: Role;
}

type AdminTab = "OVERVIEW" | "USERS" | "MODERATION" | "ANNOUNCEMENTS" | "AUDIT_LOGS";

export function AdminClientView({
  initialUsers,
  initialReports,
  initialAnnouncements,
  initialAuditLogs,
  initialStats,
  currentUserId,
  currentUserRole,
}: AdminClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<AdminTab>("OVERVIEW");

  // State
  const [users, setUsers] = React.useState<AdminUserItem[]>(initialUsers);
  const [reports, setReports] = React.useState<ModerationReportItem[]>(initialReports);
  const [announcements, setAnnouncements] =
    React.useState<AnnouncementItem[]>(initialAnnouncements);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogItem[]>(initialAuditLogs);
  const [stats, setStats] = React.useState<AdminOverviewStats>(initialStats);

  // Filters
  const [userQuery, setUserQuery] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = React.useState<string>("ALL");
  const [reportStatusFilter, setReportStatusFilter] = React.useState<string>("OPEN");

  // Modals
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<ModerationReportItem | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = React.useState<AdminUserItem | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Sync props
  React.useEffect(() => {
    setUsers(initialUsers);
    setReports(initialReports);
    setAnnouncements(initialAnnouncements);
    setAuditLogs(initialAuditLogs);
    setStats(initialStats);
  }, [initialUsers, initialReports, initialAnnouncements, initialAuditLogs, initialStats]);

  // Handle User Role Update
  const handleUpdateRole = async (input: UpdateUserRoleInput) => {
    const res = await updateUserRoleAction(input);
    if (!res.success) {
      throw new Error(res.error || "Failed to update role");
    }
    const updated = res.data as AdminUserItem;
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showFeedback("success", `Role updated for ${updated.name} to ${updated.role}`);
  };

  // Handle User Suspension Toggle
  const handleToggleSuspension = async (user: AdminUserItem) => {
    const nextState = !user.isSuspended;
    const reason = nextState ? "Administrative policy suspension" : "Reinstated by admin";
    const res = await toggleUserStatusAction({
      targetUserId: user.id,
      isSuspended: nextState,
      reason,
    });
    if (!res.success) {
      showFeedback("error", res.error || "Failed to update suspension status");
      return;
    }
    const updated = res.data as AdminUserItem;
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showFeedback(
      "success",
      `Student ${updated.name} has been ${nextState ? "suspended" : "reinstated"}`
    );
  };

  // Handle Report Resolution
  const handleResolveReport = async (input: ResolveReportInput) => {
    const res = await resolveReportAction(input);
    if (!res.success) {
      throw new Error(res.error || "Failed to resolve report");
    }
    const updated = res.data as ModerationReportItem;
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showFeedback("success", `Report marked as ${updated.status} with action ${updated.actionTaken}`);
  };

  // Handle Announcement Creation
  const handleCreateAnnouncement = async (input: CreateAnnouncementInput) => {
    const res = await createAnnouncementAction(input);
    if (!res.success) {
      throw new Error(res.error || "Failed to create announcement");
    }
    const created = res.data as AnnouncementItem;
    setAnnouncements((prev) => [created, ...prev]);
    showFeedback("success", `Announcement "${created.title}" broadcasted successfully`);
  };

  // Handle Announcement Deletion
  const handleDeleteAnnouncement = async (id: string) => {
    const res = await deleteAnnouncementAction(id);
    if (!res.success) {
      showFeedback("error", res.error || "Failed to delete announcement");
      return;
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showFeedback("success", "Announcement deleted from system");
  };

  // Filtered Users
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (userStatusFilter === "ACTIVE" && u.isSuspended) return false;
      if (userStatusFilter === "SUSPENDED" && !u.isSuspended) return false;
      if (userQuery.trim()) {
        const q = userQuery.toLowerCase().trim();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.branch.toLowerCase().includes(q) ||
          u.college.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, userQuery, userRoleFilter, userStatusFilter]);

  // Filtered Reports
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      if (reportStatusFilter !== "ALL" && r.status !== reportStatusFilter) return false;
      return true;
    });
  }, [reports, reportStatusFilter]);

  const openReportsCount = reports.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Campus Governance Console
                </h1>
                <Badge
                  variant={currentUserRole === "ADMIN" ? "purple" : "secondary"}
                  className="text-[10px] tracking-wider uppercase"
                >
                  {currentUserRole} Clearance
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Role management, academic community moderation, official announcements, and audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {openReportsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("MODERATION");
                setReportStatusFilter("OPEN");
              }}
              className="text-xs gap-1.5 h-9 border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{openReportsCount} Pending Reports</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-9"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>New Announcement</span>
          </Button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200/80 dark:border-zinc-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "OVERVIEW", label: "Dashboard Overview", icon: BarChart3 },
          { id: "USERS", label: "Student Accounts & Roles", icon: Users, badge: users.length },
          { id: "MODERATION", label: "Moderation Queue", icon: ShieldAlert, badge: openReportsCount },
          { id: "ANNOUNCEMENTS", label: "Verified Announcements", icon: Megaphone, badge: announcements.length },
          { id: "AUDIT_LOGS", label: "Audit Trail", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 dark:bg-zinc-900/30 text-white dark:text-zinc-900"
                      : tab.id === "MODERATION"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Registered Students
              </span>
              <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
                {stats.totalUsers}
              </p>
              <span className="text-[11px] text-zinc-400">Total verified accounts</span>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Active DAU (30d)
              </span>
              <p className="text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400">
                {stats.activeUsers30d}
              </p>
              <span className="text-[11px] text-zinc-400">85% engagement rate</span>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Pending Reports
              </span>
              <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
                {openReportsCount}
              </p>
              <span className="text-[11px] text-zinc-400">Awaiting moderator review</span>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Published Content
              </span>
              <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
                {stats.totalPosts + stats.totalProjects + stats.totalNotes}
              </p>
              <span className="text-[11px] text-zinc-400">Notes, posts & projects</span>
            </div>
          </div>

          {/* Analytics Breakdown: Branches & Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch Distribution */}
            <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Branch Distribution</span>
                <span className="text-xs text-zinc-400 font-normal">Active Students</span>
              </h3>
              <div className="space-y-3">
                {stats.branchBreakdown.map((item) => (
                  <div key={item.branch} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                        {item.branch}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Pinned Announcements */}
            <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Active Announcements
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("ANNOUNCEMENTS")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 h-7"
                >
                  Manage All &rarr;
                </Button>
              </div>

              <div className="space-y-2.5">
                {announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {ann.title}
                        </p>
                        {ann.isPinned && (
                          <Pin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Audit Log Preview */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Recent System Governance Activity</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("AUDIT_LOGS")}
                className="text-xs text-indigo-600 dark:text-indigo-400 h-7"
              >
                View Full Log &rarr;
              </Button>
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {log.userName}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {log.action}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-zinc-400">Entity: {log.entity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "USERS" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search by name, email, branch..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">USER (Student)</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Accounts</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">College & Branch</th>
                    <th className="py-3 px-4">Year/Sem</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No students match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-zinc-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                            {u.branch}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                            {u.college}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          Y{u.year} • S{u.semester}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === "ADMIN"
                                ? "purple"
                                : u.role === "MODERATOR"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {u.isSuspended ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Suspended
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {currentUserRole === "ADMIN" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUserForRole(u)}
                                  className="h-7 text-[11px] px-2.5"
                                >
                                  Role
                                </Button>
                                <Button
                                  size="sm"
                                  variant={u.isSuspended ? "outline" : "ghost"}
                                  onClick={() => handleToggleSuspension(u)}
                                  className={`h-7 text-[11px] px-2.5 ${
                                    u.isSuspended
                                      ? "text-emerald-600 hover:text-emerald-700"
                                      : "text-zinc-400 hover:text-rose-600"
                                  }`}
                                  title={u.isSuspended ? "Reinstate user" : "Suspend user"}
                                >
                                  {u.isSuspended ? "Reinstate" : "Suspend"}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION QUEUE */}
      {activeTab === "MODERATION" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["OPEN", "RESOLVED", "ALL"].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    reportStatusFilter === st
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                  }`}
                >
                  {st === "OPEN" ? `Pending (${openReportsCount})` : st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Moderation Queue Clear!
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  No flagged student submissions awaiting review.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    report.status === "OPEN"
                      ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20"
                      : "border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60"
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {report.entityType}
                      </Badge>
                      <Badge variant="destructive" className="text-[10px]">
                        {report.reason}
                      </Badge>
                      <Badge
                        variant={report.status === "OPEN" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {report.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                      {report.entityTitle}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 italic bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                      &ldquo;{report.entitySnippet}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>Reported by: {report.reporterName}</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.actionTaken && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            Action: {report.actionTaken}
                          </span>
                        </>
                      )}
                    </div>

                    {report.resolutionNote && (
                      <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-lg">
                        <strong className="text-zinc-700 dark:text-zinc-300">Note:</strong>{" "}
                        {report.resolutionNote}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    {report.status === "OPEN" ? (
                      <Button
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
                      >
                        Take Action
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                        className="text-xs h-8 px-3 text-zinc-500"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM ANNOUNCEMENTS */}
      {activeTab === "ANNOUNCEMENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Verified campus announcements displayed on student dashboards and mobile feeds.
            </p>
            <Button
              size="sm"
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-8"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="purple" className="text-[10px]">
                      {ann.category}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {ann.isPinned && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 gap-1">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </Badge>
                      )}
                      <Badge
                        variant={
                          ann.priority === "URGENT" || ann.priority === "HIGH"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {ann.priority}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Author: {ann.authorName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="h-7 text-xs text-zinc-400 hover:text-rose-600 p-1"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === "AUDIT_LOGS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Metadata Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                        {log.userName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {log.entity}
                        {log.entityId && (
                          <span className="text-zinc-400 text-[10px] block font-mono">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />

      <ResolveReportModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onSubmit={handleResolveReport}
      />

      <UpdateRoleModal
        user={selectedUserForRole}
        isOpen={Boolean(selectedUserForRole)}
        onClose={() => setSelectedUserForRole(null)}
        onSubmit={handleUpdateRole}
      />
    </div>
  );
}
