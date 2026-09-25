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
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Terminal,
} from "lucide-react";

interface ChatMessageItemProps {
  message: AIMessage;
  onSelectSuggestion?: (prompt: string) => void;
  onRegenerate?: () => void;
}

export function ChatMessageItem({
  message,
  onSelectSuggestion,
  onRegenerate,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [expandedCitation, setExpandedCitation] = React.useState<number | null>(null);
  const [userRating, setUserRating] = React.useState<"up" | "down" | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  // Copy full response to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Browser Text-To-Speech (Read Aloud)
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        message.content.replace(/[`*#|>-]/g, " ")
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speech if unmounting
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10 text-xs sm:text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Generate dynamic follow-up suggestions if not explicitly set
  const followUps =
    message.followUps && message.followUps.length > 0
      ? message.followUps
      : !message.isStreaming && message.content.length > 50
      ? [
          "Explain this with a real-world analogy",
          "What are the top 3 semester viva questions on this?",
          "Can you provide a clean code implementation?",
        ]
      : [];

  return (
    <div className="flex gap-3.5 items-start animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Assistant Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Main Content Box */}
        <div className="p-5 rounded-3xl rounded-tl-sm border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-3">
          {/* Thinking / Streaming Indicator */}
          {message.isStreaming && !message.content ? (
            <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
              </div>
              <span className="font-medium text-zinc-400">
                Grounding in study notes & typing response...
              </span>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-2">
              {formatMarkdownContent(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 align-middle bg-indigo-500 animate-pulse font-mono font-bold">
                  ▋
                </span>
              )}
            </div>
          )}

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
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 animate-in fade-in duration-150">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                            Exact Note Excerpt:
                          </p>
                          <p className="italic">{cite.snippet}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ChatGPT Action Buttons Bar (Copy, Thumbs, Read Aloud, Regenerate) */}
        {!message.isStreaming && message.content && (
          <div className="flex items-center justify-between gap-2 px-2 flex-wrap">
            <div className="flex items-center gap-1">
              {/* Copy Full Response */}
              <button
                type="button"
                onClick={handleCopy}
                className="h-7 px-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                title="Copy full response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Read Aloud (Voice) */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`h-7 px-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  isSpeaking
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                    : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                title={isSpeaking ? "Stop reading" : "Read aloud (Listen to answer)"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>

              {/* Thumbs Up Rating */}
              <button
                type="button"
                onClick={() => setUserRating(userRating === "up" ? null : "up")}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                  userRating === "up"
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down Rating */}
              <button
                type="button"
                onClick={() => setUserRating(userRating === "down" ? null : "down")}
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                  userRating === "down"
                    ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                    : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                title="Bad response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Regenerate if handler provided */}
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="h-7 px-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                  title="Regenerate answer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <span className="text-[10px] text-zinc-400">Grounded via CampusFlow RAG</span>
          </div>
        )}

        {/* ChatGPT-style Quick Follow-Up Suggestion Pills */}
        {!message.isStreaming && followUps.length > 0 && onSelectSuggestion && (
          <div className="flex flex-wrap gap-2 pt-1 pl-1">
            {followUps.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => onSelectSuggestion(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>{suggestion}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        )}
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
 * ChatGPT-Grade Code Block Component with Copy Button and Language Banner
 */
function ChatGPTCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl">
      {/* Code Header Bar */}
      <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            {language || "CODE"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto font-mono text-xs text-zinc-100 leading-relaxed">
        <pre className="m-0">{code}</pre>
      </div>
    </div>
  );
}

/**
 * Parses markdown headers, code blocks, bold text, lists, and tables into structured React nodes
 */
function formatMarkdownContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (keyIdx: number) => {
    if (tableRows.length === 0) return;

    const headers = tableRows[0];
    const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[\-:]+$/)));

    elements.push(
      <div key={`tbl_${keyIdx}`} className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold">
            <tr>
              {headers.map((h, hIdx) => (
                <th key={hIdx} className="px-3 py-2">
                  {renderFormattedSpans(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
            {dataRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? "bg-white dark:bg-zinc-900/40" : "bg-zinc-50/50 dark:bg-zinc-850/40"}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                    {renderFormattedSpans(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    // Code block check
    if (line.startsWith("```")) {
      if (inTable) flushTable(i);

      if (inCodeBlock) {
        elements.push(
          <ChatGPTCodeBlock
            key={`code_${i}`}
            code={codeBuffer.join("\n")}
            language={codeLang}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table Check (lines with pipes)
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(i);
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-zinc-900 dark:text-zinc-50 pt-2.5 pb-0.5">
          {renderFormattedSpans(line.replace("### ", ""))}
        </h3>
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 pt-3.5 pb-1 border-b border-zinc-100 dark:border-zinc-800">
          {renderFormattedSpans(line.replace("## ", ""))}
        </h2>
      );
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-lg font-black text-zinc-950 dark:text-white pt-4 pb-1.5">
          {renderFormattedSpans(line.replace("# ", ""))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-indigo-500 pl-3 py-1.5 my-2 text-xs italic text-zinc-600 dark:text-zinc-400 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-r-lg">
          {renderFormattedSpans(line.replace("> ", ""))}
        </blockquote>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const cleanLine = line.trim().replace(/^[\*\-]\s+/, "");
      elements.push(
        <div key={i} className="flex items-start gap-2.5 ml-2 my-1 text-xs sm:text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
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
      <p key={i} className="my-1 leading-relaxed">
        {renderFormattedSpans(line)}
      </p>
    );
  });

  if (inTable) {
    flushTable(lines.length);
  }

  return elements;
}

/**
 * Handles inline bold and inline code
 */
function renderFormattedSpans(text: string): React.ReactNode {
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
