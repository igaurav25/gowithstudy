"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AIStudyMode, STUDY_MODES } from "@/schemas/ai";
import {
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Code2,
  Loader2,
} from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedMode: AIStudyMode;
  onModeChange: (mode: AIStudyMode) => void;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  selectedMode,
  onModeChange,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  const modes = [
    { id: "EXPLAIN" as const, label: "Explain", icon: BookOpen },
    { id: "QUIZ" as const, label: "Quiz Me", icon: HelpCircle },
    { id: "SUMMARY" as const, label: "Summary", icon: FileText },
    { id: "CODE" as const, label: "Code / Algo", icon: Code2 },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xl p-3 backdrop-blur-md space-y-2">
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
          Study Mode:
        </span>
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = selectedMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Input Form */}
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            selectedMode === "QUIZ"
              ? "Ask to generate a quiz on any topic, e.g. 'Test my understanding of TCP handshake'..."
              : selectedMode === "SUMMARY"
              ? "Ask for a concise cheatsheet, e.g. 'Summarize BCNF vs 3NF with examples'..."
              : selectedMode === "CODE"
              ? "Ask for an algorithm implementation, e.g. 'Show me 0/1 Knapsack in Java'..."
              : "Ask any academic question grounded in your course materials..."
          }
          className="flex-1 max-h-32 min-h-[44px] p-2.5 text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none leading-relaxed"
        />

        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 shrink-0 gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">Ask Copilot</span>
            </>
          )}
        </Button>
      </form>

      {/* Footer shortcut helper */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-0.5">
        <span>Grounded with Document Citations</span>
        <span className="hidden sm:inline">Press Enter to send, Shift + Enter for newline</span>
      </div>
    </div>
  );
}
