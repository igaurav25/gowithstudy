"use client";

import * as React from "react";
import Link from "next/link";
import { NoteItem } from "@/services/notes-service";
import { NoteStatus, NOTE_STATUSES } from "@/schemas/notes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadNoteAsPDF, openNotePDFInNewTab } from "@/lib/pdf-generator";
import {
  X,
  FileText,
  Sparkles,
  Download,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  BookOpen,
  Archive,
  ExternalLink,
  BookMarked,
  Printer,
  HelpCircle,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  FileDown,
  Eye,
  Check,
} from "lucide-react";

interface NotePreviewModalProps {
  note: NoteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: NoteStatus) => void;
  onToggleArchive: (id: string) => void;
}

export function NotePreviewModal({
  note,
  isOpen,
  onClose,
  onStatusChange,
  onToggleArchive,
}: NotePreviewModalProps) {
  const [activeTab, setActiveTab] = React.useState<"notes" | "pdf-view" | "syllabus" | "viva">("notes");
  const [openVivaIndex, setOpenVivaIndex] = React.useState<number | null>(0);
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  if (!isOpen || !note) return null;

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "4.2 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Real client-side Clean PDF download handler
  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      downloadNoteAsPDF(note);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Open PDF in new browser tab for clean full-screen reading or printing
  const handleOpenPDFInNewTab = () => {
    openNotePDFInNewTab(note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {note.subject}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Badge variant="secondary" className="text-[10px]">
                  {note.category}
                </Badge>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Badge variant="purple" className="text-[10px] font-bold">
                  PDF Available
                </Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Clean PDF Button */}
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className={`text-xs gap-1.5 transition-all shadow-sm ${
                downloadSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
              }`}
              title="Download publication-quality formatted PDF notes"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>PDF Downloaded!</span>
                </>
              ) : isExportingPDF ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="font-semibold">Download Clean PDF</span>
                </>
              )}
            </Button>

            {/* Print / Open Full PDF in Browser */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenPDFInNewTab}
              className="text-xs gap-1.5 hidden md:flex border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Open full-screen PDF in a new browser tab to view or print"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Print / Open PDF</span>
            </Button>

            {/* Ask AI grounding button */}
            <Link href={`/dashboard/ai?noteId=${note.id}`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI Assistant</span>
              </Button>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close document viewer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-6 py-2.5 bg-zinc-100/60 dark:bg-zinc-950/60 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "notes"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📖 Lecture Reading View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pdf-view")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "pdf-view"
                  ? "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-red-500" />
              <span>📄 Clean PDF Paper Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("syllabus")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "syllabus"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>📑 Syllabus Outline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("viva")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "viva"
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>💡 Exam & Viva Q&A</span>
              {note.vivaQuestions && note.vivaQuestions.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                  {note.vivaQuestions.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 hidden sm:inline">Status:</span>
            <select
              value={note.status}
              onChange={(e) => onStatusChange(note.id, e.target.value as NoteStatus)}
              className="text-xs h-7 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {NOTE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Lecture Reading View */}
        {activeTab === "notes" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Overview Banner */}
            {note.description && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <span className="font-bold">Topic Synopsis: </span>
                {note.description}
              </div>
            )}

            {/* Formatted Full Notes */}
            <div className="prose dark:prose-invert max-w-none space-y-4">
              {renderFormattedLectureNotes(note.fullNotesText || "Detailed study notes available in CampusFlow Reader.")}
            </div>
          </div>
        )}

        {/* Tab 2: Clean PDF Paper Sheet View */}
        {activeTab === "pdf-view" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-200/60 dark:bg-zinc-950 flex flex-col items-center">
            {/* Floating Quick Action Bar */}
            <div className="w-full max-w-3xl mb-4 flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Clean A4 Printable Document
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 h-8"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Save as PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenPDFInNewTab}
                  className="text-xs gap-1.5 h-8"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </Button>
              </div>
            </div>

            {/* Physical A4 Paper Sheet Simulation */}
            <div className="w-full max-w-3xl bg-white text-zinc-900 shadow-2xl rounded-sm border border-zinc-300 p-8 sm:p-14 space-y-6 font-serif leading-relaxed">
              {/* Top Indigo Strip */}
              <div className="h-1.5 bg-indigo-600 -mx-8 -mt-8 sm:-mx-14 sm:-mt-14 mb-8" />

              {/* University / Platform Header */}
              <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] tracking-widest font-sans font-bold text-indigo-700 uppercase">
                    CampusFlow Academic Study Material
                  </p>
                  <h1 className="text-2xl font-bold font-sans text-zinc-900 mt-1">
                    {note.title}
                  </h1>
                  <p className="text-xs font-sans text-indigo-600 font-semibold mt-1">
                    {note.subject} • B.Tech Computer Science & Engineering
                  </p>
                </div>
                <div className="text-right text-[11px] font-sans text-zinc-500 shrink-0">
                  <p className="font-bold text-zinc-800">Verified Study Doc</p>
                  <p>{formattedDate}</p>
                  <p className="text-indigo-600 font-medium">Standard A4 Format</p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 rounded border border-zinc-200 font-sans text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Course</span>
                  <span className="font-bold text-zinc-800">{note.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Category</span>
                  <span className="font-bold text-zinc-800">{note.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Study Status</span>
                  <span className="font-bold text-emerald-700">{note.status.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Format</span>
                  <span className="font-bold text-red-600">Vector PDF</span>
                </div>
              </div>

              {/* Document Overview */}
              {note.description && (
                <div className="space-y-1.5 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    1. Executive Overview
                  </h3>
                  <p className="text-xs text-zinc-700 bg-indigo-50/40 p-3 rounded border border-indigo-100 leading-relaxed">
                    {note.description}
                  </p>
                </div>
              )}

              {/* Key Topics */}
              {note.syllabusTopics && note.syllabusTopics.length > 0 && (
                <div className="space-y-2 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    2. Syllabus Topics Covered
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {note.syllabusTopics.map((top, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-zinc-50 rounded border border-zinc-200">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-zinc-800 truncate">{top}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Notes Body */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 font-sans border-b pb-1">
                  3. Detailed Lecture Concepts & Technical Analysis
                </h3>
                <div className="text-xs text-zinc-800 leading-relaxed space-y-3 font-serif">
                  {renderFormattedLectureNotes(note.fullNotesText || "Detailed study material ready for review.")}
                </div>
              </div>

              {/* Exam Q&A Preview */}
              {note.vivaQuestions && note.vivaQuestions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-zinc-200 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    4. University Exam & Viva Questions
                  </h3>
                  <div className="space-y-3 text-xs">
                    {note.vivaQuestions.slice(0, 3).map((v, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-1">
                        <p className="font-bold text-zinc-900">Q{idx + 1}: {v.question}</p>
                        <p className="text-zinc-700">{v.answer}</p>
                        {v.tip && (
                          <p className="text-[11px] text-amber-800 italic bg-amber-50 p-1.5 rounded">
                            💡 Examiner Tip: {v.tip}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="pt-8 border-t border-zinc-200 flex justify-between items-center text-[10px] font-sans text-zinc-400">
                <span>CampusFlow Verified Academic Repository</span>
                <span>Page 1 of Printable PDF • Educational Use Only</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Syllabus Outline */}
        {activeTab === "syllabus" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Semester Course Syllabus Alignment</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                These lecture notes map directly to the accredited {note.subject} university exam curriculum.
              </p>
            </div>

            <div className="space-y-3">
              {(note.syllabusTopics || [
                "Fundamental Architecture & Operating Principles",
                "Mathematical Formulations & Complexities",
                "Standard Algorithms & Data Structures",
                "Practical Implementation & Edge Cases",
                "Semester Examination Numerical Problems",
              ]).map((topic, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {topic}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Core learning objective covered in this notes module.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Exam & Viva Q&A */}
        {activeTab === "viva" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Top University Examination & Viva Voce Questions</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Frequently asked by college professors and external examiners during lab evaluations and semester vivas.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {(note.vivaQuestions && note.vivaQuestions.length > 0
                ? note.vivaQuestions
                : [
                    {
                      question: `Explain the fundamental concept of ${note.title}?`,
                      answer: `This topic forms the backbone of ${note.subject}. Refer to the complete study notes for exact definitions and equations.`,
                      tip: "Always write the mathematical formula and draw a clean block diagram first.",
                    },
                  ]
              ).map((viva, idx) => {
                const isOpen = openVivaIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenVivaIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {viva.question}
                        </h4>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 space-y-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            Model Answer:
                          </p>
                          <p>{viva.answer}</p>
                        </div>

                        {viva.tip && (
                          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <span className="font-bold shrink-0">💡 Examiner Tip:</span>
                            <span className="opacity-95">{viva.tip}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags: {note.tags.join(", ") || "General"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              className="text-xs gap-1.5 h-8 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-xs h-8">
              Close Reader
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Rich Formatter for Lecture Notes
 */
function renderFormattedLectureNotes(content: string) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        nodes.push(
          <div
            key={`code_${idx}`}
            className="my-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-xs font-mono text-zinc-100 overflow-x-auto shadow-inner"
          >
            <pre className="m-0 leading-relaxed">{codeBuffer.join("\n")}</pre>
          </div>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3
          key={idx}
          className="text-sm font-bold text-indigo-600 dark:text-indigo-400 pt-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800"
        >
          {trimmed.replace("### ", "")}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2
          key={idx}
          className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-4 pb-1.5"
        >
          {trimmed.replace("## ", "")}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1
          key={idx}
          className="text-lg font-black text-zinc-950 dark:text-white pt-5 pb-2"
        >
          {trimmed.replace("# ", "")}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      nodes.push(
        <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          <span>{renderFormattedSpans(trimmed.replace(/^[\-\*]\s+/, ""))}</span>
        </div>
      );
      return;
    }

    if (!trimmed) {
      nodes.push(<div key={idx} className="h-2" />);
      return;
    }

    nodes.push(
      <p key={idx} className="my-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {renderFormattedSpans(line)}
      </p>
    );
  });

  return nodes;
}

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
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
