"use client";

import * as React from "react";
import {
  InternshipApplicationItem,
  InternshipStats,
} from "@/services/internships-service";
import {
  ApplicationStatus,
  CreateInternshipInput,
} from "@/schemas/internships";
import { InternshipsHeader } from "@/components/internships/internships-header";
import { InternshipsStatsBar } from "@/components/internships/internships-stats-bar";
import { InternshipsFilters } from "@/components/internships/internships-filters";
import { InternshipsKanbanBoard } from "@/components/internships/internships-kanban-board";
import { InternshipsTableView } from "@/components/internships/internships-table-view";
import { AddApplicationModal } from "@/components/internships/add-application-modal";
import { InternshipDetailModal } from "@/components/internships/internship-detail-modal";
import {
  createInternshipAction,
  updateInternshipStatusAction,
  deleteInternshipAction,
} from "@/features/internships/actions";
import { Check, AlertCircle } from "lucide-react";

interface InternshipsClientViewProps {
  initialApplications: InternshipApplicationItem[];
  initialStats: InternshipStats;
  autoOpenAdd?: boolean;
}

export function InternshipsClientView({
  initialApplications,
  initialStats,
  autoOpenAdd = false,
}: InternshipsClientViewProps) {
  const [applications, setApplications] =
    React.useState<InternshipApplicationItem[]>(initialApplications);
  const [stats, setStats] = React.useState<InternshipStats>(initialStats);
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = React.useState("ALL");
  const [selectedJobType, setSelectedJobType] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("applied_recent");

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(autoOpenAdd);
  const [detailApplication, setDetailApplication] =
    React.useState<InternshipApplicationItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recompute live stats from current applications
  const computeStats = (
    currentList: InternshipApplicationItem[]
  ): InternshipStats => {
    let saved = 0;
    let applied = 0;
    let oaScheduled = 0;
    let interview = 0;
    let offer = 0;
    let rejected = 0;

    for (const a of currentList) {
      switch (a.status) {
        case "SAVED":
          saved++;
          break;
        case "APPLIED":
          applied++;
          break;
        case "OA_SCHEDULED":
          oaScheduled++;
          break;
        case "INTERVIEW":
          interview++;
          break;
        case "OFFER":
          offer++;
          break;
        case "REJECTED":
          rejected++;
          break;
      }
    }

    const inProgressCount = applied + oaScheduled + interview;
    const completed = offer + rejected;
    const offerRate =
      completed > 0 ? Math.round((offer / completed) * 100) : offer > 0 ? 100 : 0;

    const upcomingOAsOrInterviews = currentList
      .filter((a) => a.status === "OA_SCHEDULED" || a.status === "INTERVIEW")
      .map((a) => ({
        id: a.id,
        company: a.company,
        role: a.role,
        status: a.status,
        notes: a.notes,
      }));

    return {
      total: currentList.length,
      saved,
      applied,
      oaScheduled,
      interview,
      offer,
      rejected,
      inProgressCount,
      offerRate,
      upcomingOAsOrInterviews,
    };
  };

  // Status transition handler (optimistic)
  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    const prevList = [...applications];
    const target = prevList.find((a) => a.id === id);
    if (!target) return;

    const nextList = prevList.map((a) =>
      a.id === id ? { ...a, status: newStatus, updatedAt: new Date() } : a
    );

    setApplications(nextList);
    setStats(computeStats(nextList));
    if (detailApplication && detailApplication.id === id) {
      setDetailApplication({ ...detailApplication, status: newStatus });
    }

    const res = await updateInternshipStatusAction(id, newStatus);
    if (res.success) {
      showToast(
        newStatus === "OFFER"
          ? `🎉 Congratulations! Marked offer for ${target.company}!`
          : `Updated ${target.company} to ${newStatus.replace("_", " ")}.`
      );
    } else {
      setApplications(prevList);
      setStats(computeStats(prevList));
      showToast(res.error || "Failed to update status", "error");
    }
  };

  // Add application handler
  const handleAddApplication = async (
    data: CreateInternshipInput
  ): Promise<boolean> => {
    const res = await createInternshipAction(data);
    if (res.success && res.data) {
      const updatedList = [
        res.data as InternshipApplicationItem,
        ...applications,
      ];
      setApplications(updatedList);
      setStats(computeStats(updatedList));
      showToast(`✨ Tracked application for ${data.company}!`);
      return true;
    } else {
      showToast(res.error || "Failed to add application", "error");
      return false;
    }
  };

  // Delete application handler
  const handleDeleteApplication = async (id: string) => {
    const prevList = [...applications];
    const target = prevList.find((a) => a.id === id);
    if (!target) return;

    const nextList = prevList.filter((a) => a.id !== id);
    setApplications(nextList);
    setStats(computeStats(nextList));

    const res = await deleteInternshipAction(id);
    if (res.success) {
      showToast(`Application for ${target.company} removed.`);
    } else {
      setApplications(prevList);
      setStats(computeStats(prevList));
      showToast(res.error || "Failed to delete application", "error");
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedWorkMode("ALL");
    setSelectedJobType("ALL");
    setSortBy("applied_recent");
  };

  // Filter & sort applications
  const filteredApplications = React.useMemo(() => {
    let list = [...applications];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== "ALL") {
      list = list.filter((a) => a.status === selectedStatus);
    }

    if (selectedWorkMode !== "ALL") {
      list = list.filter((a) => a.workMode === selectedWorkMode);
    }

    if (selectedJobType !== "ALL") {
      list = list.filter((a) => a.jobType === selectedJobType);
    }

    list.sort((a, b) => {
      if (sortBy === "company") return a.company.localeCompare(b.company);
      if (sortBy === "deadline_soon") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "status") {
        const order: Record<ApplicationStatus, number> = {
          OFFER: 1,
          INTERVIEW: 2,
          OA_SCHEDULED: 3,
          APPLIED: 4,
          SAVED: 5,
          REJECTED: 6,
        };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
    });

    return list;
  }, [
    applications,
    searchQuery,
    selectedStatus,
    selectedWorkMode,
    selectedJobType,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedWorkMode !== "ALL" ||
    selectedJobType !== "ALL" ||
    sortBy !== "applied_recent";

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-4 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30"
              : "bg-rose-600 text-white border-rose-500 shadow-rose-600/30"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <InternshipsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        offersCount={stats.offer}
      />

      {/* 4 KPI Summary Cards */}
      <InternshipsStatsBar stats={stats} />

      {/* Search & Filters */}
      <InternshipsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedWorkMode={selectedWorkMode}
        onWorkModeChange={setSelectedWorkMode}
        selectedJobType={selectedJobType}
        onJobTypeChange={setSelectedJobType}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main View: Kanban or Table */}
      {viewMode === "kanban" ? (
        <InternshipsKanbanBoard
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onSelectApplication={setDetailApplication}
        />
      ) : (
        <InternshipsTableView
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onSelectApplication={setDetailApplication}
          onDeleteApplication={handleDeleteApplication}
        />
      )}

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddApplication}
      />

      {/* Application Detail Modal */}
      <InternshipDetailModal
        application={detailApplication}
        onClose={() => setDetailApplication(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteApplication}
      />
    </div>
  );
}
