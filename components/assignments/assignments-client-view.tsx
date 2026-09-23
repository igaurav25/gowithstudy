"use client";

import * as React from "react";
import { AssignmentItem, AssignmentsStats } from "@/services/assignments-service";
import { CreateAssignmentInput } from "@/schemas/assignments";
import { AssignmentsHeader } from "@/components/assignments/assignments-header";
import { AssignmentsFilters } from "@/components/assignments/assignments-filters";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AddAssignmentModal } from "@/components/assignments/add-assignment-modal";
import {
  createAssignmentAction,
  toggleAssignmentStatusAction,
  deleteAssignmentAction,
} from "@/features/assignments/actions";
import { Check, AlertCircle, FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentsClientViewProps {
  initialAssignments: AssignmentItem[];
  initialStats: AssignmentsStats;
  autoOpenAdd?: boolean;
}

export function AssignmentsClientView({
  initialAssignments,
  initialStats,
  autoOpenAdd = false,
}: AssignmentsClientViewProps) {
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>(initialAssignments);
  const [stats, setStats] = React.useState<AssignmentsStats>(initialStats);

  // Filters state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [selectedPriority, setSelectedPriority] = React.useState("ALL");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"due_soonest" | "due_latest" | "priority" | "title">("due_soonest");

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(autoOpenAdd);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-calculate statistics locally upon mutations
  const recalculateStats = (list: AssignmentItem[]) => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    for (const a of list) {
      if (a.status === "COMPLETED") completed++;
      else if (a.dueDays < 0) overdue++;
      else if (a.status === "IN_PROGRESS") inProgress++;
      else pending++;
    }

    const completionRate = list.length > 0 ? Math.round((completed / list.length) * 100) : 0;
    setStats({
      total: list.length,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate,
    });
  };

  // Available subjects
  const availableSubjects = React.useMemo(() => {
    return Array.from(new Set(assignments.map((a) => a.subject)));
  }, [assignments]);

  // Client-side filtering & sorting
  const filteredAssignments = React.useMemo(() => {
    let result = [...assignments];

    if (selectedStatus !== "ALL") {
      result = result.filter((a) => a.status === selectedStatus);
    }

    if (selectedPriority !== "ALL") {
      result = result.filter((a) => a.priority === selectedPriority);
    }

    if (selectedSubject !== "ALL") {
      result = result.filter((a) => a.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.subject.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "due_latest") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "priority") {
        const order = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        return (order[a.priority] || 99) - (order[b.priority] || 99);
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return result;
  }, [assignments, selectedStatus, selectedPriority, selectedSubject, searchQuery, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedStatus !== "ALL" ||
    selectedPriority !== "ALL" ||
    selectedSubject !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedPriority("ALL");
    setSelectedSubject("ALL");
  };

  // Add Assignment Action
  const handleAddAssignment = async (data: CreateAssignmentInput): Promise<boolean> => {
    const res = await createAssignmentAction(data);
    if (res.success && res.data) {
      const updated = [res.data, ...assignments];
      setAssignments(updated);
      recalculateStats(updated);
      showToast("Assignment added to tracker!");
      return true;
    }
    showToast(res.message || "Failed to create assignment", "error");
    return false;
  };

  // Toggle Status Action
  const handleToggleStatus = async (id: string) => {
    // Optimistic toggle
    const updated = assignments.map((a) => {
      if (a.id === id) {
        const newStatus = a.status === "COMPLETED" ? "PENDING" : "COMPLETED";
        return { ...a, status: newStatus as any };
      }
      return a;
    });
    setAssignments(updated);
    recalculateStats(updated);

    const res = await toggleAssignmentStatusAction(id);
    if (res.success) {
      showToast(res.message || "Status updated!");
    } else {
      showToast(res.message || "Failed to update status", "error");
    }
  };

  // Delete Action
  const handleDeleteAssignment = async (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    recalculateStats(updated);

    const res = await deleteAssignmentAction(id);
    if (res.success) {
      showToast("Assignment removed.");
    } else {
      showToast(res.message || "Failed to delete assignment", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === "success"
              ? "bg-zinc-900 text-white border-zinc-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header with KPI cards */}
      <AssignmentsHeader stats={stats} onOpenAdd={() => setIsAddModalOpen(true)} />

      {/* Filters Bar */}
      <AssignmentsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
        availableSubjects={availableSubjects}
      />

      {/* Assignments Cards Stream */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 text-zinc-400 max-w-md mx-auto my-6">
          <FileQuestion className="w-10 h-10 mx-auto mb-2 text-indigo-400" />
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            {hasActiveFilters ? "No matching assignments" : "No assignments found"}
          </h4>
          <p className="text-xs mt-1 text-zinc-500">
            {hasActiveFilters
              ? "Try clearing filters to see all academic deadlines."
              : "Add your first coursework task or lab report to start tracking."}
          </p>
          <div className="pt-4">
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Assignment</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((asgn) => (
            <AssignmentCard
              key={asgn.id}
              assignment={asgn}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteAssignment}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAssignment}
      />
    </div>
  );
}
