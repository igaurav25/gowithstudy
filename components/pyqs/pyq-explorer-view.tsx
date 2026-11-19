"use client";

import * as React from "react";
import { PYQPaperItem, PYQQuestionItem } from "@/schemas/pyq";
import { solvePYQQuestionAction } from "@/features/pyqs/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileText,
  Search,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  X,
  Copy,
} from "lucide-react";

interface PYQExplorerViewProps {
  initialPapers: PYQPaperItem[];
}

export function PYQExplorerView({ initialPapers }: PYQExplorerViewProps) {
  const [papers] = React.useState<PYQPaperItem[]>(initialPapers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("ALL");
  const [selectedExamType, setSelectedExamType] = React.useState("ALL");

  // Selected paper modal
  const [activePaper, setActivePaper] = React.useState<PYQPaperItem | null>(null);

  // Active question solution loading
  const [solvingQuestionId, setSolvingQuestionId] = React.useState<string | null>(null);
  const [solvedAnswers, setSolvedAnswers] = React.useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const subjects = [
    "ALL",
    "Operating Systems",
    "Database Management Systems",
    "Computer Networks",
    "Design & Analysis of Algorithms",
  ];

  // Filter papers locally for ultra-fast instant search
  const filteredPapers = React.useMemo(() => {
    return papers.filter((p) => {
      if (selectedSubject !== "ALL" && !p.subject.toLowerCase().includes(selectedSubject.toLowerCase())) {
        return false;
      }
      if (selectedExamType !== "ALL" && p.examType !== selectedExamType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSubject = p.subject.toLowerCase().includes(q);
        const matchesCode = p.courseCode.toLowerCase().includes(q);
        const matchesQuestions = p.questions.some(
          (qu) => qu.text.toLowerCase().includes(q) || qu.topicTag.toLowerCase().includes(q)
        );
        return matchesTitle || matchesSubject || matchesCode || matchesQuestions;
      }
      return true;
    });
  }, [papers, selectedSubject, selectedExamType, searchQuery]);

  const handleSolveQuestion = async (paperId: string, question: PYQQuestionItem) => {
    if (solvedAnswers[question.id] || question.solvedAnswer) {
      return;
    }

    setSolvingQuestionId(question.id);
    try {
      const res = await solvePYQQuestionAction(paperId, question.id);
      if (res.success && res.data) {
        setSolvedAnswers((prev) => ({
          ...prev,
          [question.id]: res.data!.answer,
        }));
      }
    } catch (err) {
      console.error("Failed to solve question:", err);
    } finally {
      setSolvingQuestionId(null);
    }
  };

  const handleCopyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-violet-50/40 to-sky-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-950 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Exam Preparation Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Previous Year Questions (PYQs)
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Real university end-semester and mid-term examination papers. Practice genuine exam questions with on-demand AI model solutions grounded in your syllabus.
          </p>
        </div>
      </section>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search questions (e.g. Banker's, BCNF, TCP, Knapsack)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Subject Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
          {subjects.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[36px]",
                selectedSubject === subj
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {subj === "ALL" ? "All Subjects" : subj}
            </button>
          ))}
        </div>

        {/* Exam Type Filter */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
          <span className="text-xs font-medium text-zinc-500 shrink-0">Exam:</span>
          {(["ALL", "END_SEM", "MID_SEM"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedExamType(type)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all touch-manipulation min-h-[32px] shrink-0",
                selectedExamType === type
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {type === "ALL" ? "All Exams" : type === "END_SEM" ? "End Sem (Major)" : "Mid Sem"}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredPapers.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
            No question papers found matching your filters.
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <Card
              key={paper.id}
              className="border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" className="text-[10px] font-mono">
                        {paper.courseCode}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {paper.examType === "END_SEM" ? "End-Semester Major" : "Mid-Term"}
                      </Badge>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {paper.year}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {paper.title}
                    </CardTitle>
                    <p className="text-xs text-zinc-500">{paper.university}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Highlights */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{paper.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{paper.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{paper.questions.length} Questions</span>
                  </div>
                </div>

                {/* Question preview snippets */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Sample Questions:
                  </p>
                  {paper.questions.slice(0, 2).map((q) => (
                    <div
                      key={q.id}
                      className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-1 flex items-center gap-2"
                    >
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                        {q.questionNumber}:
                      </span>
                      <span className="truncate">{q.text}</span>
                    </div>
                  ))}
                </div>

                {/* View and Solve Button */}
                <Button
                  onClick={() => setActivePaper(paper)}
                  variant="gradient"
                  className="w-full text-xs gap-1.5 min-h-[44px] touch-manipulation"
                >
                  <span>Open Paper & Solve Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Interactive Paper Detail Modal */}
      {activePaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="purple" className="text-xs font-mono">
                    {activePaper.courseCode}
                  </Badge>
                  <span className="text-xs text-zinc-500 font-medium">
                    {activePaper.subject} • Semester {activePaper.semester} ({activePaper.year})
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {activePaper.title}
                </h3>
                <p className="text-xs text-zinc-500">
                  Total Time: {activePaper.durationMinutes} mins | Maximum Marks: {activePaper.totalMarks}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActivePaper(null)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  All Examination Questions ({activePaper.questions.length})
                </h4>
                <p className="text-xs text-zinc-500">
                  Click &ldquo;Solve with AI&rdquo; on any question for a verified model solution with marking breakdown.
                </p>
              </div>

              <div className="space-y-4">
                {activePaper.questions.map((q) => {
                  const solution = solvedAnswers[q.id] || q.solvedAnswer;
                  const isSolving = solvingQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40 space-y-3"
                    >
                      {/* Question Top Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {q.questionNumber}
                            </span>
                            <Badge variant="secondary" className="text-[10px] py-0">
                              {q.topicTag}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {q.text}
                          </p>
                        </div>
                        <span className="text-xs font-bold font-mono text-zinc-500 shrink-0">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {/* Solve Action / Solution Area */}
                      {solution ? (
                        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/60 space-y-2 mt-2">
                          <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Model Examination Answer</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAnswer(q.id, solution)}
                              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-indigo-600"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedId === q.id ? "Copied!" : "Copy Solution"}</span>
                            </button>
                          </div>
                          <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line prose dark:prose-invert max-w-none">
                            {solution}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 flex items-center justify-end">
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleSolveQuestion(activePaper.id, q)}
                            disabled={isSolving}
                            className="text-xs gap-1.5 min-h-[38px] touch-manipulation"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isSolving ? "Synthesizing Answer..." : "Solve with AI"}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500">
              <span>GoWithStudy Academic PYQ Repository</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePaper(null)}
              >
                Close Paper
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
