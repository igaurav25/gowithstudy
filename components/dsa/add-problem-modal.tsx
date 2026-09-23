"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreateDSAProblemInput,
  DSA_CATEGORIES,
  DSA_DIFFICULTIES,
  DSA_PLATFORMS,
  DSACategory,
  DSADifficulty,
  DSAPlatform,
  DSAStatus,
} from "@/schemas/dsa";
import { X, Code2, PlusCircle, AlertCircle } from "lucide-react";

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDSAProblemInput) => Promise<boolean>;
}

export function AddProblemModal({ isOpen, onClose, onSubmit }: AddProblemModalProps) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<DSACategory>("Arrays & Strings");
  const [difficulty, setDifficulty] = React.useState<DSADifficulty>("MEDIUM");
  const [platform, setPlatform] = React.useState<DSAPlatform>("LEETCODE");
  const [problemUrl, setProblemUrl] = React.useState("");
  const [timeComplexity, setTimeComplexity] = React.useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = React.useState("O(1)");
  const [companyTagsStr, setCompanyTagsStr] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [solutionCode, setSolutionCode] = React.useState("");
  const [status, setStatus] = React.useState<DSAStatus>("UNSOLVED");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a problem title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const companyTags = companyTagsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const success = await onSubmit({
      title: title.trim(),
      category,
      difficulty,
      platform,
      problemUrl: problemUrl.trim() || undefined,
      timeComplexity: timeComplexity.trim() || undefined,
      spaceComplexity: spaceComplexity.trim() || undefined,
      companyTags,
      notes: notes.trim() || undefined,
      solutionCode: solutionCode.trim() || undefined,
      status,
    });

    setIsSubmitting(false);
    if (success) {
      setTitle("");
      setProblemUrl("");
      setCompanyTagsStr("");
      setNotes("");
      setSolutionCode("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Log Interview Coding Problem
              </h2>
              <p className="text-xs text-zinc-500">
                Add a LeetCode, GFG, or mock interview problem to your revision tracker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Problem Title *
            </label>
            <Input
              required
              placeholder="e.g. Median of Two Sorted Arrays"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-10 rounded-xl"
            />
          </div>

          {/* Category, Difficulty & Platform Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                DSA Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DSACategory)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {DSA_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Difficulty *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DSADifficulty)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {DSA_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as DSAPlatform)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {DSA_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL & Company Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Problem URL (LeetCode / GFG)
              </label>
              <Input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={problemUrl}
                onChange={(e) => setProblemUrl(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Company Tags (comma separated)
              </label>
              <Input
                placeholder="Google, Amazon, Microsoft"
                value={companyTagsStr}
                onChange={(e) => setCompanyTagsStr(e.target.value)}
                className="text-xs h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Complexities & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Time Complexity
              </label>
              <Input
                placeholder="O(N log N)"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                className="text-xs h-10 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Space Complexity
              </label>
              <Input
                placeholder="O(1)"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                className="text-xs h-10 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DSAStatus)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="UNSOLVED">Unsolved</option>
                <option value="SOLVED">Solved</option>
                <option value="REVISION_NEEDED">Needs Revision</option>
              </select>
            </div>
          </div>

          {/* Notes / Intuition */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Approach Notes & Key Intuition
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Use binary search on the answer space. Invariant: mid * mid <= x..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Solution Code / Pseudocode */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Solution Code / Snippet (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="// Paste optimal C++ / Java / Python / TS snippet"
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Adding..." : "Save Problem"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
