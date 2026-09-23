import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw } from "lucide-react";
import { DSADifficulty, DSAStatus } from "@/schemas/dsa";

interface DSAFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (d: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  selectedCompany: string;
  onCompanyChange: (c: string) => void;
  sortBy: string;
  onSortByChange: (s: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const TOP_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Adobe",
  "Uber",
  "Bloomberg",
  "LinkedIn",
  "Goldman Sachs",
];

export function DSAFilters({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  selectedCompany,
  onCompanyChange,
  sortBy,
  onSortByChange,
  onReset,
  hasActiveFilters,
}: DSAFiltersProps) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search problems, algorithms, or company tags (e.g. Kadane, Two Sum, Google)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Filter Menus */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="SOLVED">Solved</option>
            <option value="UNSOLVED">Unsolved</option>
            <option value="REVISION_NEEDED">Revision Queue</option>
          </select>

          {/* Company Dropdown */}
          <select
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Companies</option>
            {TOP_COMPANIES.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="default">Default Order</option>
            <option value="difficulty_asc">Difficulty: Easy → Hard</option>
            <option value="difficulty_desc">Difficulty: Hard → Easy</option>
            <option value="title">Problem Title: A → Z</option>
            <option value="recent">Recently Solved/Updated</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 text-xs px-3 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
