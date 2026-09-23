"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string, mode?: "EXPLAIN" | "QUIZ" | "SUMMARY" | "CODE") => void;
}

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  const suggestions = [
    {
      title: "Banker's Algorithm",
      prompt: "Explain Banker's Algorithm and the 4 Coffman conditions for deadlocks with an example.",
      mode: "EXPLAIN" as const,
      tag: "OS",
    },
    {
      title: "2PL vs Strict 2PL",
      prompt: "Compare Two-Phase Locking (2PL) vs Strict 2PL and explain how cascading rollbacks are eliminated.",
      mode: "EXPLAIN" as const,
      tag: "DBMS",
    },
    {
      title: "0/1 Knapsack Blueprint",
      prompt: "Derive the 0/1 Knapsack recurrence relation and show space-optimized Java code.",
      mode: "CODE" as const,
      tag: "DSA",
    },
    {
      title: "CIDR Subnetting",
      prompt: "How do you calculate usable host addresses and subnet masks for 192.168.10.0/26?",
      mode: "EXPLAIN" as const,
      tag: "Networks",
    },
    {
      title: "Midterm Practice Quiz",
      prompt: "Generate an interactive 3-question practice quiz on concurrency and scheduling.",
      mode: "QUIZ" as const,
      tag: "Quiz",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Suggested Study Prompts</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {suggestions.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelectPrompt(item.prompt, item.mode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-xs text-left shrink-0 group cursor-pointer shadow-sm"
          >
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {item.title}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
              {item.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
