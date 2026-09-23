import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface InternshipsFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  selectedWorkMode: string;
  onWorkModeChange: (w: string) => void;
  selectedJobType: string;
  onJobTypeChange: (j: string) => void;
  sortBy: string;
  onSortByChange: (s: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function InternshipsFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedWorkMode,
  onWorkModeChange,
  selectedJobType,
  onJobTypeChange,
  sortBy,
  onSortByChange,
  onReset,
  hasActiveFilters,
}: InternshipsFiltersProps) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by company, role title, location or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="SAVED">Saved / Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="OA_SCHEDULED">OA Scheduled</option>
            <option value="INTERVIEW">Interviewing</option>
            <option value="OFFER">Offer Received</option>
            <option value="REJECTED">Archived / Rejected</option>
          </select>

          {/* Work Mode */}
          <select
            value={selectedWorkMode}
            onChange={(e) => onWorkModeChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          {/* Job Type */}
          <select
            value={selectedJobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Roles</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="RESEARCH_INTERN">Research Intern</option>
            <option value="PART_TIME">Part Time</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="applied_recent">Applied: Newest First</option>
            <option value="deadline_soon">Deadline: Due Soonest</option>
            <option value="company">Company: A → Z</option>
            <option value="status">Pipeline Stage</option>
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
