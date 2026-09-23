"use client";

import * as React from "react";
import { DSAProblemItem } from "@/services/dsa-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Building2,
  Trash2,
  Code,
  FileText,
} from "lucide-react";

interface DSAProblemCardProps {
  problem: DSAProblemItem;
  onToggleStatus: (id: string) => void;
  onToggleRevision: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DSAProblemCard({
  problem,
  onToggleStatus,
  onToggleRevision,
  onDelete,
}: DSAProblemCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isSolved = problem.status === "SOLVED";

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return (
          <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
            Easy
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
            Medium
          </Badge>
        );
      case "HARD":
        return (
          <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
            Hard
          </Badge>
        );
      default:
        return <Badge variant="secondary">{diff}</Badge>;
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isSolved
          ? "border-emerald-500/30 bg-emerald-50/15 dark:bg-emerald-950/10"
          : problem.isRevision
          ? "border-amber-500/40 bg-amber-50/15 dark:bg-amber-950/10"
          : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Solved Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(problem.id)}
          aria-label={isSolved ? "Mark as unsolved" : "Mark as solved"}
          className={`w-6 h-6 rounded-lg border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
            isSolved
              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-105"
              : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-zinc-800"
          }`}
        >
          {isSolved && (
            <svg
              className="w-3.5 h-3.5 stroke-[3] text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Problem Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold text-sm transition-colors ${
                isSolved
                  ? "line-through text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {problem.title}
            </h3>

            {/* External Platform Link */}
            {problem.problemUrl && (
              <a
                href={problem.problemUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                title={`Open on ${problem.platform}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Difficulty Badge */}
            {getDifficultyBadge(problem.difficulty)}

            {/* Category Badge */}
            <Badge variant="outline" className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {problem.category}
            </Badge>
          </div>

          {/* Meta: Complexities & Company Tags */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {problem.timeComplexity && (
              <span className="flex items-center gap-1 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-indigo-500" />
                {problem.timeComplexity}
              </span>
            )}

            {problem.spaceComplexity && (
              <span className="flex items-center gap-1 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                <Layers className="w-3 h-3 text-purple-500" />
                {problem.spaceComplexity}
              </span>
            )}

            {/* Company Tags */}
            {problem.companyTags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Building2 className="w-3 h-3 text-zinc-400" />
                {problem.companyTags.slice(0, 3).map((comp) => (
                  <span
                    key={comp}
                    className="text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md"
                  >
                    {comp}
                  </span>
                ))}
                {problem.companyTags.length > 3 && (
                  <span className="text-[10px] text-zinc-400">
                    +{problem.companyTags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Revision Bookmark & Accordion */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleRevision(problem.id)}
            title={problem.isRevision ? "Remove from revision" : "Bookmark for revision"}
            className={`p-2 rounded-xl border transition-all ${
              problem.isRevision
                ? "border-amber-500/50 bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-300"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {(problem.notes || problem.solutionCode) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Toggle solution & notes"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {onDelete && problem.id.startsWith("dsa_prob_") && (
            <button
              type="button"
              onClick={() => onDelete(problem.id)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 hover:border-rose-300"
              title="Delete custom problem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Notes & Solution Code Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3 mt-1">
          {problem.notes && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Approach & Key Intuition
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 whitespace-pre-wrap leading-relaxed">
                {problem.notes}
              </p>
            </div>
          )}

          {problem.solutionCode && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Code className="w-3 h-3" /> Solution Code / Pseudocode
              </span>
              <pre className="text-xs font-mono bg-zinc-950 text-zinc-200 p-3.5 rounded-xl border border-zinc-800 overflow-x-auto">
                <code>{problem.solutionCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
