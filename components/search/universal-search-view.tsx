"use client";

import * as React from "react";
import { searchAction } from "@/features/search/actions";
import { UniversalSearchResponse, DataSourceType } from "@/services/search/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Sparkles,
  Globe,
  BookOpen,
  Building2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Layers,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

interface UniversalSearchViewProps {
  initialQuery?: string;
  targetNoteId?: string;
}

export function UniversalSearchView({ initialQuery = "", targetNoteId = "ALL" }: UniversalSearchViewProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [activeQuery, setActiveQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchStep, setSearchStep] = React.useState<string>("");
  const [result, setResult] = React.useState<UniversalSearchResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [history, setHistory] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    "Explain CPU scheduling algorithms with formulas",
    "deadlock kya hota hai aur banker algorithm kaise kaam karta hai?",
    "What are the latest 2026 tech trends and Next.js features?",
    "Compare 3NF and BCNF normalization with examples",
  ]);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const initialQueryExecutedRef = React.useRef(false);

  const handleSearch = React.useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      setActiveQuery(q);
      setSearchStep("Analyzing query intent & language...");

      // Simulated progress milestones for transparency
      const stepTimer1 = setTimeout(() => {
        setSearchStep("Dispatching multi-source retrieval (Web, Course RAG, DB)...");
      }, 400);

      const stepTimer2 = setTimeout(() => {
        setSearchStep("Evaluating evidence & detecting source consensus...");
      }, 800);

      try {
        const res = await searchAction({
          query: q,
          targetNoteId,
          history,
        });

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        if (!res.success || !res.data) {
          setError(res.message || "Search failed. Please try again.");
        } else {
          const searchData = res.data;
          setResult(searchData);
          // Append to conversational history for follow-ups
          setHistory((prev) => [
            ...prev,
            { role: "user", content: q },
            { role: "assistant", content: searchData.answerMarkdown },
          ]);

          // Add to recent searches
          setRecentSearches((prev) => {
            const next = [q, ...prev.filter((item) => item !== q)];
            return next.slice(0, 6);
          });
        }
      } catch {
        setError("An unexpected network error occurred while researching.");
      } finally {
        setIsLoading(false);
        setSearchStep("");
      }
    },
    [isLoading, targetNoteId, history]
  );

  React.useEffect(() => {
    if (initialQuery && !initialQueryExecutedRef.current) {
      initialQueryExecutedRef.current = true;
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (activeQuery) {
      handleSearch(activeQuery);
    }
  };

  const renderSourceTypeBadge = (type: DataSourceType) => {
    switch (type) {
      case "LIVE_WEB":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Globe className="w-2.5 h-2.5" />
            Live Web
          </span>
        );
      case "DOCUMENT_RAG":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-2.5 h-2.5" />
            Course Material
          </span>
        );
      case "CAMPUSFLOW_DB":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Building2 className="w-2.5 h-2.5" />
            CampusFlow
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            <Sparkles className="w-2.5 h-2.5" />
            AI Reasoning
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal AI Search • Multi-Source & Multilingual</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Ask CampusFlow
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Type natural-language questions in English, Hindi, or Hinglish. Automatically cross-references your course notes, accredited syllabus, and live web research.
        </p>
      </div>

      {/* Main Search Input Box */}
      <Card className="p-3 sm:p-4 bg-white dark:bg-zinc-900 shadow-md border-zinc-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex flex-col gap-3"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything: 'Explain Round Robin scheduling', 'Google L4 interview questions', 'deadlock kya hota hai?'..."
              disabled={isLoading}
              className="w-full pl-11 pr-28 py-3.5 text-sm sm:text-base rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg shadow font-medium text-xs sm:text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </Button>
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-400 dark:text-zinc-500">Quick explore:</span>
            {recentSearches.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-zinc-200/60 dark:border-zinc-800"
              >
                {item}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Real-time Research Progress State */}
      {isLoading && (
        <Card className="p-6 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 border-indigo-200/60 dark:border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                {searchStep || "CampusFlow Universal AI Search is researching..."}
              </p>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                Cross-checking course curriculum, primary documentation, and authoritative web sources.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card className="p-4 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p>{error}</p>
        </Card>
      )}

      {/* Search Result Presentation */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sources Consulted:</span>
              {result.sourcesChosen.map((s, idx) => (
                <React.Fragment key={idx}>{renderSourceTypeBadge(s)}</React.Fragment>
              ))}
              {result.detectedLanguage && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium uppercase">
                  Lang: {result.detectedLanguage}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(result.answerMarkdown)}
                className="h-8 px-2 text-xs text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Answer"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                className="h-8 px-2 text-xs text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </Button>
            </div>
          </div>

          {/* Conflict Notice if detected */}
          {result.conflictsDetected && result.conflictsDetected.length > 0 && (
            <Card className="p-4 bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold">Source Discrepancy Detected:</span>
                  {result.conflictsDetected.map((c, i) => (
                    <p key={i} className="text-amber-800 dark:text-amber-300">
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Sourced Answer Card */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                CF
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                AI Sourced Answer
              </span>
              {result.searchPerformed && (
                <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified via Live Retrieval
                </span>
              )}
            </div>

            {/* Markdown Body */}
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
              {result.answerMarkdown}
            </div>
          </Card>

          {/* Primary Evidence & Citations Panel */}
          {result.citations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 px-1">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Cited Sources & Evidence ({result.citations.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.citations.map((citation, index) => (
                  <Card
                    key={citation.id}
                    className="p-3.5 bg-zinc-50/70 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {citation.title}
                          </span>
                        </div>
                        {renderSourceTypeBadge(citation.sourceType)}
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 italic">
                        &quot;{citation.snippet}&quot;
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{citation.domain || (citation.pageNumber ? `Page ${citation.pageNumber}` : "CampusFlow")}</span>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          <span>Visit Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
            <Card className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Suggested Follow-up Questions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.suggestedFollowUps.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(question);
                      handleSearch(question);
                    }}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span>{question}</span>
                    <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
