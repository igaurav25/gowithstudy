import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  PlusCircle,
  LayoutGrid,
  Table as TableIcon,
  Trophy,
} from "lucide-react";

interface InternshipsHeaderProps {
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  onOpenAddModal: () => void;
  offersCount: number;
}

export function InternshipsHeader({
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  offersCount,
}: InternshipsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Internship & Job Application Pipeline
              </h1>
              {offersCount > 0 && (
                <Badge variant="success" className="text-[10px] flex items-center gap-1 font-bold">
                  <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{offersCount} {offersCount === 1 ? "Offer" : "Offers"}</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Track off-campus and on-campus recruitment, Online Assessments (OAs), and interview rounds
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Kanban vs Table View Switcher */}
        <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 flex items-center">
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "kanban"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>

        {/* Add Application Button */}
        <Button
          type="button"
          onClick={onOpenAddModal}
          size="sm"
          className="text-xs gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sm shadow-sky-500/20"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Application</span>
        </Button>
      </div>
    </div>
  );
}
