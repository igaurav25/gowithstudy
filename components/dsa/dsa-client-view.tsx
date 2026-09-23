"use client";

import * as React from "react";
import { DSAProblemItem, DSAStats } from "@/services/dsa-service";
import { CreateDSAProblemInput, DSACategory, DSA_CATEGORIES } from "@/schemas/dsa";
import { DSAHeader } from "@/components/dsa/dsa-header";
import { DSAStatsOverview } from "@/components/dsa/dsa-stats-overview";
import { DSACategoryBar } from "@/components/dsa/dsa-category-bar";
import { DSAFilters } from "@/components/dsa/dsa-filters";
import { DSAProblemCard } from "@/components/dsa/dsa-problem-card";
import { AddProblemModal } from "@/components/dsa/add-problem-modal";
import {
  toggleDSAStatusAction,
  toggleDSARevisionAction,
  createDSAProblemAction,
  deleteDSAProblemAction,
} from "@/features/dsa/actions";
import { Check, AlertCircle, Sparkles, Inbox } from "lucide-react";

interface DSAClientViewProps {
  initialProblems: DSAProblemItem[];
  initialStats: DSAStats;
  autoOpenAdd?: boolean;
}

export function DSAClientView({
  initialProblems,
  initialStats,
  autoOpenAdd = false,
}: DSAClientViewProps) {
  const [problems, setProblems] = React.useState<DSAProblemItem[]>(initialProblems);
  const [stats, setStats] = React.useState<DSAStats>(initialStats);

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<string>("default");
  const [isRevisionMode, setIsRevisionMode] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(autoOpenAdd);

  // Toast State
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recompute live stats when problems change optimistically
  const computeStats = (currentList: DSAProblemItem[]): DSAStats => {
    const total = currentList.length;
    const solved = currentList.filter((p) => p.status === "SOLVED").length;
    const revisionCount = currentList.filter(
      (p) => p.isRevision || p.status === "REVISION_NEEDED"
    ).length;

    const easyProblems = currentList.filter((p) => p.difficulty === "EASY");
    const easySolved = easyProblems.filter((p) => p.status === "SOLVED").length;

    const medProblems = currentList.filter((p) => p.difficulty === "MEDIUM");
    const medSolved = medProblems.filter((p) => p.status === "SOLVED").length;

    const hardProblems = currentList.filter((p) => p.difficulty === "HARD");
    const hardSolved = hardProblems.filter((p) => p.status === "SOLVED").length;

    const categories = DSA_CATEGORIES.map((cat) => {
      const catProblems = currentList.filter((p) => p.category === cat);
      const catSolved = catProblems.filter((p) => p.status === "SOLVED").length;
      const catTotal = catProblems.length;
      return {
        name: cat,
        solved: catSolved,
        total: catTotal,
        pct: catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0,
      };
    });

    return {
      totalSolved: solved,
      totalProblems: total,
      completionRate: total > 0 ? Math.round((solved / total) * 100) : 0,
      streakDays: 14,
      revisionCount,
      difficultyStats: {
        easy: {
          solved: easySolved,
          total: easyProblems.length,
          pct: easyProblems.length > 0 ? Math.round((easySolved / easyProblems.length) * 100) : 0,
        },
        medium: {
          solved: medSolved,
          total: medProblems.length,
          pct: medProblems.length > 0 ? Math.round((medSolved / medProblems.length) * 100) : 0,
        },
        hard: {
          solved: hardSolved,
          total: hardProblems.length,
          pct: hardProblems.length > 0 ? Math.round((hardSolved / hardProblems.length) * 100) : 0,
        },
      },
      categories,
    };
  };

  // Toggle solved status optimistically
  const handleToggleStatus = async (id: string) => {
    const prevList = [...problems];
    const target = prevList.find((p) => p.id === id);
    if (!target) return;

    const newStatus = target.status === "SOLVED" ? "UNSOLVED" : "SOLVED";
    const nextList = prevList.map((p) =>
      p.id === id
        ? {
            ...p,
            status: newStatus as any,
            solvedAt: newStatus === "SOLVED" ? new Date() : null,
          }
        : p
    );

    setProblems(nextList);
    setStats(computeStats(nextList));

    const res = await toggleDSAStatusAction(id);
    if (res.success) {
      showToast(
        newStatus === "SOLVED"
          ? `🎉 Nice work! "${target.title}" marked as solved.`
          : `"${target.title}" marked as unsolved.`
      );
    } else {
      setProblems(prevList);
      setStats(computeStats(prevList));
      showToast(res.error || "Failed to update problem status", "error");
    }
  };

  // Toggle revision flag optimistically
  const handleToggleRevision = async (id: string) => {
    const prevList = [...problems];
    const target = prevList.find((p) => p.id === id);
    if (!target) return;

    const newIsRevision = !target.isRevision;
    const nextList = prevList.map((p) =>
      p.id === id ? { ...p, isRevision: newIsRevision } : p
    );

    setProblems(nextList);
    setStats(computeStats(nextList));

    const res = await toggleDSARevisionAction(id);
    if (res.success) {
      showToast(
        newIsRevision
          ? `⭐ Added "${target.title}" to Revision Queue.`
          : `Removed "${target.title}" from Revision Queue.`
      );
    } else {
      setProblems(prevList);
      setStats(computeStats(prevList));
      showToast(res.error || "Failed to update revision", "error");
    }
  };

  // Add custom problem handler
  const handleAddProblem = async (data: CreateDSAProblemInput): Promise<boolean> => {
    const res = await createDSAProblemAction(data);
    if (res.success && res.data) {
      const updatedList = [res.data as DSAProblemItem, ...problems];
      setProblems(updatedList);
      setStats(computeStats(updatedList));
      showToast(`✨ Problem "${data.title}" successfully added!`);
      return true;
    } else {
      showToast(res.error || "Failed to create problem", "error");
      return false;
    }
  };

  // Delete problem handler
  const handleDeleteProblem = async (id: string) => {
    const prevList = [...problems];
    const target = prevList.find((p) => p.id === id);
    if (!target) return;

    const nextList = prevList.filter((p) => p.id !== id);
    setProblems(nextList);
    setStats(computeStats(nextList));

    const res = await deleteDSAProblemAction(id);
    if (res.success) {
      showToast(`Problem "${target.title}" removed.`);
    } else {
      setProblems(prevList);
      setStats(computeStats(prevList));
      showToast(res.error || "Failed to delete problem", "error");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedDifficulty("ALL");
    setSelectedStatus("ALL");
    setSelectedCompany("ALL");
    setSortBy("default");
    setIsRevisionMode(false);
  };

  // Compute filtered & sorted problems
  const filteredProblems = React.useMemo(() => {
    let list = [...problems];

    // Revision mode toggle shortcut
    if (isRevisionMode) {
      list = list.filter((p) => p.isRevision || p.status === "REVISION_NEEDED");
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          p.companyTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "ALL") {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      if (selectedStatus === "REVISION_NEEDED") {
        list = list.filter((p) => p.isRevision || p.status === "REVISION_NEEDED");
      } else {
        list = list.filter((p) => p.status === selectedStatus);
      }
    }

    // Company filter
    if (selectedCompany !== "ALL") {
      list = list.filter((p) =>
        p.companyTags.some(
          (t) => t.toLowerCase() === selectedCompany.toLowerCase()
        )
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "difficulty_asc") {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      if (sortBy === "difficulty_desc") {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return order[b.difficulty] - order[a.difficulty];
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "recent") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    return list;
  }, [
    problems,
    isRevisionMode,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedStatus,
    selectedCompany,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedDifficulty !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedCompany !== "ALL" ||
    sortBy !== "default" ||
    isRevisionMode;

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
      <DSAHeader
        streakDays={stats.streakDays}
        revisionCount={stats.revisionCount}
        isRevisionMode={isRevisionMode}
        onToggleRevisionMode={() => setIsRevisionMode(!isRevisionMode)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 4 KPI Summary Cards */}
      <DSAStatsOverview stats={stats} />

      {/* Category Pills Strip */}
      <DSACategoryBar
        selectedCategory={selectedCategory}
        categoryStats={stats.categories}
        onSelectCategory={setSelectedCategory}
      />

      {/* Filters & Search Toolbar */}
      <DSAFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Problem Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span>
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredProblems.length}</strong> of{" "}
            {problems.length} problems
          </span>
          {isRevisionMode && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              ⭐ Filtered by Revision Queue
            </span>
          )}
        </div>

        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-zinc-400" />
            <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              No DSA problems match your filters
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query, difficulty level, or topic filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredProblems.map((prob) => (
              <DSAProblemCard
                key={prob.id}
                problem={prob}
                onToggleStatus={handleToggleStatus}
                onToggleRevision={handleToggleRevision}
                onDelete={handleDeleteProblem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProblem}
      />
    </div>
  );
}
