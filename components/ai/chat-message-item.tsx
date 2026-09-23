"use client";

import * as React from "react";
import { AIMessage, Citation, QuizQuestion } from "@/lib/rag/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  User,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChatMessageItemProps {
  message: AIMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [expandedCitation, setExpandedCitation] = React.useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl rounded-tr-sm bg-indigo-600 text-white shadow-md shadow-indigo-500/10 text-xs sm:text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 items-start animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Assistant Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Main Content Box */}
        <div className="p-5 rounded-3xl rounded-tl-sm border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-3">
          {/* Simple Markdown Formatter */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-2">
            {formatMarkdownContent(message.content)}
          </div>

          {/* Interactive Quiz Component if present */}
          {message.quizQuestions && message.quizQuestions.length > 0 && (
            <div className="pt-2 space-y-4 border-t border-zinc-100 dark:border-zinc-800">
              {message.quizQuestions.map((q, idx) => (
                <InteractiveQuizCard key={q.id || idx} question={q} index={idx + 1} />
              ))}
            </div>
          )}

          {/* Source Grounding Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Grounded Source Citations:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {message.citations.map((cite, idx) => {
                  const isExpanded = expandedCitation === idx;
                  return (
                    <div key={idx} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setExpandedCitation(isExpanded ? null : idx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <FileCheck2 className="w-3 h-3 text-indigo-500" />
                        <span>
                          {cite.documentTitle} (Page {cite.pageNumber})
                        </span>
                        <span className="text-[10px] text-indigo-500/80 font-bold ml-0.5">
                          {Math.round(cite.similarityScore * 100)}% match
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-0.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 italic animate-in fade-in">
                          &ldquo;{cite.snippet}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message Footer Controls */}
        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400">
          <span>CampusFlow Grounded RAG</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 gap-1 px-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Quiz Card Component with immediate reveal and explanation
 */
function InteractiveQuizCard({ question, index }: { question: QuizQuestion; index: number }) {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
      <div className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index}
        </span>
        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
          {question.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-2 pt-1">
        {question.options.map((opt, optIdx) => {
          let btnStyle = "border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400";

          if (isAnswered) {
            if (optIdx === question.correctIndex) {
              btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold";
            } else if (optIdx === selectedOption) {
              btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200";
            } else {
              btnStyle = "opacity-50 border-zinc-200 dark:border-zinc-800";
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isAnswered}
              onClick={() => setSelectedOption(optIdx)}
              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && optIdx === question.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              {isAnswered && optIdx === selectedOption && optIdx !== question.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation reveal */}
      {isAnswered && (
        <div
          className={`p-3 rounded-xl text-xs space-y-1 animate-in fade-in duration-200 border ${
            isCorrect
              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
              : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200"
          }`}
        >
          <div className="font-bold flex items-center gap-1.5">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Incorrect — Explanation:</span>
              </>
            )}
          </div>
          <p className="leading-relaxed opacity-95">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Parses markdown headers, code blocks, bold text, and lists into structured React nodes
 */
function formatMarkdownContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  lines.forEach((line, i) => {
    // Code block check
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code_${i}`} className="my-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-3.5 text-zinc-100 font-mono text-xs overflow-x-auto shadow-inner">
            <pre className="m-0">{codeBuffer.join("\n")}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-zinc-900 dark:text-zinc-50 pt-2 pb-0.5">
          {line.replace("### ", "")}
        </h3>
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 pt-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
          {line.replace("## ", "")}
        </h2>
      );
      return;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-xs italic text-zinc-600 dark:text-zinc-400 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-r-lg">
          {line.replace("> ", "")}
        </blockquote>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const cleanLine = line.trim().replace(/^[\*\-]\s+/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
          <span>{renderFormattedSpans(cleanLine)}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={i} className="my-1">
        {renderFormattedSpans(line)}
      </p>
    );
  });

  return elements;
}

/**
 * Handles inline bold and inline code
 */
function renderFormattedSpans(text: string): React.ReactNode {
  // Simple regex for bold (**bold**) and inline code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
